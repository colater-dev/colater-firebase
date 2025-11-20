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

const ColorizeLogoInputSchema = z.object({
  logoUrl: z
    .string()
    .describe(
      'The data URI of the black and white logo to be colorized.'
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
    const { media, text } = await ai.generate({
      model: 'googleai/gemini-2.5-flash-image-preview',
      prompt: [
        {
          media: {
            url: input.logoUrl,
          },
        },
        {
          text: `
          You are a professional logo designer. Your task is to colorize the provided black-and-white logo while preserving its exact shape and geometry.
          
          Brand Name: ${input.name}
          Brand Description: ${input.elevatorPitch}
          Target Audience: ${input.audience}
          Desirable Cues for color and style: ${input.desirableCues || 'None'}
          Undesirable Cues for color and style: ${input.undesirableCues || 'None'}

          Instructions:
1. Introduce up to 3 modern, complementary brand-appropriate colors. The palette should feel premium, intentional, and visually cohesive.
2. Preserve the logo's shape, silhouette, spacing, and internal structure exactly. Do not alter, distort, add, or remove any shapes.
3. You *may* use gradients, soft shadows, subtle lighting effects—only if they enhance clarity and do not change the structure of the mark. It should feel like a brand from 2030.
4. The output must be a 160x160 pixel image.
5. Place the colored logo on a clean white background with no extra elements, textures, patterns, or framing.
6. Do not add any text to the image.
7. After generating the image, return a JSON object in a markdown code block listing the 3 dominant hex colors used. Example:
              \`\`\`json
              {
                "colors": ["#RRGGBB", "#RRGGBB", "#RRGGBB"]
              }
              \`\`\`
          `,
        },
      ],
      config: {
        responseModalities: ['IMAGE', 'TEXT'],
      },
    });

    if (!media?.url) {
      throw new Error('Color logo generation failed to return a data URI.');
    }

    let colors: string[] = [];
    if (text) {
      try {
        const jsonString = text.match(/```json\n([\s\S]*?)\n```/)?.[1];
        if (jsonString) {
          const parsed = JSON.parse(jsonString);
          if (parsed.colors && Array.isArray(parsed.colors)) {
            colors = parsed.colors;
          }
        }
      } catch (e) {
        console.error('Failed to parse color palette from model response', e);
        // Fail gracefully, we can still return the image.
      }
    }

    return {
      colorLogoUrl: media.url,
      palette: colors.slice(0, 3), // Ensure we only return max 3 colors
    };
  }
);
