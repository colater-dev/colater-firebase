'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const StorySchema = z.object({
    headline: z.string().describe('A catchy headline for the story.'),
    body: z.string().describe('The main content of the story, engaging and talking about the product.'),
});

const GenerateStoriesInputSchema = z.object({
    name: z.string().describe('The name of the brand.'),
    elevatorPitch: z.string().describe('The elevator pitch for the brand.'),
});

export type GenerateStoriesInput = z.infer<typeof GenerateStoriesInputSchema>;

const GenerateStoriesOutputSchema = z.object({
    stories: z.array(StorySchema).describe('A list of 3 generated Instagram stories.'),
});

export type GenerateStoriesOutput = z.infer<typeof GenerateStoriesOutputSchema>;

export async function generateStories(input: GenerateStoriesInput): Promise<GenerateStoriesOutput> {
    return generateStoriesFlow(input);
}

const prompt = ai.definePrompt({
    name: 'generateStoriesPrompt',
    input: { schema: GenerateStoriesInputSchema },
    output: { schema: GenerateStoriesOutputSchema },
    prompt: `You are a social media marketing expert. Generate 3 engaging Instagram stories for the brand "{{name}}".
The brand's elevator pitch is: "{{elevatorPitch}}"

Each story should have a catchy headline and a body that talks about its products or services in an engaging way.
Keep the tone modern, professional, and consistent with the brand's pitch.`,
});

const generateStoriesFlow = ai.defineFlow(
    {
        name: 'generateStoriesFlow',
        inputSchema: GenerateStoriesInputSchema,
        outputSchema: GenerateStoriesOutputSchema,
    },
    async input => {
        const { output } = await prompt(input);
        return output!;
    }
);
