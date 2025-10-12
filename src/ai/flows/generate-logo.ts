'use server';
/**
 * @fileOverview Generates a logo for a brand using AI.
 *
 * - generateLogo - A function that generates a brand logo.
 * - GenerateLogoInput - The input type for the generateLogo function.
 * - GenerateLogoOutput - The return type for the generateLogo function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateLogoInputSchema = z.object({
  name: z.string().describe('The name of the brand.'),
  elevatorPitch: z.string().describe('The elevator pitch for the brand.'),
  audience: z.string().describe('The target audience for the brand.'),
  desirableCues: z.string().optional().describe('Desirable visual cues for the logo.'),
  undesirableCues: z.string().optional().describe('Undesirable visual cues for the logo.'),
});
export type GenerateLogoInput = z.infer<typeof GenerateLogoInputSchema>;

const GenerateLogoOutputSchema = z.object({
  logoUrl: z.string().describe('The data URI of the generated logo.'),
});
export type GenerateLogoOutput = z.infer<typeof GenerateLogoOutputSchema>;

export async function generateLogo(
  input: GenerateLogoInput
): Promise<GenerateLogoOutput> {
  return generateLogoFlow(input);
}

const generateLogoFlow = ai.defineFlow(
  {
    name: 'generateLogoFlow',
    inputSchema: GenerateLogoInputSchema,
    outputSchema: GenerateLogoOutputSchema,
  },
  async input => {
    const { media } = await ai.generate({
        model: 'googleai/imagen-4.0-fast-generate-001',
        prompt: `
        You are a world-class logo designer. Your task is to generate a logo icon for the brand described below.

        **Brand Details:**
        - **Brand Name:** ${input.name}
        - **Brand Description:** ${input.elevatorPitch}
        - **Target Audience:** ${input.audience}

        **Design System & Style Guidelines:**
        - **Overall Style:** Create an icon that is modern, minimalist, and geometric. It should be constructed from basic shapes like circles, rectangles, and triangles. The silhouette must be solid, monolithic, and easily recognizable.
        - **Subject Matter:** The logo should be an abstract, symbolic entity. Avoid literal interpretations.
        - **Desirable Cues:** ${input.desirableCues || 'None'}
        - **Undesirable Cues:** ${input.undesirableCues || 'None'}
        - **Color:** The logo must use black shapes or strokes only.
        - **Shape & Form:** Use a mix of smooth curves and sharp, flat planes. Corners should be slightly rounded or have blunt geometric cuts. The overall composition should be compact and balanced.
        - **Background:** The logo must be on a **transparent background**. Do not add any color, patterns, or borders to the background.
        - **Output Requirements:** The final image must be a 256x256 pixel PNG. Do not include any text in the logo itself.
        - **Things to AVOID:** Do not use gradients, thin lines, outlines, strokes, textures, multiple colors, or any form of realism. The logo must be a clean, vector-style graphic.
        `,
        config: {
          responseModalities: ['IMAGE'],
        },
      });

    if (!media.url) {
      throw new Error('Image generation failed to return a data URI.');
    }
      
    return { logoUrl: media.url };
  }
);
