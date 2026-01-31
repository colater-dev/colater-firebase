

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
        if (!proxyUrl) return '';

        // Try to fetch through proxy
        let response = await fetch(proxyUrl);

        // Fallback: If proxy fails (400), try to fetch directly
        // Some buckets might have CORS configured, making the proxy unnecessary
        if (!response.ok) {
            console.warn(`Proxy fetch failed for ${url} (Status: ${response.status}). Trying direct fetch...`);
            response = await fetch(url);
        }

        if (!response.ok) {
            throw new Error(`Failed to fetch image data. Status: ${response.status}`);
        }

        const blob = await response.blob();
        return new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    } catch (error) {
        console.error('Error converting URL to data URI:', error);
        throw error;
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


function loadImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        // No crossOrigin for data URIs
        if (!url.startsWith('data:')) {
            img.crossOrigin = "Anonymous";
        }
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
        img.src = url;
    });
}

export async function createStickerEffect(imageUrl: string, maskSourceUrl?: string): Promise<string> {
    try {
        // Convert URLs to data URIs to avoid CORS issues
        const targetDataUri = await urlToDataUri(imageUrl);
        let targetImg = await loadImage(targetDataUri);

        // Load mask source if different
        let maskImg = targetImg;
        if (maskSourceUrl && maskSourceUrl !== imageUrl) {
            try {
                const maskDataUri = await urlToDataUri(maskSourceUrl);
                maskImg = await loadImage(maskDataUri);
            } catch (e) {
                console.warn('Failed to load mask source, falling back to target image', e);
            }
        }

        // Optimization: Determine processing size (Limit to 1024px)
        const MAX_SIZE = 1024;
        let scale = 1;
        if (targetImg.width > MAX_SIZE || targetImg.height > MAX_SIZE) {
            scale = Math.min(MAX_SIZE / targetImg.width, MAX_SIZE / targetImg.height);
        }

        const width = Math.floor(targetImg.width * scale);
        const height = Math.floor(targetImg.height * scale);

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return imageUrl;

        // Draw mask source to get analysis data
        ctx.drawImage(maskImg, 0, 0, width, height);
        const maskImageData = ctx.getImageData(0, 0, width, height);
        const maskData = maskImageData.data;

        // 1. Identify background color (from mask data)
        const bgR = maskData[0];
        const bgG = maskData[1];
        const bgB = maskData[2];
        const bgA = maskData[3];
        const threshold = 30;

        // 2. Flood fill to identify true background on mask
        const isBackground = new Uint8Array(width * height);
        const queue = new Int32Array(width * height);
        let qHead = 0;
        let qTail = 0;

        const isBgColor = (idx: number) => {
            const i = idx * 4;
            const r = maskData[i];
            const g = maskData[i + 1];
            const b = maskData[i + 2];
            const a = maskData[i + 3];

            if (bgA === 0) return a === 0;
            const diff = Math.abs(r - bgR) + Math.abs(g - bgG) + Math.abs(b - bgB) + Math.abs(a - bgA);
            return diff <= threshold;
        };

        // Seed queue with border pixels
        for (let x = 0; x < width; x++) {
            if (isBgColor(x)) { queue[qTail++] = x; isBackground[x] = 1; }
            const bottomIdx = (height - 1) * width + x;
            if (isBgColor(bottomIdx)) { queue[qTail++] = bottomIdx; isBackground[bottomIdx] = 1; }
        }
        for (let y = 1; y < height - 1; y++) {
            const leftIdx = y * width;
            if (isBgColor(leftIdx)) { queue[qTail++] = leftIdx; isBackground[leftIdx] = 1; }
            const rightIdx = y * width + (width - 1);
            if (isBgColor(rightIdx)) { queue[qTail++] = rightIdx; isBackground[rightIdx] = 1; }
        }

        // BFS to fill background
        while (qHead < qTail) {
            const idx = queue[qHead++];
            const x = idx % width;
            const y = Math.floor(idx / width);

            const neighbors = [
                { nx: x, ny: y - 1 }, { nx: x, ny: y + 1 },
                { nx: x - 1, ny: y }, { nx: x + 1, ny: y }
            ];

            for (const { nx, ny } of neighbors) {
                if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                    const nIdx = ny * width + nx;
                    if (isBackground[nIdx] === 0 && isBgColor(nIdx)) {
                        isBackground[nIdx] = 1;
                        queue[qTail++] = nIdx;
                    }
                }
            }
        }

        // 3. Chamfer Distance Transform
        const dist = new Float32Array(width * height);
        const maxDist = (width + height) * 4;
        for (let i = 0; i < width * height; i++) dist[i] = isBackground[i] === 1 ? maxDist : 0;

        // Forward Pass
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const idx = y * width + x;
                if (dist[idx] === 0) continue;
                let minVal = dist[idx];
                if (x > 0) minVal = Math.min(minVal, dist[idx - 1] + 3);
                if (y > 0) {
                    minVal = Math.min(minVal, dist[idx - width] + 3);
                    if (x > 0) minVal = Math.min(minVal, dist[idx - width - 1] + 4);
                    if (x < width - 1) minVal = Math.min(minVal, dist[idx - width + 1] + 4);
                }
                dist[idx] = minVal;
            }
        }

        // Backward Pass
        for (let y = height - 1; y >= 0; y--) {
            for (let x = width - 1; x >= 0; x--) {
                const idx = y * width + x;
                if (dist[idx] === 0) continue;
                let minVal = dist[idx];
                if (x < width - 1) minVal = Math.min(minVal, dist[idx + 1] + 3);
                if (y < height - 1) {
                    minVal = Math.min(minVal, dist[idx + width] + 3);
                    if (x < width - 1) minVal = Math.min(minVal, dist[idx + width + 1] + 4);
                    if (x > 0) minVal = Math.min(minVal, dist[idx + width - 1] + 4);
                }
                dist[idx] = minVal;
            }
        }

        // 4. Create the sticker composition
        const finalCanvas = document.createElement('canvas');
        finalCanvas.width = width;
        finalCanvas.height = height;
        const finalCtx = finalCanvas.getContext('2d');
        if (!finalCtx) return imageUrl;

        // Draw White Border Shape
        const borderImageData = finalCtx.createImageData(width, height);
        const borderData = borderImageData.data;
        const borderSize = 30; // Constant size at processed resolution

        for (let i = 0; i < width * height; i++) {
            const actualDist = dist[i] / 3.0;
            const idx = i * 4;
            if (actualDist <= borderSize) {
                borderData[idx] = 255; borderData[idx + 1] = 255; borderData[idx + 2] = 255; borderData[idx + 3] = 255;
            } else if (actualDist < borderSize + 1) {
                const alpha = Math.max(0, Math.min(255, (borderSize + 1 - actualDist) * 255));
                borderData[idx] = 255; borderData[idx + 1] = 255; borderData[idx + 2] = 255; borderData[idx + 3] = Math.floor(alpha);
            }
        }
        finalCtx.putImageData(borderImageData, 0, 0);

        // Draw Logo Content (Masked)
        const logoCanvas = document.createElement('canvas');
        logoCanvas.width = width;
        logoCanvas.height = height;
        const logoCtx = logoCanvas.getContext('2d');
        if (logoCtx) {
            logoCtx.drawImage(targetImg, 0, 0, width, height);
            const logoImageData = logoCtx.getImageData(0, 0, width, height);
            const logoData = logoImageData.data;
            for (let i = 0; i < width * height; i++) {
                if (isBackground[i] === 1) logoData[i * 4 + 3] = 0;
            }

            // For B&W logos (self-masked) with dark backgrounds, the content is
            // light/white and invisible against the white sticker border.
            // Invert content pixels here so the logo is visible, rather than
            // relying on a CSS invert filter which also inverts the border.
            const isSelfMasked = !maskSourceUrl || maskSourceUrl === imageUrl;
            if (isSelfMasked) {
                const bgLuminance = 0.299 * bgR + 0.587 * bgG + 0.114 * bgB;
                if (bgLuminance < 128) {
                    for (let i = 0; i < width * height; i++) {
                        if (isBackground[i] === 0) {
                            const idx = i * 4;
                            logoData[idx] = 255 - logoData[idx];
                            logoData[idx + 1] = 255 - logoData[idx + 1];
                            logoData[idx + 2] = 255 - logoData[idx + 2];
                        }
                    }
                }
            }

            logoCtx.putImageData(logoImageData, 0, 0);
            finalCtx.drawImage(logoCanvas, 0, 0);
        }

        return finalCanvas.toDataURL();

    } catch (e) {
        console.error('Error creating sticker effect:', e);
        return imageUrl;
    }
}
