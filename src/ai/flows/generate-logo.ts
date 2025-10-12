'use server';
/**
 * @fileOverview Generates a logo for a brand using AI.
 *
 * - generateLogo - A function that generates a brand logo.
 * - GenerateLogoInput - The input type for the generateLogo function.
 * - GenerateLogoOutput - The return type for the generateLogo function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateLogoInputSchema = z.object({
  name: z.string().describe('The name of the brand.'),
  elevatorPitch: z.string().describe('The elevator pitch for the brand.'),
  audience: z.string().describe('The target audience for the brand.'),
  desirableCues: z.string().optional().describe('Desirable visual cues for the logo.'),
  undesirableCues: z.string().optional().describe('Undesirable visual cues for the logo.'),
});
export type GenerateLogoInput = z.infer<typeof GenerateLogoInputSchema>;

const GenerateLogoOutputSchema = z.object({
  logoUrl: z.string().describe('The data URI of the generated logo.'),
});
export type GenerateLogoOutput = z.infer<typeof GenerateLogoOutputSchema>;

export async function generateLogo(
  input: GenerateLogoInput
): Promise<GenerateLogoOutput> {
  return generateLogoFlow(input);
}

const generateLogoFlow = ai.defineFlow(
  {
    name: 'generateLogoFlow',
    inputSchema: GenerateLogoInputSchema,
    outputSchema: GenerateLogoOutputSchema,
  },
  async input => {
    const { media } = await ai.generate({
        model: 'googleai/imagen-4.0-fast-generate-001',
        prompt: `
        You are a logo designer. Generate a logo for the following brand:
        Brand Name: ${input.name}
        Brand Description: ${input.elevatorPitch}
        Target Audience: ${input.audience}
        Desirable Cues: ${input.desirableCues || 'None'}
        Undesirable Cues: ${input.undesirableCues || 'None'}

        The logo must adhere to the following design system:
        
        {
          "logo_style": {
            "overall_form": {
              "geometry": "geometric, constructed from basic shapes (circles, rectangles, triangles)",
              "silhouette_type": "solid, monolithic, minimal",
              "symmetry": "mostly symmetrical with intentional asymmetry for identity",
              "negative_space_usage": "moderate, purposeful"
            },
            "subject_matter": {
              "category": "animals, abstract forms, symbolic entities",
              "example_subject": "bird, fish, fox, leaf",
              "representation_level": "stylized, abstracted, non-literal"
            },
            "color": {
              "primary_color": "#000000",
              "background_color": "transparent",
              "contrast": "high",
              "uses_multiple_colors": false,
              "allow_gradient": false
            },
            "shape_language": {
              "edges": "smooth curves + sharp flat planes",
              "corner_style": "slightly rounded or blunt geometric cuts",
              "proportions": "compact, balanced weight",
              "visual_weight_distribution": "centered or forward-biased"
            },
            "eye_or_detail_features": {
              "detail_style": "single circular cutout or dot",
              "contrast_with_body": "high contrast (light on dark)",
              "allow_stroke": false
            },
            "line_and_stroke": {
              "use_strokes": false,
              "stroke_weight": "0px",
              "fill_style": "solid fill"
            },
            "background_treatment": {
              "type": "none",
              "padding": "generous negative space around icon",
              "shape": "none"
            },
            "composition": {
              "orientation": "horizontal bias if animal is used",
              "center_alignment": true,
              "rotation_allowed": false,
              "scalability": "vector-friendly"
            },
            "mood_and_tone": {
              "tone": "friendly, modern, understated",
              "visual_voice": "playful-minimalist, professional"
            },
            "output": {
              "format": "png",
              "aspect_ratio": "1:1",
              "resolution": "256x256",
              "background_included": false
            }
          },
          "variation_controls": {
            "allowed_mutations": [
              "swap animal/form type",
              "adjust wing or limb shapes",
              "change head-body proportion",
              "introduce negative space cuts"
            ],
            "constraints": {
              "keep solid fill": true,
              "maintain single color": true,
              "avoid realism": true
            }
          },
          "generation_instructions": {
            "prompt_tone": "design-system precise, not illustrative",
            "output_goal": "logo icon suitable for identity or symbol mark",
            "avoid": [
              "gradients",
              "thin lines",
              "outlines",
              "strokes",
              "textures",
              "multiple colors",
              "literal realism"
            ]
          }
        }
        
        Do not include any text in the logo. The logo must be on a transparent background and have no outline or border.
        `,
        config: {
          responseModalities: ['IMAGE'],
        },
      });

    if (!media.url) {
      throw new Error('Image generation failed to return a data URI.');
    }
      
    return { logoUrl: media.url };
  }
);
