'use server';
/**
 * @fileOverview Completes brand details (audience, cues) based on name and pitch.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const CompleteBrandDetailsInputSchema = z.object({
    name: z.string().describe('The name of the brand.'),
    elevatorPitch: z.string().describe('The elevator pitch for the brand.'),
});
export type CompleteBrandDetailsInput = z.infer<
    typeof CompleteBrandDetailsInputSchema
>;

const CompleteBrandDetailsOutputSchema = z.object({
    audience: z.string().describe('The target audience for the brand.'),
    desirableCues: z
        .string()
        .describe('A few keywords for desirable visual cues for the brand identity (e.g., minimalist, elegant).'),
    undesirableCues: z
        .string()
        .describe('A few keywords for undesirable visual cues for the brand identity (e.g., complex, childish).'),
});
export type CompleteBrandDetailsOutput = z.infer<
    typeof CompleteBrandDetailsOutputSchema
>;

export async function completeBrandDetails(
    input: CompleteBrandDetailsInput
): Promise<CompleteBrandDetailsOutput> {
    return completeBrandDetailsFlow(input);
}

const prompt = ai.definePrompt({
    name: 'completeBrandDetailsPrompt',
    input: { schema: CompleteBrandDetailsInputSchema },
    output: { schema: CompleteBrandDetailsOutputSchema },
    prompt: `You are a branding expert. Based on the following brand name and elevator pitch, generate the remaining brand identity details.

Brand Name: {{{name}}}
Elevator Pitch: {{{elevatorPitch}}}

Generate a description of the target audience, and a few desirable and undesirable visual cues that would fit this brand.`,
});

const completeBrandDetailsFlow = ai.defineFlow(
    {
        name: 'completeBrandDetailsFlow',
        inputSchema: CompleteBrandDetailsInputSchema,
        outputSchema: CompleteBrandDetailsOutputSchema,
    },
    async input => {
        const { output } = await prompt(input);
        return output!;
    }
);
