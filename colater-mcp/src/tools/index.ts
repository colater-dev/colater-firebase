/**
 * Tool registry for Colater MCP Server
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { ColaterAPIClient } from '../api/client.js';
import type { ColaterMCPConfig } from '../config.js';
import { logger } from '../utils/logger.js';

import {
  brandContextTool,
  handleBrandContext,
} from './brand-context.js';
import {
  voiceValidateTool,
  handleVoiceValidate,
} from './voice-validate.js';
import {
  assetsGetTool,
  handleAssetsGet,
} from './assets-get.js';
import {
  brandsListTool,
  handleBrandsList,
} from './brands-list.js';

/**
 * Register all tools with the MCP server
 */
export function registerTools(
  server: Server,
  apiClient: ColaterAPIClient,
  config: ColaterMCPConfig
) {
  // List available tools
  server.setRequestHandler('tools/list', async () => {
    logger.debug('Listing available tools');
    return {
      tools: [
        brandContextTool,
        voiceValidateTool,
        assetsGetTool,
        brandsListTool,
      ],
    };
  });

  // Handle tool calls
  server.setRequestHandler('tools/call', async (request) => {
    const { name, arguments: args } = request.params;

    logger.info(`Tool called: ${name}`);

    try {
      let result: string;

      switch (name) {
        case 'get_brand_context':
          result = await handleBrandContext(args, apiClient, config);
          break;

        case 'validate_brand_voice':
          result = await handleVoiceValidate(args, apiClient, config);
          break;

        case 'get_brand_assets':
          result = await handleAssetsGet(args, apiClient, config);
          break;

        case 'list_brands':
          result = await handleBrandsList(args, apiClient, config);
          break;

        default:
          throw new Error(`Unknown tool: ${name}`);
      }

      return {
        content: [
          {
            type: 'text',
            text: result,
          },
        ],
      };
    } catch (error: any) {
      logger.error(`Tool execution error: ${error.message}`);

      // Return error in MCP format
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                error: {
                  message: error.message,
                  code: error.code || 'TOOL_ERROR',
                  details: error.details,
                },
              },
              null,
              2
            ),
          },
        ],
        isError: true,
      };
    }
  });

  logger.info('Registered 4 tools');
}
