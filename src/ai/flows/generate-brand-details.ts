'use server';
/**
 * @fileOverview Generates brand details (name, pitch, audience, cues) using AI.
 *
 * - generateBrandDetails - A function that generates brand details based on a topic.
 * - GenerateBrandDetailsInput - The input type for the generateBrandDetails function.
 * - GenerateBrandDetailsOutput - The return type for the generateBrandDetails function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateBrandDetailsInputSchema = z.object({
  topic: z.string().describe('The topic or idea for the brand.'),
});
export type GenerateBrandDetailsInput = z.infer<
  typeof GenerateBrandDetailsInputSchema
>;

const GenerateBrandDetailsOutputSchema = z.object({
  name: z.string().describe('A creative and unique name for the brand.'),
  elevatorPitch: z
    .string()
    .describe('A concise and compelling elevator pitch for the brand.'),
  audience: z.string().describe('The target audience for the brand.'),
  desirableCues: z
    .string()
    .describe('A few keywords for desirable visual cues for the brand identity (e.g., minimalist, elegant).'),
  undesirableCues: z
    .string()
    .describe('A few keywords for undesirable visual cues for the brand identity (e.g., complex, childish).'),
});
export type GenerateBrandDetailsOutput = z.infer<
  typeof GenerateBrandDetailsOutputSchema
>;

export async function generateBrandDetails(
  input: GenerateBrandDetailsInput
): Promise<GenerateBrandDetailsOutput> {
  return generateBrandDetailsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateBrandDetailsPrompt',
  input: {schema: GenerateBrandDetailsInputSchema},
  output: {schema: GenerateBrandDetailsOutputSchema},
  prompt: `You are a branding expert. Based on the following topic, generate a creative and complete brand identity.

Topic: {{{topic}}}

Generate a unique brand name, a concise elevator pitch, a description of the target audience, and a few desirable and undesirable visual cues.`,
});

const generateBrandDetailsFlow = ai.defineFlow(
  {
    name: 'generateBrandDetailsFlow',
    inputSchema: GenerateBrandDetailsInputSchema,
    outputSchema: GenerateBrandDetailsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
