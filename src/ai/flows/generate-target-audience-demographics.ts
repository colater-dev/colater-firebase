'use server';
/**
 * @fileOverview Generates target audience demographics based on an elevator pitch using AI.
 *
 * - generateTargetAudienceDemographics - A function that generates target audience demographics.
 * - GenerateTargetAudienceDemographicsInput - The input type for the generateTargetAudienceDemographics function.
 * - GenerateTargetAudienceDemographicsOutput - The return type for the generateTargetAudienceDemographics function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateTargetAudienceDemographicsInputSchema = z.object({
  elevatorPitch: z.string().describe('The elevator pitch of the brand.'),
});
export type GenerateTargetAudienceDemographicsInput = z.infer<
  typeof GenerateTargetAudienceDemographicsInputSchema
>;

const GenerateTargetAudienceDemographicsOutputSchema = z.object({
  suggestedDemographics: z
    .array(z.string())
    .describe('The suggested target audience demographics.'),
});
export type GenerateTargetAudienceDemographicsOutput = z.infer<
  typeof GenerateTargetAudienceDemographicsOutputSchema
>;

export async function generateTargetAudienceDemographics(
  input: GenerateTargetAudienceDemographicsInput
): Promise<GenerateTargetAudienceDemographicsOutput> {
  return generateTargetAudienceDemographicsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateTargetAudienceDemographicsPrompt',
  input: {schema: GenerateTargetAudienceDemographicsInputSchema},
  output: {schema: GenerateTargetAudienceDemographicsOutputSchema},
  prompt: `You are a marketing expert. Analyze the following elevator pitch and suggest potential target audience demographics.
\nElevator Pitch: {{{elevatorPitch}}}
\nSuggest target audience demographics as a list of strings. The list should not be exhaustive, but explore several different avenues. Consider age, location, interests, income, occupation, etc. Try to name the specific demographic if possible.
\nFor example:
[\"Young adults aged 18-25 interested in sustainable living\", \"Professionals aged 30-45 in the tech industry\", \"Retirees aged 65+ interested in travel and leisure\"]`,
});

const generateTargetAudienceDemographicsFlow = ai.defineFlow(
  {
    name: 'generateTargetAudienceDemographicsFlow',
    inputSchema: GenerateTargetAudienceDemographicsInputSchema,
    outputSchema: GenerateTargetAudienceDemographicsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
