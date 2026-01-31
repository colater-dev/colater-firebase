/**
 * Sticker Effect Generator
 * Creates a sticker-style cutout with white border from a logo image
 * 
 * Approach: Luminance-based thresholding for high-contrast B&W logos
 * - Detects if logo is black-on-white or white-on-black from corner luminance
 * - Uses simple luminance threshold to create binary mask
 * - Applies distance transform for smooth white border
 */

/**
 * Load an image from a URL or data URI
 */
function loadImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        // Only set crossOrigin for non-data URIs
        if (!url.startsWith('data:')) {
            img.crossOrigin = "Anonymous";
        }
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error(`Failed to load image: ${url.substring(0, 50)}...`));
        img.src = url;
    });
}

/**
 * Get luminance of a pixel (0-255)
 */
function getLuminance(r: number, g: number, b: number): number {
    return 0.299 * r + 0.587 * g + 0.114 * b;
}

/**
 * Create a sticker effect from an image URL
 * 
 * @param imageUrl - The URL of the image to create a sticker from (the content to display)
 * @param maskSourceUrl - Optional URL for mask source (B&W logo used to determine shape)
 * @returns Promise<string> - Data URL of the sticker image
 */
export async function createStickerEffect(imageUrl: string, maskSourceUrl?: string): Promise<string> {
    try {
        // Load target image (expects data URI or CORS-enabled URL)
        const targetImg = await loadImage(imageUrl);

        // Load mask source (B&W logo) if provided
        let maskImg = targetImg;
        if (maskSourceUrl && maskSourceUrl !== imageUrl) {
            try {
                maskImg = await loadImage(maskSourceUrl);
            } catch (e) {
                console.warn('Failed to load mask source, falling back to target image', e);
            }
        }

        // Limit processing size to 1024px for performance
        const MAX_SIZE = 1024;
        let scale = 1;
        if (targetImg.width > MAX_SIZE || targetImg.height > MAX_SIZE) {
            scale = Math.min(MAX_SIZE / targetImg.width, MAX_SIZE / targetImg.height);
        }

        const width = Math.floor(targetImg.width * scale);
        const height = Math.floor(targetImg.height * scale);

        // Canvas for mask analysis
        const maskCanvas = document.createElement('canvas');
        maskCanvas.width = width;
        maskCanvas.height = height;
        const maskCtx = maskCanvas.getContext('2d');
        if (!maskCtx) return imageUrl;

        // Draw mask source
        maskCtx.drawImage(maskImg, 0, 0, width, height);
        const maskImageData = maskCtx.getImageData(0, 0, width, height);
        const maskData = maskImageData.data;

        // Step 1: Detect if background is light or dark by sampling corners
        const offset = 5;
        const corners = [
            { x: offset, y: offset },
            { x: width - 1 - offset, y: offset },
            { x: offset, y: height - 1 - offset },
            { x: width - 1 - offset, y: height - 1 - offset }
        ];

        let totalCornerLuminance = 0;
        for (const { x, y } of corners) {
            const cx = Math.max(0, Math.min(width - 1, x));
            const cy = Math.max(0, Math.min(height - 1, y));
            const idx = (cy * width + cx) * 4;
            totalCornerLuminance += getLuminance(maskData[idx], maskData[idx + 1], maskData[idx + 2]);
        }
        const avgCornerLuminance = totalCornerLuminance / corners.length;
        const isLightBackground = avgCornerLuminance > 128;

        // Step 2: Create binary mask using luminance threshold
        // Content = pixels that differ significantly from background
        const isContent = new Uint8Array(width * height);
        const threshold = 128; // Simple midpoint threshold for high-contrast logos

        for (let i = 0; i < width * height; i++) {
            const idx = i * 4;
            const luminance = getLuminance(maskData[idx], maskData[idx + 1], maskData[idx + 2]);

            if (isLightBackground) {
                // Light background (white) - dark pixels are content
                isContent[i] = luminance < threshold ? 1 : 0;
            } else {
                // Dark background (black) - light pixels are content
                isContent[i] = luminance >= threshold ? 1 : 0;
            }
        }

        // Step 3: Chamfer Distance Transform from content pixels
        // dist[i] = distance from pixel i to nearest content pixel
        const dist = new Float32Array(width * height);
        const maxDist = (width + height) * 4;

        // Initialize: 0 for content pixels, maxDist for background
        for (let i = 0; i < width * height; i++) {
            dist[i] = isContent[i] === 1 ? 0 : maxDist;
        }

        // Forward Pass (Top-Left to Bottom-Right)
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

        // Backward Pass (Bottom-Right to Top-Left)
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

        // Step 4: Create the sticker composition
        const finalCanvas = document.createElement('canvas');
        finalCanvas.width = width;
        finalCanvas.height = height;
        const finalCtx = finalCanvas.getContext('2d');
        if (!finalCtx) return imageUrl;

        // Draw white border shape (pixels within borderSize distance from content)
        const borderImageData = finalCtx.createImageData(width, height);
        const borderData = borderImageData.data;
        const borderSize = 30; // Border thickness in pixels

        for (let i = 0; i < width * height; i++) {
            const actualDist = dist[i] / 3.0; // Normalize Chamfer distance
            const idx = i * 4;

            if (actualDist <= borderSize) {
                // Inside border region - white
                borderData[idx] = 255;
                borderData[idx + 1] = 255;
                borderData[idx + 2] = 255;
                borderData[idx + 3] = 255;
            } else if (actualDist < borderSize + 1) {
                // Anti-aliased edge
                const alpha = Math.max(0, Math.min(255, (borderSize + 1 - actualDist) * 255));
                borderData[idx] = 255;
                borderData[idx + 1] = 255;
                borderData[idx + 2] = 255;
                borderData[idx + 3] = Math.floor(alpha);
            }
            // else: transparent
        }
        finalCtx.putImageData(borderImageData, 0, 0);

        // Step 5: Draw the target image (content) on top, masked to content area
        const logoCanvas = document.createElement('canvas');
        logoCanvas.width = width;
        logoCanvas.height = height;
        const logoCtx = logoCanvas.getContext('2d');

        if (logoCtx) {
            logoCtx.drawImage(targetImg, 0, 0, width, height);
            const logoImageData = logoCtx.getImageData(0, 0, width, height);
            const logoData = logoImageData.data;

            // Mask out background pixels (only show content)
            for (let i = 0; i < width * height; i++) {
                if (isContent[i] === 0) {
                    logoData[i * 4 + 3] = 0; // Make background transparent
                }
            }

            // For B&W logos on dark backgrounds, invert content so it's visible on white border
            const isSelfMasked = !maskSourceUrl || maskSourceUrl === imageUrl;
            if (isSelfMasked && !isLightBackground) {
                for (let i = 0; i < width * height; i++) {
                    if (isContent[i] === 1) {
                        const idx = i * 4;
                        logoData[idx] = 255 - logoData[idx];
                        logoData[idx + 1] = 255 - logoData[idx + 1];
                        logoData[idx + 2] = 255 - logoData[idx + 2];
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
