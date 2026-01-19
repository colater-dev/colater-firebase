/**
 * Custom error types for Colater MCP
 */

export enum ColaterMCPErrorCode {
  // Authentication
  INVALID_API_KEY = 'INVALID_API_KEY',
  EXPIRED_API_KEY = 'EXPIRED_API_KEY',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',

  // Brand
  BRAND_NOT_FOUND = 'BRAND_NOT_FOUND',
  BRAND_ACCESS_DENIED = 'BRAND_ACCESS_DENIED',

  // Validation
  INVALID_INPUT = 'INVALID_INPUT',
  TEXT_TOO_LONG = 'TEXT_TOO_LONG',

  // API
  API_ERROR = 'API_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',

  // Generation
  GENERATION_FAILED = 'GENERATION_FAILED',
  ASSET_GENERATION_TIMEOUT = 'ASSET_GENERATION_TIMEOUT',

  // Configuration
  CONFIG_NOT_FOUND = 'CONFIG_NOT_FOUND',
  INVALID_CONFIG = 'INVALID_CONFIG',
}

export class ColaterMCPError extends Error {
  constructor(
    public code: ColaterMCPErrorCode,
    message: string,
    public details?: any,
    public retryable: boolean = false
  ) {
    super(message);
    this.name = 'ColaterMCPError';
  }

  toJSON() {
    return {
      error: {
        code: this.code,
        message: this.message,
        details: this.details,
        retryable: this.retryable,
        documentation: `https://docs.colater.ai/mcp/errors#${this.code}`,
      },
    };
  }
}
