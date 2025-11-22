/**
 * Google Fonts configuration for brand name display
 * Each font includes multiple weights for variety
 * Sorted alphabetically for easy reference
 * Size multipliers help visually balance fonts to take up similar space
 */

export const BRAND_FONTS = [
    {
        name: 'Aboreto',
        weights: [400],
        variable: '--font-aboreto',
        sizeMultiplier: 0.95, // Slightly condensed
    },
    {
        name: 'Archivo',
        weights: [400, 500, 600, 700, 800, 900],
        variable: '--font-archivo',
        sizeMultiplier: 1.0, // Well-balanced
    },
    {
        name: 'BioRhyme Expanded',
        weights: [400, 700, 800],
        variable: '--font-biorhyme-expanded',
        sizeMultiplier: 0.85, // Very wide, needs reduction
    },
    {
        name: 'Cabin',
        weights: [400, 500, 600, 700],
        variable: '--font-cabin',
        sizeMultiplier: 1.0, // Well-balanced
    },
    {
        name: 'Caprasimo',
        weights: [400],
        variable: '--font-caparasimo',
        sizeMultiplier: 0.9, // Bold and wide
    },
    {
        name: 'Commissioner',
        weights: [400, 500, 600, 700, 800, 900],
        variable: '--font-commissioner',
        sizeMultiplier: 1.0, // Well-balanced
    },
    {
        name: 'Corben',
        weights: [400, 700],
        variable: '--font-corben',
        sizeMultiplier: 0.8, // Slightly bold
    },
    {
        name: 'Faculty Glyphic',
        weights: [400],
        variable: '--font-faculty-glyphic',
        sizeMultiplier: 0.9, // Narrow, needs increase
    },
    {
        name: 'Fraunces',
        weights: [400, 500, 600, 700, 800, 900],
        variable: '--font-fraunces',
        sizeMultiplier: 0.95, // Slightly wide
    },
    {
        name: 'Freeman',
        weights: [400],
        variable: '--font-freeman',
        sizeMultiplier: 0.9, // Bold and chunky
    },
    {
        name: 'Gabarito',
        weights: [400, 500, 600, 700, 800, 900],
        variable: '--font-gabarito',
        sizeMultiplier: 1.0, // Well-balanced
    },
    {
        name: 'Genos',
        weights: [400, 500, 600, 700, 800, 900],
        variable: '--font-genos',
        sizeMultiplier: 1.15, // Very narrow/condensed
    },
    {
        name: 'Instrument Sans',
        weights: [400, 500, 600, 700],
        variable: '--font-instrument-sans',
        sizeMultiplier: 1.0, // Well-balanced
    },
    {
        name: 'Instrument Serif',
        weights: [400],
        variable: '--font-instrument-serif',
        sizeMultiplier: 1.0, // Well-balanced
    },
    {
        name: 'Jomhuria',
        weights: [400],
        variable: '--font-jomhuria',
        sizeMultiplier: 1.5, // Very tall and decorative
    },
    {
        name: 'Jost',
        weights: [400, 500, 600, 700, 800, 900],
        variable: '--font-jost',
        sizeMultiplier: 1.0, // Well-balanced
    },
    {
        name: 'Lexend',
        weights: [400, 500, 600, 700, 800, 900],
        variable: '--font-lexend',
        sizeMultiplier: 1.0, // Well-balanced
    },
    {
        name: 'M PLUS Rounded 1c',
        weights: [400, 500, 700, 800, 900],
        variable: '--font-m-plus-rounded-1c',
        sizeMultiplier: 1.05, // Slightly narrow
    },
    {
        name: 'Michroma',
        weights: [400],
        variable: '--font-michroma',
        sizeMultiplier: 1.1, // Narrow and geometric
    },
    {
        name: 'Nixie One',
        weights: [400],
        variable: '--font-nixie-one',
        sizeMultiplier: 1.0, // Well-balanced
    },
    {
        name: 'Rowdies',
        weights: [300, 400, 700],
        variable: '--font-rowdies',
        sizeMultiplier: 0.9, // Bold and playful
    },
    {
        name: 'Saira',
        weights: [400, 500, 600, 700, 800, 900],
        variable: '--font-saira',
        sizeMultiplier: 1.05, // Slightly condensed
    },
    {
        name: 'Tektur',
        weights: [400, 500, 600, 700, 800, 900],
        variable: '--font-tektur',
        sizeMultiplier: 1.0, // Well-balanced
    },
    {
        name: 'Tilt Warp',
        weights: [400],
        variable: '--font-tilt-warp',
        sizeMultiplier: 0.95, // Slightly wide
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
        .map(font => {
            const weightsStr = font.weights.join(';');
            const fontName = font.name.replace(/ /g, '+');
            return `family=${fontName}:wght@${weightsStr}`;
        }).join('&');

    return `https://fonts.googleapis.com/css2?${fontParams}&display=swap`;
}
