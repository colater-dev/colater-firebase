import type {GenerateLogoInput} from '@/ai/flows/generate-logo';

export function buildPrompt(input: GenerateLogoInput): string {
  return `
    Create a bold geometric symbol that abstracts the core idea of the brand.
    Brand: ${input.name}
    Pitch: ${input.elevatorPitch}
    Audience: ${input.audience}
    Prefer strong silhouettes, negative space, and recognizable contours.
    Constraints: black on white only, SVG-like simplicity, no text.
    Desirable: ${input.desirableCues || 'None'}
    Undesirable: ${input.undesirableCues || 'None'}
  `;
}


