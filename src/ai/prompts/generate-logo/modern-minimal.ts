import type {GenerateLogoInput} from '@/ai/flows/generate-logo';

export function buildPrompt(input: GenerateLogoInput): string {
  return `
    You are a world class brand designer. Design a modern, minimalist, and geometric vector-style icon for the brand described below.
    **Brand Details:**
    - **Brand Name:** ${input.name}
    - **Brand Description:** ${input.elevatorPitch}
    - **Target Audience:** ${input.audience}

    **Design System & Style Guidelines:**
    - The logo must be simple, abstract, and symbolic.
    - Only black shapes against a plain white background.
    - Avoid more than 2 combined shape ideas.
    - Desirable Cues: ${input.desirableCues || 'None'}
    - Undesirable Cues: ${input.undesirableCues || 'None'}

    **Avoid:** gradients, thin lines, outlines, strokes, textures, multiple colors, or realism.
  `;
}


