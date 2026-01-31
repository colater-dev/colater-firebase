"use server";

import { fal } from "@fal-ai/client";
import { z } from 'zod';
import { ai } from '@/ai/genkit';
import { Buffer } from 'buffer';

const FalGenerateLogoInputSchema = z.object({
    name: z.string(),
    elevatorPitch: z.string(),
    audience: z.string(),
    desirableCues: z.string().optional(),
    undesirableCues: z.string().optional(),
    promptName: z.string().optional(),
    concept: z.string().optional(), // Optional logo concept from generate-logo-concept
    model: z.string().optional(), // Optional model ID
});
export type FalGenerateLogoInput = z.infer<typeof FalGenerateLogoInputSchema>;

const FalGenerateLogoOutputSchema = z.object({
    logoUrl: z.string(), // data URI
    prompt: z.string(), // The full prompt used for generation
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

    // Base style requirements for all icon logos
    const baseStylePrompt = "Flat black & white logo mark, minimal, negative-space, suitable at small sizes, no gradients, no texture, vector-style. Sharp edges blended with smooth curves, flat vector style, no gradients. Symmetric, abstract, tech-forward, with a clean silhouette readable at tiny sizes. Monochrome only.";

    // Sanitize inputs
    const cleanName = parsed.name.replace(/[\r\n]+/g, " ").trim();
    const cleanPitch = parsed.elevatorPitch.replace(/[\r\n]+/g, " ").trim();
    const cleanAudience = parsed.audience.replace(/[\r\n]+/g, " ").trim();
    const cleanDesirableCues = parsed.desirableCues?.replace(/[\r\n]+/g, " ").trim() || "";
    const cleanUndesirableCues = parsed.undesirableCues?.replace(/[\r\n]+/g, " ").trim() || "";

    console.log('[generate-logo-fal] Input details:', {
        name: cleanName,
        elevatorPitch: cleanPitch,
        audience: cleanAudience,
        desirableCues: cleanDesirableCues || '(none)',
        undesirableCues: cleanUndesirableCues || '(none)',
        hasConcept: !!parsed.concept,
        model: parsed.model || 'fal-ai/ideogram/v3 (default)',
    });

    let fullPrompt = "";

    // If concept is provided, use it directly (Concept + Style) and exclude elevator pitch
    if (parsed.concept) {
        console.log('[generate-logo-fal] Using provided concept');
        // Extract style prompt and concept
        const stylePromptMatch = parsed.concept.match(/Style Prompt:\s*([\s\S]+)/);
        if (stylePromptMatch) {
            const stylePrompt = stylePromptMatch[1].trim();
            const concept = parsed.concept.replace(stylePromptMatch[0], '').trim();
            fullPrompt = `${concept} ${stylePrompt}`;
            console.log('[generate-logo-fal] Using concept + style prompt (no pitch)');
        } else {
            // If no "Style Prompt:" marker, use the entire concept
            fullPrompt = parsed.concept.trim();
            console.log('[generate-logo-fal] Using entire concept as prompt (no pitch)');
        }
    } else {
        // Fallback: Generate brand-specific style prompt using genkit
        console.log('[generate-logo-fal] Generating style prompt using genkit');
        const stylePromptPrompt = `You are an expert brand designer. Based on the following brand information, describe the logo concept and create a detailed stylePrompt that can be used for ideogram image generation.

Brand Name: ${cleanName}
Elevator Pitch: ${cleanPitch}
Target Audience: ${cleanAudience}
${cleanDesirableCues ? `Desirable Visual Cues: ${cleanDesirableCues}` : ''}
${cleanUndesirableCues ? `Undesirable Visual Cues: ${cleanUndesirableCues}` : ''}

Describe the logo concept as a brand designer would, focusing on:
- Simple white logo on plain black background
- Visual style and aesthetic appropriate for the brand
- Each logo compresses a concept into a single, graspable form
- Symbolic elements to use - abstract enough to feel timeless, concrete enough to feel intentional
- How to combine the visual elements that would best represent the brand. Avoid explanatory clutter while still signaling category or values

Then, return ONLY a concise Prompt (4-5 sentences) that can be directly used for image generation. It should be specific, actionable, and focused on visual design elements without any abstract concepts. Do not include the brand name or pitch in the Prompt - focus purely on the visual style and design characteristics.`;

        console.log('[generate-logo-fal] Genkit style prompt request:', stylePromptPrompt);

        let aiStylePrompt = "";
        try {
            const genkitResponse = await ai.generate({
                model: 'googleai/gemini-3-flash-preview',
                prompt: stylePromptPrompt,
            });
            aiStylePrompt = genkitResponse.text || "";
            console.log('[generate-logo-fal] AI-generated style prompt:', aiStylePrompt);
        } catch (error: any) {
            console.error('[generate-logo-fal] Error generating style prompt:', error);
            aiStylePrompt = "";
        }

        // Use AI-generated style prompt if available, otherwise fallback to base style requirements
        const combinedStylePrompt = aiStylePrompt || baseStylePrompt;
        console.log('[generate-logo-fal] Base style prompt:', baseStylePrompt);
        console.log('[generate-logo-fal] Combined style prompt:', combinedStylePrompt);

        fullPrompt = `${cleanPitch}. ${combinedStylePrompt}`;
    }

    // Truncate prompt if too long (Ideogram usually handles long prompts, but safe limit is good)
    const originalPromptLength = fullPrompt.length;
    if (fullPrompt.length > 2000) {
        fullPrompt = fullPrompt.substring(0, 2000);
        console.warn(`[generate-logo-fal] Prompt truncated from ${originalPromptLength} to ${fullPrompt.length} characters`);
    }

    console.log('[generate-logo-fal] Full prompt for Ideogram:', fullPrompt);
    console.log('[generate-logo-fal] Full prompt length:', fullPrompt.length);

    const modelId = parsed.model || "fal-ai/ideogram/v3";
    console.log(`[generate-logo-fal] Calling ${modelId}`);

    // Prepare input based on model
    let modelInput: any = {
        prompt: fullPrompt,
    };

    if (modelId === "fal-ai/ideogram/v3") {
        modelInput.image_size = {
            width: 720,
            height: 720
        };
    } else if (modelId === "fal-ai/nano-banana-pro") {
        modelInput.aspect_ratio = "1:1";
        modelInput.output_format = "png";
    } else if (modelId === "fal-ai/reve/text-to-image") {
        modelInput.aspect_ratio = "1:1";
        modelInput.output_format = "png";
    } else {
        // Default fallback for unknown models (assume aspect_ratio support)
        modelInput.aspect_ratio = "1:1";
    }

    try {
        const result: any = await fal.subscribe(modelId, {
            input: modelInput,
            logs: true,
            onQueueUpdate: (update: any) => {
                if (update.status === "IN_PROGRESS") {
                    update.logs?.map((log: any) => log.message).forEach(console.log);
                }
            },
        });

        console.log(`[generate-logo-fal] ${modelId} generation completed`);

        // Handle different response formats if necessary, but most Fal image models return { images: [{ url, ... }] }
        const imageUrl = result.data?.images?.[0]?.url;
        if (!imageUrl) {
            throw new Error('Fal did not return an image URL.');
        }
        console.log('[generate-logo-fal] Image URL received:', imageUrl);

        // Fetch the image and convert to data URI
        const response = await fetch(imageUrl);
        if (!response.ok) {
            throw new Error(`Failed to fetch generated image: ${response.statusText}`);
        }

        const buffer = await response.arrayBuffer();
        const contentType = response.headers.get('content-type') || 'image/png';
        const base64 = Buffer.from(buffer).toString('base64');
        const dataUri = `data:${contentType};base64,${base64}`;

        console.log('[generate-logo-fal] Image converted to data URI, size:', buffer.byteLength, 'bytes');
        return { logoUrl: dataUri, prompt: fullPrompt };
    } catch (error: any) {
        console.error('[generate-logo-fal] Error:', error);
        const errorDetails = error.body ? JSON.stringify(error.body) : error.message;
        throw new Error(`Fal image generation failed: ${errorDetails}`);
    }
}
