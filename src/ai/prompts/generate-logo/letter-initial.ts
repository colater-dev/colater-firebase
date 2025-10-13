import type {GenerateLogoInput} from '@/ai/flows/generate-logo';

export function buildPrompt(input: GenerateLogoInput): string {
  const letter = (input.name || '').trim().charAt(0).toUpperCase();
  return `
    Design a bold, minimalist monogram logo derived from the single letter "${letter}" of the brand name.

    Brand Name: ${input.name}
    Brand Description: ${input.elevatorPitch}
    Target Audience: ${input.audience}

    Directions:
    - Use only black shapes on a plain white background (no text labels).
    - Explore clever negative space and geometric construction to stylize the letter "${letter}".
    - Prioritize strong silhouette readability at small sizes; avoid thin strokes.
    - Keep it abstract and timeless, with excellent balance and symmetry.
    - Desirable cues: ${input.desirableCues || 'None'}
    - Undesirable cues: ${input.undesirableCues || 'None'}

    Avoid gradients, textures, outlines, multiple colors, and realism.
  `;
}


