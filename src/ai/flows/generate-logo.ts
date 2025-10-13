
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
  desirableCues: z
    .string()
    .optional()
    .describe('Desirable visual cues for the logo.'),
  undesirableCues: z
    .string()
    .optional()
    .describe('Undesirable visual cues for the logo.'),
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
    const {media} = await ai.generate({
      model: 'googleai/gemini-2.5-flash-image-preview',
      prompt: `
        You are a world class brand designer. Design a modern, minimalist, and geometric vector-style icon for the brand described below.
        **Brand Details:**
        - **Brand Name:** ${input.name}
        - **Brand Description:** ${input.elevatorPitch}
        - **Target Audience:** ${input.audience}

        **Design System & Style Guidelines:**
        - The logo must be a simple, abstract, and symbolic. 
        - It must be able to stand by itself as a logo, and evoke the sense of the brand.
        - The logo must use only black shapes against a plain white background.
        - You can combine shapes to create the logo, but avoid combining more than 2 shape ideas to avoid an overly complex design.
        - Desirable Cues: ${input.desirableCues || 'None'}
        - Undesirable Cues: ${input.undesirableCues || 'None'}
        
        **Things to AVOID:** Do not use gradients, thin lines, outlines, strokes, textures, multiple colors, or any form of realism. The logo must be a clean, vector-style graphic. Avoid overly literal interpretations.
      `,
      config: {
        responseModalities: ['IMAGE'],
      },
    });

    if (!media?.url) {
      throw new Error('Image generation failed to return a data URI.');
    }

    return {logoUrl: media.url};
  }
);
