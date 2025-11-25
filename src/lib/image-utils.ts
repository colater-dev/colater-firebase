
export async function cropImageToContent(
    imageUrl: string,
    cropDetails?: { x: number; y: number; width: number; height: number }
): Promise<string> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "Anonymous";

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
            console.error("Error loading image for cropping:", err);
            resolve(imageUrl);
        };

        // Append timestamp to avoid cache issues with CORS
        const separator = imageUrl.includes('?') ? '&' : '?';
        img.src = `${imageUrl}${separator}t=${new Date().getTime()}`;
    });
}

export async function createStickerEffect(imageUrl: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "Anonymous";

        img.onload = () => {
            try {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    resolve(imageUrl);
                    return;
                }
                ctx.drawImage(img, 0, 0);

                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageData.data;
                const width = canvas.width;
                const height = canvas.height;

                // 1. Identify background color
                // 1. Identify background color (from top-left pixel)
                const bgR = data[0];
                const bgG = data[1];
                const bgB = data[2];
                const bgA = data[3];
                const threshold = 30;

                // 2. Flood fill to identify true background (ignoring holes)
                const isBackground = new Uint8Array(width * height); // 0 = content/hole, 1 = background
                const queue: number[] = [];

                // Helper to check if pixel matches background color
                const isBgColor = (idx: number) => {
                    const i = idx * 4;
                    const r = data[i];
                    const g = data[i + 1];
                    const b = data[i + 2];
                    const a = data[i + 3];

                    if (bgA === 0) {
                        return a === 0;
                    }
                    const diff = Math.abs(r - bgR) + Math.abs(g - bgG) + Math.abs(b - bgB) + Math.abs(a - bgA);
                    return diff <= threshold;
                };

                // Add all border pixels that match background color to queue
                for (let x = 0; x < width; x++) {
                    if (isBgColor(x)) { // Top row
                        queue.push(x);
                        isBackground[x] = 1;
                    }
                    const bottomIdx = (height - 1) * width + x;
                    if (isBgColor(bottomIdx)) { // Bottom row
                        queue.push(bottomIdx);
                        isBackground[bottomIdx] = 1;
                    }
                }
                for (let y = 1; y < height - 1; y++) {
                    const leftIdx = y * width;
                    if (isBgColor(leftIdx)) { // Left col
                        queue.push(leftIdx);
                        isBackground[leftIdx] = 1;
                    }
                    const rightIdx = y * width + (width - 1);
                    if (isBgColor(rightIdx)) { // Right col
                        queue.push(rightIdx);
                        isBackground[rightIdx] = 1;
                    }
                }

                // BFS
                let head = 0;
                while (head < queue.length) {
                    const idx = queue[head++];
                    const x = idx % width;
                    const y = Math.floor(idx / width);

                    // Check neighbors
                    const neighbors = [
                        { nx: x, ny: y - 1 }, // Top
                        { nx: x, ny: y + 1 }, // Bottom
                        { nx: x - 1, ny: y }, // Left
                        { nx: x + 1, ny: y }  // Right
                    ];

                    for (const { nx, ny } of neighbors) {
                        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                            const nIdx = ny * width + nx;
                            if (isBackground[nIdx] === 0 && isBgColor(nIdx)) {
                                isBackground[nIdx] = 1;
                                queue.push(nIdx);
                            }
                        }
                    }
                }

                // 3. Chamfer Distance Transform (3-4 weights)
                // Initialize distance grid
                const dist = new Float32Array(width * height);
                const maxDist = (width + height) * 4; // Scaled by max weight

                for (let i = 0; i < width * height; i++) {
                    dist[i] = isBackground[i] === 1 ? maxDist : 0;
                }

                // Forward Pass (Top-Left to Bottom-Right)
                for (let y = 0; y < height; y++) {
                    for (let x = 0; x < width; x++) {
                        const idx = y * width + x;
                        if (dist[idx] === 0) continue;

                        let minVal = dist[idx];

                        // Check neighbors: Left, Top-Left, Top, Top-Right
                        if (x > 0) minVal = Math.min(minVal, dist[idx - 1] + 3); // Left
                        if (y > 0) {
                            minVal = Math.min(minVal, dist[idx - width] + 3); // Top
                            if (x > 0) minVal = Math.min(minVal, dist[idx - width - 1] + 4); // Top-Left
                            if (x < width - 1) minVal = Math.min(minVal, dist[idx - width + 1] + 4); // Top-Right
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

                        // Check neighbors: Right, Bottom-Right, Bottom, Bottom-Left
                        if (x < width - 1) minVal = Math.min(minVal, dist[idx + 1] + 3); // Right
                        if (y < height - 1) {
                            minVal = Math.min(minVal, dist[idx + width] + 3); // Bottom
                            if (x < width - 1) minVal = Math.min(minVal, dist[idx + width + 1] + 4); // Bottom-Right
                            if (x > 0) minVal = Math.min(minVal, dist[idx + width - 1] + 4); // Bottom-Left
                        }

                        dist[idx] = minVal;
                    }
                }

                // 4. Apply Mask with Anti-aliasing
                const borderSize = 30;
                for (let y = 0; y < height; y++) {
                    for (let x = 0; x < width; x++) {
                        const idx = y * width + x;
                        const i = idx * 4;

                        const actualDist = dist[idx] / 3.0;

                        if (actualDist > borderSize + 1) {
                            data[i + 3] = 0; // Fully transparent
                        } else if (actualDist > borderSize) {
                            // Anti-aliasing fade
                            const alpha = Math.max(0, Math.min(255, (borderSize + 1 - actualDist) * 255));
                            // Multiply existing alpha by the fade factor
                            data[i + 3] = Math.floor((data[i + 3] * alpha) / 255);
                        }
                        // Else: keep original pixel
                    }
                }

                ctx.putImageData(imageData, 0, 0);
                resolve(canvas.toDataURL());

            } catch (e) {
                console.error('Error creating sticker effect:', e);
                resolve(imageUrl);
            }
        };

        img.onerror = () => resolve(imageUrl);

        const separator = imageUrl.includes('?') ? '&' : '?';
        img.src = `${imageUrl}${separator}t=${new Date().getTime()}`;
    });
}
