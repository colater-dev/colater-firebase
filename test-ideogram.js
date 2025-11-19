const { fal } = require("@fal-ai/client");
require('dotenv').config({ path: '.env' });

async function testIdeogram() {
    try {
        console.log("Testing Fal AI Ideogram V3...");
        console.log("FAL_KEY present:", !!process.env.FAL_KEY);

        fal.config({
            credentials: process.env.FAL_KEY,
        });

        const prompt = "Logo for ExampleBrand. A coffee shop for developers. Black and white smooth geometric icon. Sharp edges blended with smooth curves, flat vector style, no gradients. Symmetric, abstract, tech-forward, with a clean silhouette readable at tiny sizes. Monochrome only. Small margins";

        const result = await fal.subscribe("fal-ai/ideogram/v3", {
            input: {
                prompt,
                image_size: "square_hd",
                style_preset: "FLAT_VECTOR",
            },
            logs: true,
            onQueueUpdate: (update) => {
                if (update.status === "IN_PROGRESS") {
                    update.logs.map((log) => log.message).forEach(console.log);
                }
            },
        });

        console.log("Result:", JSON.stringify(result, null, 2));
    } catch (error) {
        console.error("Error:", error);
        if (error.body) {
            console.error("Error Body:", error.body);
        }
    }
}

testIdeogram();
