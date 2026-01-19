/**
 * Tool: validate_brand_voice
 * Check if text matches brand voice and get rewrite suggestions
 */

import { z } from 'zod';
import { ColaterAPIClient } from '../api/client.js';
import { logger } from '../utils/logger.js';
import type { ColaterMCPConfig } from '../config.js';

const VoiceValidateInputSchema = z.object({
  brandId: z.string().optional(),
  text: z.string().max(5000, 'Text must be 5000 characters or less'),
  context: z.string().optional(),
  strictness: z.number().min(0).max(1).optional().default(0.7),
});

export type VoiceValidateInput = z.infer<typeof VoiceValidateInputSchema>;

export const voiceValidateTool = {
  name: 'validate_brand_voice',
  description:
    'Validate if text matches the brand voice and get suggestions for improvement. Returns a score, analysis, specific issues, and optionally an AI-generated rewrite.',
  inputSchema: {
    type: 'object',
    properties: {
      brandId: {
        type: 'string',
        description:
          'Brand ID to validate against. Optional, uses default brand if not provided.',
      },
      text: {
        type: 'string',
        description: 'Text to validate (max 5000 characters)',
      },
      context: {
        type: 'string',
        description:
          'Context of the text (e.g., "email", "social_post", "blog"). Helps improve validation accuracy.',
      },
      strictness: {
        type: 'number',
        description:
          'Validation strictness from 0 (lenient) to 1 (very strict). Default: 0.7',
      },
    },
    required: ['text'],
  },
};

export async function handleVoiceValidate(
  input: unknown,
  apiClient: ColaterAPIClient,
  config: ColaterMCPConfig
): Promise<string> {
  // Validate input
  const validatedInput = VoiceValidateInputSchema.parse(input);

  // Use default brand if not specified
  const brandId = validatedInput.brandId || config.defaultBrandId;

  if (!brandId) {
    throw new Error(
      'No brandId provided and no default brand configured. Please specify a brandId or set a default brand in config.'
    );
  }

  logger.info(
    `Validating brand voice for brand: ${brandId} (${validatedInput.text.length} chars)`
  );

  const result = await apiClient.validateBrandVoice({
    brandId,
    text: validatedInput.text,
    context: validatedInput.context,
    strictness: validatedInput.strictness,
  });

  logger.info(
    `Voice validation complete: score=${result.score.toFixed(2)}, onBrand=${result.onBrand}, issues=${result.issues.length}`
  );

  return JSON.stringify(result, null, 2);
}
