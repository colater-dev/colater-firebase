/**
 * Tool: get_brand_context
 * Retrieve complete brand context including identity, voice, and visual guidelines
 */

import { z } from 'zod';
import { ColaterAPIClient } from '../api/client.js';
import { withCache } from '../cache.js';
import { logger } from '../utils/logger.js';
import type { ColaterMCPConfig } from '../config.js';

const BrandContextInputSchema = z.object({
  brandId: z.string().optional(),
  sections: z
    .array(z.enum(['identity', 'voice', 'visual', 'positioning']))
    .optional(),
  includeAssets: z.boolean().optional().default(true),
});

export type BrandContextInput = z.infer<typeof BrandContextInputSchema>;

export const brandContextTool = {
  name: 'get_brand_context',
  description:
    'Retrieve complete brand context including identity, voice, and visual guidelines. Use this to understand brand positioning, tone, colors, fonts, and design system.',
  inputSchema: {
    type: 'object',
    properties: {
      brandId: {
        type: 'string',
        description:
          'Brand ID to retrieve context for. Optional, uses default brand if not provided.',
      },
      sections: {
        type: 'array',
        items: {
          type: 'string',
          enum: ['identity', 'voice', 'visual', 'positioning'],
        },
        description:
          'Optional filter for specific sections. If not provided, returns all sections.',
      },
      includeAssets: {
        type: 'boolean',
        description: 'Include logo URLs and other visual assets. Default: true',
      },
    },
  },
};

export async function handleBrandContext(
  input: unknown,
  apiClient: ColaterAPIClient,
  config: ColaterMCPConfig
): Promise<string> {
  // Validate input
  const validatedInput = BrandContextInputSchema.parse(input);

  // Use default brand if not specified
  const brandId = validatedInput.brandId || config.defaultBrandId;

  if (!brandId) {
    throw new Error(
      'No brandId provided and no default brand configured. Please specify a brandId or set a default brand in config.'
    );
  }

  logger.info(`Fetching brand context for brand: ${brandId}`);

  // Build cache key
  const cacheKey = `brand_context_${brandId}_${JSON.stringify(
    validatedInput.sections || 'all'
  )}_${validatedInput.includeAssets}`;

  // Execute with caching if enabled
  const result = config.cache.enabled
    ? await withCache(
        cacheKey,
        async () => {
          return await apiClient.getBrandContext({
            brandId,
            sections: validatedInput.sections,
            includeAssets: validatedInput.includeAssets,
          });
        },
        config.cache.ttl
      )
    : await apiClient.getBrandContext({
        brandId,
        sections: validatedInput.sections,
        includeAssets: validatedInput.includeAssets,
      });

  logger.info(`Successfully retrieved brand context for: ${result.brand.name}`);

  return JSON.stringify(result, null, 2);
}
