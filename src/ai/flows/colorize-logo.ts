'use server';
/**
 * @fileOverview Colorizes a logo and extracts its main colors using AI.
 *
 * - colorizeLogo - A function that colorizes a logo and extracts colors.
 * - ColorizeLogoInput - The input type for the colorizeLogo function.
 * - ColorizeLogoOutput - The return type for the colorizeLogo function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { fal } from '@fal-ai/client';
import getColors from 'get-image-colors';

const ColorizeLogoInputSchema = z.object({
  logoUrl: z
    .string()
    .describe(
      'The URL of the black and white logo to be colorized (must be a publicly accessible URL, not a data URI).'
    ),
  name: z.string().describe('The name of the brand.'),
  elevatorPitch: z.string().describe('The elevator pitch for the brand.'),
  audience: z.string().describe('The target audience for the brand.'),
  desirableCues: z
    .string()
    .optional()
    .describe('Desirable visual cues to influence color choices.'),
  undesirableCues: z
    .string()
    .optional()
    .describe('Undesirable visual cues to avoid.'),
});
export type ColorizeLogoInput = z.infer<typeof ColorizeLogoInputSchema>;

const ColorizeLogoOutputSchema = z.object({
  colorLogoUrl: z
    .string()
    .describe('The data URI of the generated color logo.'),
  palette: z
    .array(z.string())
    .describe(
      'An array of 2-3 hex color codes extracted from the color logo.'
    ),
});
export type ColorizeLogoOutput = z.infer<typeof ColorizeLogoOutputSchema>;

export async function colorizeLogo(
  input: ColorizeLogoInput
): Promise<ColorizeLogoOutput> {
  return colorizeLogoFlow(input);
}

const colorizeLogoFlow = ai.defineFlow(
  {
    name: 'colorizeLogoFlow',
    inputSchema: ColorizeLogoInputSchema,
    outputSchema: ColorizeLogoOutputSchema,
  },
  async input => {
    const prompt = `A colored 3d render of a logo for ${input.name}. ${input.elevatorPitch}. Target audience: ${input.audience}. ${input.desirableCues || ''}. Avoid: ${input.undesirableCues || ''}`;

    try {
      const result: any = await fal.subscribe('fal-ai/reve/fast/remix', {
        input: {
          prompt,
          image_urls: [input.logoUrl],
        },
        logs: true,
        onQueueUpdate: (update) => {
          if (update.status === 'IN_PROGRESS') {
            update.logs.map((log) => log.message).forEach(console.log);
          }
        },
      });

      console.log('Fal AI result:', JSON.stringify(result, null, 2));

      if (!result.data?.images?.[0]?.url) {
        console.error('Unexpected Fal AI response structure:', result);
        throw new Error(`Color logo generation failed to return an image URL. Received: ${JSON.stringify(result.data)}`);
      }

      const colorLogoUrl = result.data.images[0].url;
      console.log('Color logo URL received:', colorLogoUrl);

      // Fetch the image and convert to data URI (similar to generate-logo-fal.ts)
      const imageResponse = await fetch(colorLogoUrl);
      if (!imageResponse.ok) {
        throw new Error(`Failed to fetch generated color logo: ${imageResponse.statusText}`);
      }

      const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
      const imageContentType = imageResponse.headers.get('content-type') || 'image/png';
      const imageBase64 = imageBuffer.toString('base64');
      const colorLogoDataUri = `data:${imageContentType};base64,${imageBase64}`;

      console.log('Color logo converted to data URI, size:', imageBuffer.byteLength, 'bytes');

      // Extract colors using get-image-colors
      const colors = await getColors(imageBuffer, imageContentType);
      const palette = colors.map(color => color.hex()).slice(0, 3);

      return {
        colorLogoUrl: colorLogoDataUri,
        palette,
      };
    } catch (error) {
      console.error('Fal AI generation failed:', error);
      throw error;
    }
  }
);
