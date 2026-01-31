

export function getProxyUrl(url: string | undefined | null): string {
    if (!url) return '';
    if (url.startsWith('data:') || url.startsWith('/')) {
        return url;
    }
    // Use Next.js image optimization as a proxy to avoid CORS issues
    // We request a standard width and high quality
    // Standard Next.js widths include 1080, 1200, 1920, 2048
    return `/_next/image?url=${encodeURIComponent(url)}&w=1200&q=80`;
}

/**
 * Convert an image URL to a data URI to bypass CORS restrictions
 * This is more reliable than the Next.js proxy for canvas operations
 */
async function urlToDataUri(url: string): Promise<string> {
    try {
        if (!url) return '';
        // First try to use the image directly if it's already a data URI
        if (url.startsWith('data:')) {
            return url;
        }

        const proxyUrl = getProxyUrl(url);
        if (!proxyUrl) return url; // Return original URL as fallback

        // Try to fetch through proxy
        let response: Response | null = null;
        try {
            response = await fetch(proxyUrl);
        } catch (e) {
            console.warn(`Proxy fetch error for ${url}:`, e);
        }

        // Fallback: If proxy fails, try to fetch directly
        if (!response?.ok) {
            console.warn(`Proxy fetch failed for ${url} (Status: ${response?.status}). Trying direct fetch...`);
            try {
                response = await fetch(url);
            } catch (e) {
                console.warn(`Direct fetch error for ${url}:`, e);
                return url; // Return original URL as fallback
            }
        }

        if (!response?.ok) {
            console.warn(`Failed to fetch image data. Status: ${response?.status}. Returning original URL.`);
            return url; // Return original URL as fallback
        }

        const blob = await response.blob();
        return new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = () => resolve(url); // Return original URL on read error
            reader.readAsDataURL(blob);
        });
    } catch (error) {
        console.error('Error converting URL to data URI:', error);
        return url; // Return original URL as fallback instead of throwing
    }
}

export async function cropImageToContent(
    imageUrl: string,
    cropDetails?: { x: number; y: number; width: number; height: number }
): Promise<string> {
    try {
        // Convert to data URI first to avoid CORS issues
        const dataUri = await urlToDataUri(imageUrl);

        return new Promise((resolve, reject) => {
            const img = new Image();
            // No need for crossOrigin when using data URI

            img.onload = () => {
                try {
                    const canvas = document.createElement('canvas');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    const ctx = canvas.getContext('2d');
                    if (!ctx) {
                        console.error('Could not get canvas context');
                        resolve(imageUrl);
                        return;
                    }
                    ctx.drawImage(img, 0, 0);

                    let minX = canvas.width;
                    let minY = canvas.height;
                    let maxX = 0;
                    let maxY = 0;

                    if (cropDetails) {
                        minX = cropDetails.x;
                        minY = cropDetails.y;
                        // maxX and maxY are not needed if we use width/height directly
                    } else {
                        // Get image data
                        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                        const data = imageData.data;

                        let foundContent = false;

                        // Assume top-left pixel is background color
                        const bgR = data[0];
                        const bgG = data[1];
                        const bgB = data[2];
                        const bgA = data[3];

                        // Threshold for difference to consider as content
                        // 30 is a reasonable starting point for "significant difference"
                        const threshold = 30;

                        // Iterate over pixels
                        for (let y = 0; y < canvas.height; y++) {
                            for (let x = 0; x < canvas.width; x++) {
                                const i = (y * canvas.width + x) * 4;
                                const r = data[i];
                                const g = data[i + 1];
                                const b = data[i + 2];
                                const a = data[i + 3];

                                // Skip fully transparent pixels if background is transparent
                                if (bgA === 0 && a === 0) continue;

                                // Calculate difference from background
                                // Using simple Manhattan distance for performance
                                const diff = Math.abs(r - bgR) + Math.abs(g - bgG) + Math.abs(b - bgB) + Math.abs(a - bgA);

                                if (diff > threshold) {
                                    if (x < minX) minX = x;
                                    if (x > maxX) maxX = x;
                                    if (y < minY) minY = y;
                                    if (y > maxY) maxY = y;
                                    foundContent = true;
                                }
                            }
                        }

                        // If no content found, return original
                        if (!foundContent) {
                            console.log('No content found to crop (uniform color)');
                            resolve(imageUrl);
                            return;
                        }

                        console.log(`Cropping image: Original ${canvas.width}x${canvas.height}, Bounds: [${minX}, ${minY}, ${maxX}, ${maxY}]`);

                        // Add small padding
                        const padding = 20;
                        minX = Math.max(0, minX - padding);
                        minY = Math.max(0, minY - padding);
                        maxX = Math.min(canvas.width, maxX + padding);
                        maxY = Math.min(canvas.height, maxY + padding);
                    }

                    const width = cropDetails ? cropDetails.width : (maxX - minX);
                    const height = cropDetails ? cropDetails.height : (maxY - minY);

                    // If the crop is basically the whole image, just return original
                    if (width >= canvas.width - 2 && height >= canvas.height - 2) {
                        console.log('Crop is entire image, returning original');
                        resolve(imageUrl);
                        return;
                    }

                    const cropCanvas = document.createElement('canvas');
                    cropCanvas.width = width;
                    cropCanvas.height = height;
                    const cropCtx = cropCanvas.getContext('2d');
                    if (!cropCtx) {
                        resolve(imageUrl);
                        return;
                    }

                    cropCtx.drawImage(canvas, minX, minY, width, height, 0, 0, width, height);
                    const croppedUrl = cropCanvas.toDataURL();
                    resolve(croppedUrl);
                } catch (e) {
                    console.error('Error during cropping logic:', e);
                    resolve(imageUrl);
                }
            };

            img.onerror = (err) => {
                console.error(`Error loading image for cropping [${imageUrl}]:`, err);
                resolve(imageUrl);
            };

            // Use data URI (no CORS issues)
            img.src = dataUri;

            // Safety timeout to ensure promise always resolves
            setTimeout(() => {
                if (!img.complete || img.naturalWidth === 0) {
                    console.warn(`Crop timeout for ${imageUrl}, resolving with original`);
                    resolve(imageUrl);
                    img.onload = null;
                    img.onerror = null;
                }
            }, 5000);
        });
    } catch (error) {
        console.error('Error in cropImageToContent:', error);
        return imageUrl;
    }
}
