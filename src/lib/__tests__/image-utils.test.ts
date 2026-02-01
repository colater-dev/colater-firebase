import { describe, it, expect } from 'vitest';
import { getProxyUrl } from '../image-utils';

describe('getProxyUrl', () => {
  it('returns empty string for undefined', () => {
    expect(getProxyUrl(undefined)).toBe('');
  });

  it('returns empty string for null', () => {
    expect(getProxyUrl(null)).toBe('');
  });

  it('returns empty string for empty string', () => {
    expect(getProxyUrl('')).toBe('');
  });

  it('returns data URIs unchanged', () => {
    const dataUri = 'data:image/png;base64,abc123';
    expect(getProxyUrl(dataUri)).toBe(dataUri);
  });

  it('returns root-relative paths unchanged', () => {
    expect(getProxyUrl('/images/logo.png')).toBe('/images/logo.png');
  });

  it('proxies external URLs through Next.js image optimization', () => {
    const url = 'https://example.com/image.png';
    const result = getProxyUrl(url);
    expect(result).toBe(`/_next/image?url=${encodeURIComponent(url)}&w=1200&q=80`);
  });

  it('encodes special characters in URLs', () => {
    const url = 'https://example.com/image with spaces.png';
    const result = getProxyUrl(url);
    expect(result).toContain(encodeURIComponent(url));
    expect(result.startsWith('/_next/image?url=')).toBe(true);
  });

  it('proxies URLs with query parameters', () => {
    const url = 'https://example.com/image.png?token=abc&size=large';
    const result = getProxyUrl(url);
    expect(result).toBe(`/_next/image?url=${encodeURIComponent(url)}&w=1200&q=80`);
  });

  it('always uses width 1200 and quality 80', () => {
    const result = getProxyUrl('https://example.com/img.jpg');
    expect(result).toContain('w=1200');
    expect(result).toContain('q=80');
  });
});
