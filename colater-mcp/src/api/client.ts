/**
 * HTTP client for Colater API
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import { logger } from '../utils/logger.js';
import { ColaterMCPError, ColaterMCPErrorCode } from '../utils/errors.js';
import type {
  BrandContextResponse,
  VoiceValidationResponse,
  ContentGenerationResponse,
  BrandAssetsResponse,
  ListBrandsResponse,
} from './types.js';

export class ColaterAPIClient {
  private client: AxiosInstance;

  constructor(apiKey: string, baseURL: string = 'https://colater.ai/api/mcp') {
    this.client = axios.create({
      baseURL,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'User-Agent': 'colater-mcp/1.0.0',
      },
      timeout: 30000,
    });

    // Request logging
    this.client.interceptors.request.use((config) => {
      logger.debug(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
      return config;
    });

    // Error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response) {
          const status = error.response.status;
          const data: any = error.response.data;

          logger.error(`API Error: ${status} ${error.response.statusText}`);

          // Map HTTP status to MCP error codes
          if (status === 401) {
            throw new ColaterMCPError(
              ColaterMCPErrorCode.INVALID_API_KEY,
              'Invalid or expired API key',
              { status }
            );
          } else if (status === 403) {
            throw new ColaterMCPError(
              ColaterMCPErrorCode.INSUFFICIENT_PERMISSIONS,
              data?.message || 'Insufficient permissions',
              { status }
            );
          } else if (status === 404) {
            throw new ColaterMCPError(
              ColaterMCPErrorCode.BRAND_NOT_FOUND,
              data?.message || 'Brand not found',
              { status }
            );
          } else if (status === 429) {
            throw new ColaterMCPError(
              ColaterMCPErrorCode.RATE_LIMIT_EXCEEDED,
              'Rate limit exceeded',
              { status, retryAfter: error.response.headers['retry-after'] },
              true
            );
          } else if (status >= 500) {
            throw new ColaterMCPError(
              ColaterMCPErrorCode.API_ERROR,
              data?.message || 'Server error',
              { status },
              true
            );
          }

          throw new ColaterMCPError(
            ColaterMCPErrorCode.API_ERROR,
            data?.message || error.message,
            { status }
          );
        } else if (error.request) {
          logger.error('API Error: No response received');
          throw new ColaterMCPError(
            ColaterMCPErrorCode.NETWORK_ERROR,
            'Network error: Could not reach Colater API',
            undefined,
            true
          );
        } else {
          logger.error(`API Error: ${error.message}`);
          throw new ColaterMCPError(
            ColaterMCPErrorCode.API_ERROR,
            error.message
          );
        }
      }
    );
  }

  /**
   * Get brand context
   */
  async getBrandContext(input: {
    brandId?: string;
    sections?: string[];
    includeAssets?: boolean;
  }): Promise<BrandContextResponse> {
    const response = await this.client.post('/brands/context', input);
    return response.data;
  }

  /**
   * Validate brand voice
   */
  async validateBrandVoice(input: {
    brandId?: string;
    text: string;
    context?: string;
    strictness?: number;
  }): Promise<VoiceValidationResponse> {
    const response = await this.client.post('/voice/validate', input);
    return response.data;
  }

  /**
   * Generate branded content
   */
  async generateBrandedContent(input: {
    brandId?: string;
    contentType: string;
    prompt: string;
    tone?: string;
    length?: string;
    platform?: string;
  }): Promise<ContentGenerationResponse> {
    const response = await this.client.post('/content/generate', input);
    return response.data;
  }

  /**
   * Get brand assets
   */
  async getBrandAssets(input: {
    brandId?: string;
    assetTypes: string[];
    format?: Record<string, string>;
  }): Promise<BrandAssetsResponse> {
    const response = await this.client.post('/assets/get', input);
    return response.data;
  }

  /**
   * List brands
   */
  async listBrands(input: {
    limit?: number;
    offset?: number;
    sortBy?: string;
    filter?: Record<string, any>;
  }): Promise<ListBrandsResponse> {
    const response = await this.client.post('/brands/list', input);
    return response.data;
  }
}
