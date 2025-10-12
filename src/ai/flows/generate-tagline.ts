'use server';
/**
 * @fileOverview Generates a tagline for a brand using AI.
 *
 * - generateTagline - A function that generates a brand tagline.
 * - GenerateTaglineInput - The input type for the generateTagline function.
 * - GenerateTaglineOutput - The return type for the generateTagline function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateTaglineInputSchema = z.object({
  name: z.string().describe('The name of the brand.'),
  elevatorPitch: z.string().describe('The elevator pitch for the brand.'),
  audience: z.string().describe('The target audience for the brand.'),
});
export type GenerateTaglineInput = z.infer<
  typeof GenerateTaglineInputSchema
>;

const GenerateTaglineOutputSchema = z.object({
  tagline: z.string().describe('The generated tagline for the brand.'),
});
export type GenerateTaglineOutput = z.infer<
  typeof GenerateTaglineOutputSchema
>;

export async function generateTagline(
  input: GenerateTaglineInput
): Promise<GenerateTaglineOutput> {
  return generateTaglineFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateTaglinePrompt',
  input: {schema: GenerateTaglineInputSchema},
  output: {schema: GenerateTaglineOutputSchema},
  prompt: `You are a marketing expert. Generate a catchy tagline for the following brand.

Brand Name: {{{name}}}
Elevator Pitch: {{{elevatorPitch}}}
Target Audience: {{{audience}}}

Generate a single, concise, and memorable tagline.`,
});

const generateTaglineFlow = ai.defineFlow(
  {
    name: 'generateTaglineFlow',
    inputSchema: GenerateTaglineInputSchema,
    outputSchema: GenerateTaglineOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
