/**
 * Tool: list_brands
 * List all brands accessible to the authenticated user
 */

import { z } from 'zod';
import { ColaterAPIClient } from '../api/client.js';
import { logger } from '../utils/logger.js';
import type { ColaterMCPConfig } from '../config.js';

const BrandsListInputSchema = z.object({
  limit: z.number().min(1).max(100).optional().default(50),
  offset: z.number().min(0).optional().default(0),
  sortBy: z.enum(['name', 'created', 'updated']).optional().default('updated'),
  filter: z
    .object({
      search: z.string().optional(),
      hasLogo: z.boolean().optional(),
    })
    .optional(),
});

export type BrandsListInput = z.infer<typeof BrandsListInputSchema>;

export const brandsListTool = {
  name: 'list_brands',
  description:
    'List all brands accessible to the authenticated user. Useful for discovering available brands, searching by name, or getting an overview of your brand portfolio.',
  inputSchema: {
    type: 'object',
    properties: {
      limit: {
        type: 'number',
        description: 'Maximum number of results to return (1-100). Default: 50',
      },
      offset: {
        type: 'number',
        description: 'Number of results to skip for pagination. Default: 0',
      },
      sortBy: {
        type: 'string',
        enum: ['name', 'created', 'updated'],
        description: 'Sort order for results. Default: updated',
      },
      filter: {
        type: 'object',
        properties: {
          search: {
            type: 'string',
            description: 'Search brands by name',
          },
          hasLogo: {
            type: 'boolean',
            description: 'Filter to only brands with logos',
          },
        },
        description: 'Optional filters to narrow results',
      },
    },
  },
};

export async function handleBrandsList(
  input: unknown,
  apiClient: ColaterAPIClient,
  config: ColaterMCPConfig
): Promise<string> {
  // Validate input
  const validatedInput = BrandsListInputSchema.parse(input);

  logger.info(
    `Listing brands (limit: ${validatedInput.limit}, offset: ${validatedInput.offset}, sortBy: ${validatedInput.sortBy})`
  );

  const result = await apiClient.listBrands({
    limit: validatedInput.limit,
    offset: validatedInput.offset,
    sortBy: validatedInput.sortBy,
    filter: validatedInput.filter,
  });

  logger.info(
    `Successfully retrieved ${result.brands.length} brands (total: ${result.pagination.total})`
  );

  return JSON.stringify(result, null, 2);
}
