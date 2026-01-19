/**
 * API Key Service
 * Manages brand-specific API keys for MCP server access
 */

import { Firestore, Timestamp } from 'firebase/firestore';
import { collection, doc, addDoc, updateDoc, query, where, getDocs, deleteDoc, serverTimestamp } from 'firebase/firestore';
import crypto from 'crypto';

export interface BrandAPIKey {
  id?: string;
  userId: string;
  brandId: string;
  name: string;
  keyHash: string; // bcrypt hash of the key
  keyPrefix: string; // First 8 chars for display: "colater_..."
  permissions: {
    read: boolean;
    validate: boolean;
    generate: boolean;
    modify: boolean;
  };
  createdAt: Timestamp;
  expiresAt?: Timestamp;
  lastUsedAt?: Timestamp;
  usageCount: number;
  revokedAt?: Timestamp;
}

export interface APIKeyPermissions {
  read: boolean;
  validate: boolean;
  generate: boolean;
  modify: boolean;
}

const DEFAULT_PERMISSIONS: Record<string, APIKeyPermissions> = {
  owner: {
    read: true,
    validate: true,
    generate: true,
    modify: true,
  },
  team: {
    read: true,
    validate: true,
    generate: false,
    modify: false,
  },
  developer: {
    read: true,
    validate: false,
    generate: true,
    modify: false,
  },
};

/**
 * Generate a secure API key
 * Format: colater_sk_brand_{brandId}_{random32}
 */
function generateAPIKey(brandId: string): string {
  const randomBytes = crypto.randomBytes(16);
  const randomString = randomBytes.toString('hex'); // 32 chars
  return `colater_sk_brand_${brandId}_${randomString}`;
}

/**
 * Hash an API key using SHA-256 (for server-side Node.js)
 * In a production app, you'd use bcrypt, but for simplicity we use SHA-256
 */
export function hashAPIKey(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex');
}

/**
 * Create API Key Service
 */
export function createAPIKeyService(firestore: Firestore) {
  /**
   * Get API keys collection path
   */
  function getAPIKeysCollection(userId: string, brandId: string) {
    return collection(firestore, `users/${userId}/brands/${brandId}/apiKeys`);
  }

  /**
   * Create a new brand-specific API key
   */
  async function createBrandAPIKey(
    userId: string,
    brandId: string,
    name: string,
    permissionType: 'owner' | 'team' | 'developer' = 'team',
    expiresInDays?: number
  ): Promise<{ key: string; keyId: string }> {
    // Generate the key
    const key = generateAPIKey(brandId);
    const keyHash = hashAPIKey(key);
    const keyPrefix = key.substring(0, 20) + '...'; // colater_sk_brand_abc...

    // Calculate expiration
    let expiresAt: Timestamp | undefined;
    if (expiresInDays) {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + expiresInDays);
      expiresAt = Timestamp.fromDate(expiryDate);
    }

    // Create API key document
    const apiKeyData = {
      userId,
      brandId,
      name,
      keyHash,
      keyPrefix,
      permissions: DEFAULT_PERMISSIONS[permissionType],
      createdAt: serverTimestamp(),
      expiresAt,
      usageCount: 0,
    };

    const apiKeysCollection = getAPIKeysCollection(userId, brandId);
    const docRef = await addDoc(apiKeysCollection, apiKeyData);

    return {
      key, // Return plain key only once
      keyId: docRef.id,
    };
  }

  /**
   * List API keys for a brand
   */
  async function listBrandAPIKeys(
    userId: string,
    brandId: string,
    includeRevoked: boolean = false
  ): Promise<BrandAPIKey[]> {
    const apiKeysCollection = getAPIKeysCollection(userId, brandId);
    let q = query(apiKeysCollection);

    if (!includeRevoked) {
      q = query(apiKeysCollection, where('revokedAt', '==', null));
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as BrandAPIKey[];
  }

  /**
   * Revoke an API key
   */
  async function revokeBrandAPIKey(
    userId: string,
    brandId: string,
    keyId: string
  ): Promise<void> {
    const keyDoc = doc(firestore, `users/${userId}/brands/${brandId}/apiKeys/${keyId}`);
    await updateDoc(keyDoc, {
      revokedAt: serverTimestamp(),
    });
  }

  /**
   * Delete an API key
   */
  async function deleteBrandAPIKey(
    userId: string,
    brandId: string,
    keyId: string
  ): Promise<void> {
    const keyDoc = doc(firestore, `users/${userId}/brands/${brandId}/apiKeys/${keyId}`);
    await deleteDoc(keyDoc);
  }

  /**
   * Update API key usage
   */
  async function incrementAPIKeyUsage(
    userId: string,
    brandId: string,
    keyId: string
  ): Promise<void> {
    const keyDoc = doc(firestore, `users/${userId}/brands/${brandId}/apiKeys/${keyId}`);
    await updateDoc(keyDoc, {
      lastUsedAt: serverTimestamp(),
      usageCount: (await getDocs(query(collection(firestore, `users/${userId}/brands/${brandId}/apiKeys`), where('__name__', '==', keyId)))).docs[0]?.data()?.usageCount + 1 || 1,
    });
  }

  return {
    createBrandAPIKey,
    listBrandAPIKeys,
    revokeBrandAPIKey,
    deleteBrandAPIKey,
    incrementAPIKeyUsage,
  };
}
