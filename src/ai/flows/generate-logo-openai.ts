"use server";

import { z } from 'zod';
import { getGenerateLogoPrompt } from '@/ai/prompts/generate-logo';
import { getOpenAIClient } from '@/ai/openai';

const OpenAIGenerateLogoInputSchema = z.object({
  name: z.string(),
  elevatorPitch: z.string(),
  audience: z.string(),
  desirableCues: z.string().optional(),
  undesirableCues: z.string().optional(),
  promptName: z.string().optional(),
  size: z.enum(['512x512', '768x768', '1024x1024']).optional(),
  background: z.enum(['transparent', 'white']).optional(),
  quality: z.enum(['standard', 'hd']).optional(),
});
export type OpenAIGenerateLogoInput = z.infer<typeof OpenAIGenerateLogoInputSchema>;

const OpenAIGenerateLogoOutputSchema = z.object({
  logoUrl: z.string(), // data URI
});
export type OpenAIGenerateLogoOutput = z.infer<typeof OpenAIGenerateLogoOutputSchema>;

export async function generateLogoOpenAI(
  input: OpenAIGenerateLogoInput
): Promise<OpenAIGenerateLogoOutput> {
  const parsed = OpenAIGenerateLogoInputSchema.parse(input);

  const { key, prompt } = getGenerateLogoPrompt(parsed.promptName, parsed);
  console.log(`[generate-logo-openai] Prompt key: ${key}`);

  const client = getOpenAIClient();
  const result = await client.images.generate({
    model: 'gpt-image-1',
    prompt,
    size: '1024x1024',
    background: 'transparent',
    quality: 'standard',
  });

  const image_base64 = (result as any).data?.[0]?.b64_json as string | undefined;
  if (!image_base64) {
    throw new Error('OpenAI did not return image data.');
  }

  const dataUri = `data:image/png;base64,${image_base64}`;
  return { logoUrl: dataUri };
}
