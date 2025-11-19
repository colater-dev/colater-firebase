const { fal } = require("@fal-ai/client");
require('dotenv').config({ path: '.env' });

async function testFal() {
    try {
        console.log("Testing Fal AI Recraft V3...");
        console.log("FAL_KEY present:", !!process.env.FAL_KEY);

        fal.config({
            credentials: process.env.FAL_KEY,
        });

        const result = await fal.subscribe("fal-ai/recraft-v3", {
            input: {
                prompt: "A simple vector logo of a coffee cup",
                image_size: "square_hd",
                style: "vector_illustration"
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

testFal();
