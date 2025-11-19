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

    const { key, prompt } = getGenerateLogoPrompt(parsed.promptName, parsed);
    console.log(`[generate-logo-fal] Prompt key: ${key}`);

    if (!process.env.FAL_KEY) {
        throw new Error('FAL_KEY environment variable is not set');
    }

    try {
        // Use Recraft V3 which is specifically designed for brand design and vector-style logos
        const result: any = await fal.subscribe("fal-ai/recraft-v3", {
            input: {
                prompt,
                image_size: { width: 640, height: 640 },
                style: "vector_illustration",
            },
            logs: true,
            onQueueUpdate: (update: any) => {
                if (update.status === "IN_PROGRESS") {
                    console.log(`[generate-logo-fal] Progress: ${update.logs?.map((log: any) => log.message).join('\n')}`);
                }
            },
        });

        console.log(`[generate-logo-fal] Generation complete`);

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
        const base64 = Buffer.from(buffer).toString('base64');
        const dataUri = `data:image/png;base64,${base64}`;

        return { logoUrl: dataUri };
    } catch (error) {
        console.error('[generate-logo-fal] Error:', error);
        throw new Error(`Fal image generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
