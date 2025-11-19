/**
 * Utility to get a cached image URL through Next.js image proxy
 * This enables browser caching and faster subsequent loads
 */
export function getCachedImageUrl(firebaseUrl: string | null | undefined): string | null {
    if (!firebaseUrl) return null;

    // If it's a data URL, return as-is (no caching needed)
    if (firebaseUrl.startsWith('data:')) {
        return firebaseUrl;
    }

    // Proxy through our API route for caching
    return `/api/image-proxy?url=${encodeURIComponent(firebaseUrl)}`;
}

/**
 * Preload an image to cache it
 */
export function preloadImage(url: string): void {
    if (typeof window === 'undefined') return;

    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = url;
    document.head.appendChild(link);
}
