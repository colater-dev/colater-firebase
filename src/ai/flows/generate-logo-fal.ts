"use server";

import { fal } from "@fal-ai/client";
import { z } from 'zod';
import { getGenerateLogoPrompt } from '@/ai/prompts/generate-logo';

const FalGenerateLogoInputSchema = z.object({
    name: z.string(),
    elevatorPitch: z.string(),
    audience: z.string(),
    desirableCues: z.string().optional(),
    undesirableCues: z.string().optional(),
    promptName: z.string().optional(),
});
export type FalGenerateLogoInput = z.infer<typeof FalGenerateLogoInputSchema>;

const FalGenerateLogoOutputSchema = z.object({
    logoUrl: z.string(), // data URI
});
export type FalGenerateLogoOutput = z.infer<typeof FalGenerateLogoOutputSchema>;

export async function generateLogoFal(
    input: FalGenerateLogoInput
): Promise<FalGenerateLogoOutput> {
    const parsed = FalGenerateLogoInputSchema.parse(input);

    if (!process.env.FAL_KEY) {
        throw new Error('FAL_KEY environment variable is not set');
    }

    fal.config({
        credentials: process.env.FAL_KEY.trim(),
    });

    const stylePrompt = "Black and white smooth geometric icon. Sharp edges blended with smooth curves, flat vector style, no gradients. Symmetric, abstract, tech-forward, with a clean silhouette readable at tiny sizes. Monochrome only. Small margins";

    // Sanitize inputs
    const cleanName = parsed.name.replace(/[\r\n]+/g, " ").trim();
    const cleanPitch = parsed.elevatorPitch.replace(/[\r\n]+/g, " ").trim();

    let fullPrompt = `Logo for ${cleanName}. ${cleanPitch}. ${stylePrompt}`;

    // Truncate prompt if too long (Ideogram usually handles long prompts, but safe limit is good)
    if (fullPrompt.length > 2000) {
        fullPrompt = fullPrompt.substring(0, 2000);
    }

    try {
        // Use Ideogram V3 as requested
        const result: any = await fal.subscribe("fal-ai/ideogram/v3", {
            input: {
                prompt: fullPrompt,
                image_size: {
                    width: 720,
                    height: 720
                },
            },
            logs: true,
            onQueueUpdate: (update: any) => {
                if (update.status === "IN_PROGRESS") {
                    update.logs?.map((log: any) => log.message).forEach(console.log);
                }
            },
        });

        // Fal returns image URLs, we need to convert to data URI
        const imageUrl = result.data?.images?.[0]?.url;
        if (!imageUrl) {
            throw new Error('Fal did not return an image URL.');
        }

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
    } catch (error: any) {
        console.error('[generate-logo-fal] Error:', error);
        const errorDetails = error.body ? JSON.stringify(error.body) : error.message;
        throw new Error(`Fal image generation failed: ${errorDetails}`);
    }
}
