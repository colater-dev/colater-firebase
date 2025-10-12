'use server';
/**
 * @fileOverview Shifts the hue of a list of colors using AI.
 *
 * - hueshiftColors - A function that shifts the hue of colors.
 * - HueshiftColorsInput - The input type for the hueshiftColors function.
 * - HueshiftColorsOutput - The return type for the hueshiftColors function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const HueshiftColorsInputSchema = z.object({
  colors: z.array(z.string()).describe('An array of hex color codes.'),
  hueShift: z
    .number()
    .min(0)
    .max(360)
    .describe(
      'The amount to shift the hue, in degrees (0-360).'
    ),
});
export type HueshiftColorsInput = z.infer<typeof HueshiftColorsInputSchema>;

const HueshiftColorsOutputSchema = z.object({
  newColors: z
    .array(z.string())
    .describe('The array of new hex color codes with the hue shifted.'),
});
export type HueshiftColorsOutput = z.infer<typeof HueshiftColorsOutputSchema>;

export async function hueshiftColors(
  input: HueshiftColorsInput
): Promise<HueshiftColorsOutput> {
  return hueshiftColorsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'hueshiftColorsPrompt',
  input: {schema: HueshiftColorsInputSchema},
  output: {schema: HueshiftColorsOutputSchema},
  prompt: `You are a color theory expert. Your task is to perform a hue shift operation on a given list of colors.

Original Colors (Hex): {{{json colors}}}
Hue Shift Amount (degrees): {{{hueShift}}}

Instructions:
1. For each color in the original list, convert it from Hex to HSL.
2. Add the 'Hue Shift Amount' to the Hue value of the HSL color. If the new Hue value exceeds 360, wrap it around (e.g., 370 becomes 10).
3. Convert the new HSL color back to a Hex code.
4. Return the new list of Hex codes in the 'newColors' field of the output.`,
});


const hueshiftColorsFlow = ai.defineFlow(
  {
    name: 'hueshiftColorsFlow',
    inputSchema: HueshiftColorsInputSchema,
    outputSchema: HueshiftColorsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
