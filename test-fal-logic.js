const { fal } = require("@fal-ai/client");
require('dotenv').config({ path: '.env' });

// Mock inputs
const input = {
    name: "TestBrand",
    elevatorPitch: "A coffee shop for developers",
    audience: "Developers",
    desirableCues: "Minimalist",
    undesirableCues: "Complex",
};

async function generateLogoFal(input) {
    console.log("Starting generateLogoFal simulation...");

    if (!process.env.FAL_KEY) {
        throw new Error('FAL_KEY environment variable is not set');
    }

    // EXACT LOGIC FROM src/ai/flows/generate-logo-fal.ts
    fal.config({
        credentials: process.env.FAL_KEY.trim(),
    });

    const stylePrompt = "Black and white smooth geometric icon. Sharp edges blended with smooth curves, flat vector style, no gradients. Symmetric, abstract, tech-forward, with a clean silhouette readable at tiny sizes. Monochrome only. Small margins";
    const fullPrompt = `Logo for ${input.name}. ${input.elevatorPitch}. ${stylePrompt}`;

    console.log("Fal Input:", {
        model: "fal-ai/ideogram/v3",
        prompt: fullPrompt,
        image_size: "square_hd",
        style_preset: "FLAT_VECTOR"
    });

    try {
        // Use Ideogram V3 as requested
        const result = await fal.subscribe("fal-ai/ideogram/v3", {
            input: {
                prompt: fullPrompt,
                image_size: "square_hd",
                style_preset: "FLAT_VECTOR",
            },
            logs: true,
            onQueueUpdate: (update) => {
                if (update.status === "IN_PROGRESS") {
                    update.logs?.map((log) => log.message).forEach(console.log);
                }
            },
        });

        // Fal returns image URLs
        const imageUrl = result.data?.images?.[0]?.url;
        if (!imageUrl) {
            throw new Error('Fal did not return an image URL.');
        }
        console.log("Generated Image URL:", imageUrl);

        // Fetch the image and convert to data URI
        const response = await fetch(imageUrl);
        if (!response.ok) {
            throw new Error(`Failed to fetch generated image: ${response.statusText}`);
        }

        const buffer = await response.arrayBuffer();
        const contentType = response.headers.get('content-type') || 'image/png';
        const base64 = Buffer.from(buffer).toString('base64');
        const dataUri = `data:${contentType};base64,${base64}`;

        return { logoUrl: dataUri };
    } catch (error) {
        console.error('[generate-logo-fal] Error:', error);
        const errorDetails = error.body ? JSON.stringify(error.body) : error.message;
        throw new Error(`Fal image generation failed: ${errorDetails}`);
    }
}

generateLogoFal(input)
    .then(result => console.log("Success! Data URI length:", result.logoUrl.length))
    .catch(err => console.error("Simulation Failed:", err));
