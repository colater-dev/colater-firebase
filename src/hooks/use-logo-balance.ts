import { useState, useEffect, useCallback } from 'react';
import {
    analyzeLogoWordmarkBalance,
    balanceToDisplaySettings,
    type LogoAnalysisResult,
    type WordmarkAnalysisResult,
    type BalanceResult,
} from '@/lib/logo-analysis';

interface LogoBalanceCache {
    logoAnalysis: LogoAnalysisResult;
    wordmarkAnalysis: WordmarkAnalysisResult;
    balance: BalanceResult;
    displaySettings: {
        verticalLogoTextBalance: number;
        horizontalLogoTextGap: number;
        verticalLogoTextGap: number;
    };
    timestamp: number;
}

// In-memory cache (could be moved to localStorage for persistence)
const balanceCache = new Map<string, LogoBalanceCache>();

// Cache expiry: 1 hour
const CACHE_EXPIRY_MS = 60 * 60 * 1000;

export interface UseLogoBalanceOptions {
    enabled?: boolean;           // Default: true
    baseSize?: number;          // Default: 100
    skipCache?: boolean;        // Default: false
}

export interface UseLogoBalanceResult {
    isAnalyzing: boolean;
    error: Error | null;
    logoAnalysis: LogoAnalysisResult | null;
    wordmarkAnalysis: WordmarkAnalysisResult | null;
    balance: BalanceResult | null;
    displaySettings: {
        verticalLogoTextBalance: number;
        horizontalLogoTextGap: number;
        verticalLogoTextGap: number;
    } | null;
    reanalyze: () => Promise<void>;
}

/**
 * Hook to automatically analyze and calculate optimal logo-wordmark balance
 *
 * @param logoUrl - URL of the logo image
 * @param brandName - Brand name text (wordmark)
 * @param font - Font family name for the wordmark
 * @param options - Optional configuration
 *
 * @example
 * const { balance, displaySettings, isAnalyzing } = useLogoBalance(
 *   logo.logoUrl,
 *   brand.latestName,
 *   brand.font || 'Inter'
 * );
 *
 * if (!isAnalyzing && displaySettings) {
 *   // Use displaySettings.verticalLogoTextBalance
 * }
 */
export function useLogoBalance(
    logoUrl: string | undefined,
    brandName: string | undefined,
    font: string | undefined,
    options: UseLogoBalanceOptions = {}
): UseLogoBalanceResult {
    const {
        enabled = true,
        baseSize = 100,
        skipCache = false,
    } = options;

    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [result, setResult] = useState<LogoBalanceCache | null>(null);

    const performAnalysis = useCallback(async () => {
        if (!logoUrl || !brandName || !font || !enabled) {
            return;
        }

        // Generate cache key
        const cacheKey = `${logoUrl}:${brandName}:${font}:${baseSize}`;

        // Check cache first
        if (!skipCache) {
            const cached = balanceCache.get(cacheKey);
            if (cached && Date.now() - cached.timestamp < CACHE_EXPIRY_MS) {
                setResult(cached);
                return;
            }
        }

        setIsAnalyzing(true);
        setError(null);

        try {
            const analysis = await analyzeLogoWordmarkBalance(
                logoUrl,
                brandName,
                font,
                baseSize
            );

            const displaySettings = balanceToDisplaySettings(analysis.balance);

            const cacheEntry: LogoBalanceCache = {
                ...analysis,
                displaySettings,
                timestamp: Date.now(),
            };

            // Store in cache
            balanceCache.set(cacheKey, cacheEntry);

            setResult(cacheEntry);
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Failed to analyze logo balance');
            setError(error);
            console.error('Logo balance analysis error:', error);
        } finally {
            setIsAnalyzing(false);
        }
    }, [logoUrl, brandName, font, baseSize, enabled, skipCache]);

    // Run analysis when inputs change
    useEffect(() => {
        performAnalysis();
    }, [performAnalysis]);

    return {
        isAnalyzing,
        error,
        logoAnalysis: result?.logoAnalysis || null,
        wordmarkAnalysis: result?.wordmarkAnalysis || null,
        balance: result?.balance || null,
        displaySettings: result?.displaySettings || null,
        reanalyze: async () => {
            // Force reanalysis bypassing cache
            const cacheKey = `${logoUrl}:${brandName}:${font}:${baseSize}`;
            balanceCache.delete(cacheKey);
            await performAnalysis();
        },
    };
}

/**
 * Preload and cache logo balance for multiple logos
 * Useful for preloading balance data for all logos in a brand
 */
export async function preloadLogoBalances(
    logos: Array<{ logoUrl: string }>,
    brandName: string,
    font: string,
    baseSize: number = 100
): Promise<void> {
    const promises = logos.map(logo =>
        analyzeLogoWordmarkBalance(logo.logoUrl, brandName, font, baseSize)
            .then(analysis => {
                const cacheKey = `${logo.logoUrl}:${brandName}:${font}:${baseSize}`;
                const displaySettings = balanceToDisplaySettings(analysis.balance);

                balanceCache.set(cacheKey, {
                    ...analysis,
                    displaySettings,
                    timestamp: Date.now(),
                });
            })
            .catch(err => {
                console.error(`Failed to preload balance for ${logo.logoUrl}:`, err);
            })
    );

    await Promise.all(promises);
}

/**
 * Clear the entire balance cache
 */
export function clearBalanceCache(): void {
    balanceCache.clear();
}

/**
 * Get cache statistics
 */
export function getBalanceCacheStats(): {
    size: number;
    entries: Array<{ key: string; age: number }>;
} {
    const entries = Array.from(balanceCache.entries()).map(([key, value]) => ({
        key,
        age: Date.now() - value.timestamp,
    }));

    return {
        size: balanceCache.size,
        entries,
    };
}
