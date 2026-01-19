/**
 * Configuration management for Colater MCP Server
 */

import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { logger } from './utils/logger.js';
import { ColaterMCPError, ColaterMCPErrorCode } from './utils/errors.js';

export interface ColaterMCPConfig {
  apiKey: string;
  apiEndpoint: string;
  defaultBrandId?: string;
  cache: {
    enabled: boolean;
    ttl: number;
  };
}

const DEFAULT_CONFIG: Partial<ColaterMCPConfig> = {
  apiEndpoint: 'https://colater.ai/api/mcp',
  cache: {
    enabled: true,
    ttl: 300, // 5 minutes
  },
};

const CONFIG_DIR = path.join(os.homedir(), '.colater');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

/**
 * Load configuration from file or environment
 */
export async function loadConfig(): Promise<ColaterMCPConfig> {
  // Try environment variable first
  const envApiKey = process.env.COLATER_API_KEY;

  if (envApiKey) {
    logger.debug('Using API key from environment variable');
    return {
      ...DEFAULT_CONFIG,
      apiKey: envApiKey,
    } as ColaterMCPConfig;
  }

  // Try config file
  try {
    const configData = await fs.readFile(CONFIG_FILE, 'utf-8');
    const config = JSON.parse(configData);

    if (!config.apiKey) {
      throw new ColaterMCPError(
        ColaterMCPErrorCode.INVALID_CONFIG,
        'API key not found in config file'
      );
    }

    logger.debug('Loaded configuration from file');
    return {
      ...DEFAULT_CONFIG,
      ...config,
    } as ColaterMCPConfig;
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      throw new ColaterMCPError(
        ColaterMCPErrorCode.CONFIG_NOT_FOUND,
        `Configuration file not found at ${CONFIG_FILE}. Run 'colater-mcp init' to set up.`
      );
    }

    if (error instanceof ColaterMCPError) {
      throw error;
    }

    throw new ColaterMCPError(
      ColaterMCPErrorCode.INVALID_CONFIG,
      `Failed to load configuration: ${error.message}`
    );
  }
}

/**
 * Save configuration to file
 */
export async function saveConfig(config: ColaterMCPConfig): Promise<void> {
  await fs.mkdir(CONFIG_DIR, { recursive: true });
  await fs.writeFile(CONFIG_FILE, JSON.stringify(config, null, 2));
  logger.info(`Configuration saved to ${CONFIG_FILE}`);
}

/**
 * Get configuration directory path
 */
export function getConfigDir(): string {
  return CONFIG_DIR;
}

/**
 * Get configuration file path
 */
export function getConfigFile(): string {
  return CONFIG_FILE;
}
