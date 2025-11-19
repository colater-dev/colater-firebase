'use server';
/**
 * @fileOverview Generates a logo concept/prompt for a brand using AI.
 *
 * - generateLogoConcept - A function that generates a logo concept as a brand designer would.
 * - GenerateLogoConceptInput - The input type for the generateLogoConcept function.
 * - GenerateLogoConceptOutput - The return type for the generateLogoConcept function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateLogoConceptInputSchema = z.object({
  name: z.string().describe('The name of the brand.'),
  elevatorPitch: z.string().describe('The elevator pitch for the brand.'),
  audience: z.string().describe('The target audience for the brand.'),
  desirableCues: z.string().optional().describe('Desirable visual cues for the brand identity.'),
  undesirableCues: z.string().optional().describe('Undesirable visual cues for the brand identity.'),
});
export type GenerateLogoConceptInput = z.infer<
  typeof GenerateLogoConceptInputSchema
>;

const GenerateLogoConceptOutputSchema = z.object({
  concept: z.string().describe('A detailed logo concept and prompt that can be used for visual model generation.'),
  stylePrompt: z.string().describe('A concise style prompt focused on visual design elements.'),
});
export type GenerateLogoConceptOutput = z.infer<
  typeof GenerateLogoConceptOutputSchema
>;

export async function generateLogoConcept(
  input: GenerateLogoConceptInput
): Promise<GenerateLogoConceptOutput> {
  return generateLogoConceptFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateLogoConceptPrompt',
  input: {schema: GenerateLogoConceptInputSchema},
  output: {schema: GenerateLogoConceptOutputSchema},
  prompt: `You are an expert brand designer with years of experience creating iconic logos for companies across industries. Your task is to analyze the brand information and create a comprehensive logo concept that can be used to generate a visual logo.

Brand Name: {{{name}}}
Elevator Pitch: {{{elevatorPitch}}}
Target Audience: {{{audience}}}
Desirable Visual Cues: {{{desirableCues}}}
Undesirable Visual Cues: {{{undesirableCues}}}

As a brand designer, analyze this information and create:

1. A detailed logo concept (2-3 sentences) that describes:
   - Describe the visual style, shapes, forms, and composition, but don't use the name directly as this confuses visual models
   - The exact visual metaphor to use for the logo - either one or a combination of upto 2 ideas
   - Symbolic elements that should represent the brand
   - Design principles that align with the brand identity
   - Specific visual characteristics and composition

2. A concise style prompt (2-3 sentences) that focuses purely on visual design elements and can be directly used for image generation. This should:
   - Specify design characteristics (geometric, organic, minimalist, smooth etc.)
   - Include technical details about the visual approach
   - NOT include the brand name or elevator pitch text
   - Be actionable and specific for a visual model
   - Make sure the logo is a monochrome black iocn on a white background only. This is very important.

Think like a professional brand designer who understands how to translate brand strategy into visual identity.`,
});

const generateLogoConceptFlow = ai.defineFlow(
  {
    name: 'generateLogoConceptFlow',
    inputSchema: GenerateLogoConceptInputSchema,
    outputSchema: GenerateLogoConceptOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

