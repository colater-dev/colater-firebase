'use server';
/**
 * @fileOverview Generates taglines for a brand using AI.
 *
 * - generateTaglines - A function that generates brand taglines.
 * - GenerateTaglinesInput - The input type for the generateTaglines function.
 * - GenerateTaglinesOutput - The return type for the generateTaglines function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateTaglinesInputSchema = z.object({
  name: z.string().describe('The name of the brand.'),
  elevatorPitch: z.string().describe('The elevator pitch for the brand.'),
  audience: z.string().describe('The target audience for the brand.'),
});
export type GenerateTaglinesInput = z.infer<
  typeof GenerateTaglinesInputSchema
>;

const GenerateTaglinesOutputSchema = z.object({
  taglines: z.array(z.string()).describe('A list of 4 generated taglines for the brand.'),
});
export type GenerateTaglinesOutput = z.infer<
  typeof GenerateTaglinesOutputSchema
>;

export async function generateTaglines(
  input: GenerateTaglinesInput
): Promise<GenerateTaglinesOutput> {
  return generateTaglineFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateTaglinePrompt',
  input: {schema: GenerateTaglinesInputSchema},
  output: {schema: GenerateTaglinesOutputSchema},
  prompt: `You are a marketing expert. Generate four catchy taglines for the following brand.

Brand Name: {{{name}}}
Elevator Pitch: {{{elevatorPitch}}}
Target Audience: {{{audience}}}

Generate four concise and memorable taglines.`,
});

const generateTaglineFlow = ai.defineFlow(
  {
    name: 'generateTaglineFlow',
    inputSchema: GenerateTaglinesInputSchema,
    outputSchema: GenerateTaglinesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
