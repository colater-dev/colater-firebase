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
        model: 'googleai/gemini-2.5-flash-image-preview',
        prompt: `Generate an abstract, geometric logo for the following brand. The logo should be simple, modern, and memorable. Do not include any text.
        
        Brand Name: ${input.name}
        Brand Description: ${input.elevatorPitch}
        Target Audience: ${input.audience}
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
