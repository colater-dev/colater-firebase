"use server";

import { z } from 'zod';
import { getGenerateLogoPrompt } from '@/ai/prompts/generate-logo';

const OpenAIGenerateLogoInputSchema = z.object({
  name: z.string(),
  elevatorPitch: z.string(),
  audience: z.string(),
  desirableCues: z.string().optional(),
  undesirableCues: z.string().optional(),
  promptName: z.string().optional(),
  size: z.enum(['512x512', '768x768', '1024x1024']).optional(),
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

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not set');
  }

  // Use the Images API with gpt-image-1 to generate a PNG and return as data URI
  const response = await fetch('https://api.openai.com/v1/images', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-image-1',
      prompt,
      size: parsed.size ?? '512x512',
      response_format: 'b64_json',
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error('[generate-logo-openai] OpenAI error:', errText);
    throw new Error(`OpenAI image generation failed: ${response.status} ${response.statusText}`);
  }

  const json = (await response.json()) as {
    data?: Array<{ b64_json?: string }>;
  };

  const b64 = json?.data?.[0]?.b64_json;
  if (!b64) {
    throw new Error('OpenAI did not return image data.');
  }

  const dataUri = `data:image/png;base64,${b64}`;
  return { logoUrl: dataUri };
}
