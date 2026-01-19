#!/usr/bin/env node

/**
 * Colater MCP Server
 * Main entry point
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { loadConfig } from './config.js';
import { ColaterAPIClient } from './api/client.js';
import { registerTools } from './tools/index.js';
import { logger } from './utils/logger.js';

async function main() {
  try {
    // Load configuration
    const config = await loadConfig();

    // Initialize API client
    const apiClient = new ColaterAPIClient(config.apiKey, config.apiEndpoint);

    // Create MCP server
    const server = new Server(
      {
        name: 'colater-mcp',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    // Register tools
    registerTools(server, apiClient, config);

    // Error handling
    server.onerror = (error) => {
      logger.error('Server error:', error);
    };

    // Create stdio transport
    const transport = new StdioServerTransport();

    // Connect server to transport
    await server.connect(transport);

    logger.info('Colater MCP Server started successfully');
    logger.info(`API Endpoint: ${config.apiEndpoint}`);
    logger.info(`Cache: ${config.cache.enabled ? 'enabled' : 'disabled'}`);
    if (config.defaultBrandId) {
      logger.info(`Default Brand: ${config.defaultBrandId}`);
    }
  } catch (error: any) {
    logger.error('Fatal error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Handle CLI commands
const args = process.argv.slice(2);

if (args.length > 0) {
  const command = args[0];

  if (command === 'init') {
    // Run init wizard
    import('./cli/init.js').then((mod) => mod.init());
  } else if (command === 'version' || command === '--version' || command === '-v') {
    console.log('colater-mcp v1.0.0');
    process.exit(0);
  } else if (command === 'help' || command === '--help' || command === '-h') {
    console.log(`
Colater MCP Server - Brand Intelligence Layer for AI Workflows

Usage:
  colater-mcp              Start the MCP server
  colater-mcp init         Run setup wizard
  colater-mcp version      Show version
  colater-mcp help         Show this help

Environment Variables:
  COLATER_API_KEY          API key (overrides config file)
  COLATER_MCP_LOG_LEVEL    Log level (debug, info, warn, error)

Configuration:
  Config file: ~/.colater/config.json
  Cache directory: ~/.colater/cache

Documentation:
  https://docs.colater.ai/mcp
    `);
    process.exit(0);
  } else {
    console.error(`Unknown command: ${command}`);
    console.error('Run "colater-mcp help" for usage information');
    process.exit(1);
  }
} else {
  // Start server
  main();
}
