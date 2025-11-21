"use server";

import { z } from 'zod';
import { fal } from "@fal-ai/client";
import { getGenerateLogoPrompt } from '@/ai/prompts/generate-logo';

import { Buffer } from 'buffer';

const OpenAIGenerateLogoInputSchema = z.object({
  name: z.string(),
  elevatorPitch: z.string(),
  audience: z.string(),
  desirableCues: z.string().optional(),
  undesirableCues: z.string().optional(),
  promptName: z.string().optional(),
  size: z.enum(['512x512', '768x768', '1024x1024']).optional(),
  quality: z.enum(['standard', 'hd']).optional(),
  concept: z.string().optional(), // Optional logo concept from generate-logo-concept
});
export type OpenAIGenerateLogoInput = z.infer<typeof OpenAIGenerateLogoInputSchema>;

const OpenAIGenerateLogoOutputSchema = z.object({
  logoUrl: z.string(), // data URI
  prompt: z.string(), // The full prompt used for generation
});
export type OpenAIGenerateLogoOutput = z.infer<typeof OpenAIGenerateLogoOutputSchema>;

export async function generateLogoOpenAI(
  input: OpenAIGenerateLogoInput
): Promise<OpenAIGenerateLogoOutput> {
  // ... (existing code) ...

  const parsed = OpenAIGenerateLogoInputSchema.parse(input);

  if (!process.env.FAL_KEY) {
    throw new Error('FAL_KEY environment variable is not set');
  }

  fal.config({
    credentials: process.env.FAL_KEY.trim(),
  });

  // Use concept if provided, otherwise generate prompt using getGenerateLogoPrompt
  let prompt: string;
  if (parsed.concept) {
    console.log('[generate-logo-openai] Using provided concept');
    // Extract style prompt from concept (format: "concept text\n\nStyle Prompt: style prompt text")
    const stylePromptMatch = parsed.concept.match(/Style Prompt:\s*([\s\S]+)/);
    if (stylePromptMatch) {
      const stylePrompt = stylePromptMatch[1].trim();
      // Combine with brand name and pitch for the full prompt
      prompt = `Logo for ${parsed.name}. ${parsed.elevatorPitch}. ${stylePrompt}`;
      console.log('[generate-logo-openai] Extracted style prompt from concept');
    } else {
      // If no "Style Prompt:" marker, use the entire concept
      prompt = `Logo for ${parsed.name}. ${parsed.elevatorPitch}. ${parsed.concept.trim()}`;
      console.log('[generate-logo-openai] Using entire concept as prompt');
    }
    console.log(`[generate-logo-openai] Generated prompt:`, prompt);
  } else {
    const { key, prompt: generatedPrompt } = getGenerateLogoPrompt(parsed.promptName, parsed);
    console.log(`[generate-logo-openai] Prompt key: ${key}`);
    prompt = generatedPrompt;
    console.log(`[generate-logo-openai] Generated prompt:`, prompt);
  }

  // Map size to fal image dimensions
  const sizeMap: Record<string, { width: number; height: number }> = {
    '512x512': { width: 512, height: 512 },
    '768x768': { width: 768, height: 768 },
    '1024x1024': { width: 1024, height: 1024 },
  };
  const imageSize = parsed.size && sizeMap[parsed.size]
    ? sizeMap[parsed.size]
    : { width: 1024, height: 1024 };

  console.log(`[generate-logo-openai] Using image size: ${imageSize.width}x${imageSize.height}`);

  try {
    // Use Ideogram V3 via fal
    const result: any = await fal.subscribe("fal-ai/ideogram/v3", {
      input: {
        prompt: prompt,
        image_size: {
          width: imageSize.width,
          height: imageSize.height
        },
      },
      logs: true,
      onQueueUpdate: (update: any) => {
        if (update.status === "IN_PROGRESS") {
          update.logs?.map((log: any) => log.message).forEach(console.log);
        }
      },
    });

    console.log('[generate-logo-openai] Ideogram generation completed');
    // Fal returns image URLs, we need to convert to data URI
    const imageUrl = result.data?.images?.[0]?.url;
    if (!imageUrl) {
      throw new Error('Fal did not return an image URL.');
    }
    console.log('[generate-logo-openai] Image URL received:', imageUrl);

    // Fetch the image and convert to data URI
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch generated image: ${response.statusText}`);
    }

    const buffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'image/png';
    const base64 = Buffer.from(buffer).toString('base64');
    const dataUri = `data:${contentType};base64,${base64}`;

    console.log('[generate-logo-openai] Image converted to data URI, size:', buffer.byteLength, 'bytes');
    return { logoUrl: dataUri, prompt: prompt };
  } catch (error: any) {
    console.error('[generate-logo-openai] Error:', error);
    const errorDetails = error.body ? JSON.stringify(error.body) : error.message;
    throw new Error(`Fal image generation failed: ${errorDetails}`);
  }
}
