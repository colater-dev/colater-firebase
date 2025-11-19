/**
 * Google Fonts configuration for brand name display
 * Each font includes multiple weights for variety
 */

export const BRAND_FONTS = [
    {
        name: 'Inter',
        weights: [400, 500, 600, 700, 800],
        variable: '--font-inter',
    },
    {
        name: 'Poppins',
        weights: [400, 500, 600, 700, 800],
        variable: '--font-poppins',
    },
    {
        name: 'Montserrat',
        weights: [400, 500, 600, 700, 800],
        variable: '--font-montserrat',
    },
    {
        name: 'Roboto',
        weights: [400, 500, 700, 900],
        variable: '--font-roboto',
    },
    {
        name: 'Open Sans',
        weights: [400, 600, 700, 800],
        variable: '--font-open-sans',
    },
    {
        name: 'Lato',
        weights: [400, 700, 900],
        variable: '--font-lato',
    },
    {
        name: 'Raleway',
        weights: [400, 500, 600, 700, 800],
        variable: '--font-raleway',
    },
    {
        name: 'Playfair Display',
        weights: [400, 500, 600, 700, 800, 900],
        variable: '--font-playfair',
    },
    {
        name: 'Merriweather',
        weights: [400, 700, 900],
        variable: '--font-merriweather',
    },
    {
        name: 'Nunito',
        weights: [400, 600, 700, 800, 900],
        variable: '--font-nunito',
    },
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
    const fontParams = BRAND_FONTS.map(font => {
        const weightsStr = font.weights.join(';');
        const fontName = font.name.replace(/ /g, '+');
        return `family=${fontName}:wght@${weightsStr}`;
    }).join('&');

    return `https://fonts.googleapis.com/css2?${fontParams}&display=swap`;
}
