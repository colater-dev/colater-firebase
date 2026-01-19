/**
 * Local caching layer for Colater MCP Server
 */

import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { logger } from './utils/logger.js';

const CACHE_DIR = path.join(os.homedir(), '.colater', 'cache');

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

/**
 * Ensure cache directory exists
 */
async function ensureCacheDir() {
  await fs.mkdir(CACHE_DIR, { recursive: true });
}

/**
 * Get cache file path for a key
 */
async function getCacheFile(key: string): Promise<string> {
  // Hash the key to create a safe filename
  const hash = Buffer.from(key).toString('base64url');
  return path.join(CACHE_DIR, `${hash}.json`);
}

/**
 * Get cached value
 */
export async function getCache<T>(key: string): Promise<T | null> {
  await ensureCacheDir();
  const file = await getCacheFile(key);

  try {
    const data = await fs.readFile(file, 'utf-8');
    const entry: CacheEntry<T> = JSON.parse(data);

    if (Date.now() > entry.expiresAt) {
      logger.debug(`Cache expired for key: ${key}`);
      await fs.unlink(file).catch(() => {});
      return null;
    }

    logger.debug(`Cache hit for key: ${key}`);
    return entry.value;
  } catch (error: any) {
    if (error.code !== 'ENOENT') {
      logger.warn(`Cache read error for key ${key}:`, error.message);
    }
    return null;
  }
}

/**
 * Set cached value
 */
export async function setCache<T>(key: string, value: T, ttl: number): Promise<void> {
  await ensureCacheDir();
  const file = await getCacheFile(key);

  const entry: CacheEntry<T> = {
    value,
    expiresAt: Date.now() + (ttl * 1000),
  };

  try {
    await fs.writeFile(file, JSON.stringify(entry), 'utf-8');
    logger.debug(`Cache set for key: ${key} (TTL: ${ttl}s)`);
  } catch (error: any) {
    logger.warn(`Cache write error for key ${key}:`, error.message);
  }
}

/**
 * Clear cache for a specific key
 */
export async function clearCache(key: string): Promise<void> {
  const file = await getCacheFile(key);
  try {
    await fs.unlink(file);
    logger.debug(`Cache cleared for key: ${key}`);
  } catch (error: any) {
    if (error.code !== 'ENOENT') {
      logger.warn(`Cache clear error for key ${key}:`, error.message);
    }
  }
}

/**
 * Clear all cached values
 */
export async function clearAllCache(): Promise<void> {
  try {
    await fs.rm(CACHE_DIR, { recursive: true, force: true });
    logger.info('All cache cleared');
  } catch (error: any) {
    logger.warn('Cache clear all error:', error.message);
  }
}

/**
 * Execute function with caching
 */
export async function withCache<T>(
  key: string,
  fn: () => Promise<T>,
  ttl: number
): Promise<T> {
  // Try to get from cache
  const cached = await getCache<T>(key);
  if (cached !== null) {
    return cached;
  }

  // Execute function
  const value = await fn();

  // Cache the result
  await setCache(key, value, ttl);

  return value;
}
