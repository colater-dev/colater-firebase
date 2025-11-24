import { R2_PUBLIC_URL } from "@/lib/r2";

/**
 * Checks if a URL is from Firebase Storage (for backward compatibility)
 */
export function isFirebaseStorageUrl(url: string): boolean {
  return url.includes('firebasestorage.googleapis.com') || url.includes('firebase');
}

/**
 * Checks if a URL is from R2
 */
export function isR2Url(url: string): boolean {
  return url.includes(R2_PUBLIC_URL) || url.includes('.r2.dev');
}

