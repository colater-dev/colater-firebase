/**
 * Google Fonts configuration for brand name display
 * Each font includes multiple weights for variety
 */

import { Variable } from "lucide-react";

export const BRAND_FONTS = [
    {
        name: 'Momo Trust',
        weights: [400],
        variable: '--font-momo-trust',
    },
    {
        name: 'Boldonse',
        weights: [400],
        variable: '--font-boldonse',
    },
    {
        name: 'Gabarito',
        weights: [400, 500, 600, 700, 800, 900],
        variable: '--font-gabarito',
    },
    {
        name: 'Corben',
        weights: [400, 700],
        variable: '--font-corben',
    },
    {
        name: 'Tilt Warp',
        weights: [400],
        variable: '--font-tilt-warp',
    },
    {
        name: 'Aboreto',
        weights: [400],
        variable: '--font-aboreto',
    },
    {
        name: 'Caparasimo',
        weights: [400],
        variable: '--font-caparasimo',
    },
    {
        name: 'Jomhuria',
        weights: [400],
        variable: '--font-jomhuria',
    },
    {
        name: 'Freeman',
        weights: [400],
        variable: '--font-freeman',
    },
    {
        name: 'Nixie One',
        weights: [400],
        variable: '--font-nixie-one',
    },
    {
        name: 'Tektur',
        weights: [400, 500, 600, 700, 800, 900],
        variable: '--font-tektur',
    },
    {
        name: 'Faculty Glyphic',
        weights: [400],
        variable: '--font-faculty-glyphic',
    },
    {
        name: 'BioRhyme Expanded',
        weights: [400, 700, 800],
        variable: '--font-biorhyme-expanded',
    },
    {
        name: 'Rowdies',
        weights: [300, 400, 700],
        variable: '--font-rowdies',
    },
    {
        name: 'Instrument Serif',
        weights: [400],
        variable: '--font-instrument-serif',
    },
    {
        name: 'Instrument Sans',
        weights: [400, 500, 600, 700],
        variable: '--font-instrument-sans',
    },
    {
        name: 'TASA Orbiter',
        weights: [400, 500, 600, 700, 800, 900],
        variable: '--font-tasa-orbiter',
    },
    {
        name: 'Fraunces',
        weights: [400, 500, 600, 700, 800, 900],
        variable: '--font-fraunces',
    },
    {
        name: 'Commissioner',
        weights: [400, 500, 600, 700, 800, 900],
        variable: '--font-commissioner',
    }
] as const;

export type BrandFont = typeof BRAND_FONTS[number];

/**
 * Get a consistent random font and weight for a brand based on its ID
 * Uses the brand ID as a seed to ensure the same brand always gets the same font
 */
export function getBrandFontStyle(brandId: string): {
    fontFamily: string;
    fontWeight: number;
} {
    // Simple hash function to convert brand ID to a number
    const hash = brandId.split('').reduce((acc, char) => {
        return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);

    // Use hash to select font and weight
    const fontIndex = Math.abs(hash) % BRAND_FONTS.length;
    const font = BRAND_FONTS[fontIndex];

    const weightIndex = Math.abs(hash >> 8) % font.weights.length;
    const weight = font.weights[weightIndex];

    return {
        fontFamily: `var(${font.variable}), ${font.name}, sans-serif`,
        fontWeight: weight,
    };
}

/**
 * Generate Google Fonts URL for all configured fonts
 */
export function getGoogleFontsUrl(): string {
    const fontParams = BRAND_FONTS
        .filter(font => font.name !== 'Momo Trust' && font.name !== 'Boldonse') // Filter out custom fonts
        .map(font => {
            const weightsStr = font.weights.join(';');
            const fontName = font.name.replace(/ /g, '+');
            return `family=${fontName}:wght@${weightsStr}`;
        }).join('&');

    return `https://fonts.googleapis.com/css2?${fontParams}&display=swap`;
}
