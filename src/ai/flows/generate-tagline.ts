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
  desirableCues: z.string().optional().describe('Desirable visual cues for the brand identity.'),
  undesirableCues: z.string().optional().describe('Undesirable visual cues for the brand identity.'),
});
export type GenerateTaglinesInput = z.infer<
  typeof GenerateTaglinesInputSchema
>;

const GenerateTaglinesOutputSchema = z.object({
  taglines: z.array(z.string()).describe('A list of generated taglines for the brand.'),
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
  prompt: `You are a marketing expert. Generate a few catchy taglines for the following brand.

Brand Name: {{{name}}}
Elevator Pitch: {{{elevatorPitch}}}
Target Audience: {{{audience}}}
Desirable Cues: {{{desirableCues}}}
Undesirable Cues: {{{undesirableCues}}}

Generate a few concise and memorable taglines. Do not repeat the brand name at the start of the tagline. For example, for a brand named "Bork", a good tagline is "Every bark, understood." and a bad tagline is "Bork: Every bark, understood.".`,
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
