/**
 * Tool: get_brand_assets
 * Retrieve brand assets (logos, colors, fonts) in various formats
 */

import { z } from 'zod';
import { ColaterAPIClient } from '../api/client.js';
import { withCache } from '../cache.js';
import { logger } from '../utils/logger.js';
import type { ColaterMCPConfig } from '../config.js';

const AssetsGetInputSchema = z.object({
  brandId: z.string().optional(),
  assetTypes: z.array(z.enum(['logo', 'colors', 'fonts', 'mockups'])),
  format: z
    .object({
      logo: z.enum(['url', 'svg', 'png', 'data_uri']).optional(),
      colors: z
        .enum(['hex', 'rgb', 'hsl', 'tailwind', 'css', 'figma'])
        .optional(),
      fonts: z
        .enum(['names', 'google_fonts_url', 'css_imports'])
        .optional(),
    })
    .optional(),
});

export type AssetsGetInput = z.infer<typeof AssetsGetInputSchema>;

export const assetsGetTool = {
  name: 'get_brand_assets',
  description:
    'Retrieve brand assets including logos, color palettes, and fonts in various formats. Perfect for integrating brand identity into designs, code, or documentation.',
  inputSchema: {
    type: 'object',
    properties: {
      brandId: {
        type: 'string',
        description:
          'Brand ID to retrieve assets for. Optional, uses default brand if not provided.',
      },
      assetTypes: {
        type: 'array',
        items: {
          type: 'string',
          enum: ['logo', 'colors', 'fonts', 'mockups'],
        },
        description: 'Types of assets to retrieve',
      },
      format: {
        type: 'object',
        properties: {
          logo: {
            type: 'string',
            enum: ['url', 'svg', 'png', 'data_uri'],
            description: 'Format for logo assets',
          },
          colors: {
            type: 'string',
            enum: ['hex', 'rgb', 'hsl', 'tailwind', 'css', 'figma'],
            description: 'Format for color palette',
          },
          fonts: {
            type: 'string',
            enum: ['names', 'google_fonts_url', 'css_imports'],
            description: 'Format for font information',
          },
        },
        description: 'Specify output formats for each asset type',
      },
    },
    required: ['assetTypes'],
  },
};

export async function handleAssetsGet(
  input: unknown,
  apiClient: ColaterAPIClient,
  config: ColaterMCPConfig
): Promise<string> {
  // Validate input
  const validatedInput = AssetsGetInputSchema.parse(input);

  // Use default brand if not specified
  const brandId = validatedInput.brandId || config.defaultBrandId;

  if (!brandId) {
    throw new Error(
      'No brandId provided and no default brand configured. Please specify a brandId or set a default brand in config.'
    );
  }

  logger.info(
    `Fetching brand assets for brand: ${brandId} (types: ${validatedInput.assetTypes.join(', ')})`
  );

  // Build cache key
  const cacheKey = `brand_assets_${brandId}_${JSON.stringify(validatedInput)}`;

  // Execute with caching if enabled
  const result = config.cache.enabled
    ? await withCache(
        cacheKey,
        async () => {
          return await apiClient.getBrandAssets({
            brandId,
            assetTypes: validatedInput.assetTypes,
            format: validatedInput.format,
          });
        },
        config.cache.ttl
      )
    : await apiClient.getBrandAssets({
        brandId,
        assetTypes: validatedInput.assetTypes,
        format: validatedInput.format,
      });

  logger.info('Successfully retrieved brand assets');

  return JSON.stringify(result, null, 2);
}
