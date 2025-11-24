
export async function cropImageToContent(imageUrl: string): Promise<string> {
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

                // Get image data
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageData.data;

                let minX = canvas.width;
                let minY = canvas.height;
                let maxX = 0;
                let maxY = 0;

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

                const width = maxX - minX;
                const height = maxY - minY;

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
