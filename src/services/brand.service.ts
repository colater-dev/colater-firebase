import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  Firestore,
  CollectionReference,
  DocumentReference,
  Query,
  query,
  orderBy
} from 'firebase/firestore';
import type { Brand } from '@/lib/types';

/**
 * Service layer for brand-related operations.
 * Provides an abstraction over Firestore operations.
 */
export class BrandService {
  constructor(private firestore: Firestore) {}

  /**
   * Get the brands collection reference for a user
   */
  getBrandsCollection(userId: string): CollectionReference {
    return collection(this.firestore, `users/${userId}/brands`);
  }

  /**
   * Get a query for all brands of a user, ordered by creation date
   */
  getBrandsQuery(userId: string): Query {
    return query(
      this.getBrandsCollection(userId),
      orderBy('createdAt', 'desc')
    );
  }

  /**
   * Get a brand document reference
   */
  getBrandDoc(userId: string, brandId: string): DocumentReference {
    return doc(this.firestore, `users/${userId}/brands/${brandId}`);
  }

  /**
   * Create a new brand
   */
  async createBrand(
    userId: string,
    brandData: {
      latestName: string;
      latestElevatorPitch: string;
      latestAudience: string;
      latestDesirableCues?: string;
      latestUndesirableCues?: string;
    }
  ): Promise<string> {
    const brandsCollection = this.getBrandsCollection(userId);

    const docData = {
      userId,
      createdAt: serverTimestamp(),
      latestName: brandData.latestName,
      latestElevatorPitch: brandData.latestElevatorPitch,
      latestAudience: brandData.latestAudience,
      latestDesirableCues: brandData.latestDesirableCues || '',
      latestUndesirableCues: brandData.latestUndesirableCues || '',
    };

    const docRef = await addDoc(brandsCollection, docData);
    return docRef.id;
  }

  /**
   * Update a brand's details
   */
  async updateBrand(
    userId: string,
    brandId: string,
    updates: Partial<Omit<Brand, 'id' | 'userId' | 'createdAt'>>
  ): Promise<void> {
    const brandDoc = this.getBrandDoc(userId, brandId);
    await updateDoc(brandDoc, updates);
  }

  /**
   * Update a brand's logo URL
   */
  async updateBrandLogo(
    userId: string,
    brandId: string,
    logoUrl: string
  ): Promise<void> {
    const brandDoc = this.getBrandDoc(userId, brandId);
    await updateDoc(brandDoc, { logoUrl });
  }

  /**
   * Update a brand's primary tagline
   */
  async updateBrandTagline(
    userId: string,
    brandId: string,
    primaryTagline: string
  ): Promise<void> {
    const brandDoc = this.getBrandDoc(userId, brandId);
    await updateDoc(brandDoc, { primaryTagline });
  }

  /**
   * Delete a brand
   */
  async deleteBrand(userId: string, brandId: string): Promise<void> {
    const brandDoc = this.getBrandDoc(userId, brandId);
    await deleteDoc(brandDoc);
  }
}

/**
 * Factory function to create a BrandService instance
 */
export function createBrandService(firestore: Firestore): BrandService {
  return new BrandService(firestore);
}
