'use server';
/**
 * @fileOverview Colorizes a logo and extracts its main colors using AI.
 *
 * - colorizeLogo - A function that colorizes a logo and extracts colors.
 * - ColorizeLogoInput - The input type for the colorizeLogo function.
 * - ColorizeLogoOutput - The return type for the colorizeLogo function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

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
    const {media, text} = await ai.generate({
      model: 'googleai/gemini-2.5-flash-image-preview',
      prompt: [
        {
          media: {
            url: input.logoUrl,
          },
        },
        {
          text: `
          You are a logo designer. Your task is to colorize the provided black and white logo based on the brand's identity.
          
          Brand Name: ${input.name}
          Brand Description: ${input.elevatorPitch}
          Target Audience: ${input.audience}
          Desirable Cues for color and style: ${input.desirableCues || 'None'}
          Undesirable Cues for color and style: ${input.undesirableCues || 'None'}

          Instructions:
          1.  Introduce 2-3 complementary, modern, and professional colors to the logo.
          2.  The output image must be 256x256 pixels.
          3.  The final logo must be on a transparent background. Do not add a solid or patterned background.
          4.  Avoid gradients, thin lines, outlines, strokes, and textures.
          5.  Do not add any text to the logo.
          6.  After generating the image, respond with a JSON object in a markdown code block containing the hex codes of the 2-3 dominant colors you used. Example:
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
