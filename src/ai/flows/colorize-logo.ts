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
      "The data URI of the black and white logo. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
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
          text: `Colorize this logo using only 2 or 3 complementary, modern, and professional colors. The background MUST be transparent. Do not draw a checkerboard or any other pattern for the background.
          Desirable Cues: ${input.desirableCues || 'None'}
          Undesirable Cues: ${input.undesirableCues || 'None'}
          
          After generating the image, respond with a JSON object in a markdown code block containing the hex codes of the 3 dominant colors. Example:
          \`\`\`json
          {
            "colors": ["#RRGGBB", "#RRGGBB", "#RRGGBB"]
          }
          \`\`\``,
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
        console.error("Failed to parse color palette from model response", e);
        // Fail gracefully, we can still return the image.
      }
    }

    return {
      colorLogoUrl: media.url,
      palette: colors.slice(0, 3), // Ensure we only return max 3 colors
    };
  }
);
