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

const colorTool = ai.defineTool(
  {
    name: 'colorExtractor',
    description:
      'Extracts the 2-3 primary hex colors from the generated logo image.',
    inputSchema: z.object({
      colors: z
        .array(z.string().describe('A hex color code, e.g., #FFFFFF'))
        .length(3)
        .describe('An array of 3 dominant hex color codes from the image.'),
    }),
    outputSchema: z.void(),
  },
  async () => {} // No-op, we just need the structured output.
);

const colorizeLogoFlow = ai.defineFlow(
  {
    name: 'colorizeLogoFlow',
    inputSchema: ColorizeLogoInputSchema,
    outputSchema: ColorizeLogoOutputSchema,
  },
  async input => {
    const {media, toolRequest} = await ai.generate({
      model: 'googleai/gemini-2.5-flash-image-preview',
      prompt: [
        {
          media: {
            url: input.logoUrl,
          },
        },
        {
          text: `Colorize this logo using only 2 or 3 complementary, modern, and professional colors. The background MUST remain transparent.
          Desirable Cues: ${input.desirableCues || 'None'}
          Undesirable Cues: ${input.undesirableCues || 'None'}
          
          After generating the image, extract the 3 dominant hex colors and provide them using the colorExtractor tool.`,
        },
      ],
      config: {
        responseModalities: ['IMAGE'],
      },
      tools: [colorTool],
    });

    if (!media?.url) {
      throw new Error('Color logo generation failed to return a data URI.');
    }
    if (!toolRequest) {
      throw new Error('Color extraction failed.');
    }

    const colors = toolRequest.input.colors || [];

    return {
      colorLogoUrl: media.url,
      palette: colors.slice(0, 3), // Ensure we only return max 3 colors
    };
  }
);
