/**
 * Type definitions for Colater API
 */

/**
 * Brand context response
 */
export interface BrandContextResponse {
  brand: {
    id: string;
    name: string;
    tagline: string;
    elevatorPitch: string;
    targetAudience: string;
    createdAt: string;
    lastUpdated: string;
  };
  identity: {
    positioning: {
      challenge: string;
      solution: string;
      keyAttributes: string[];
    };
  };
  voice: {
    tone: string[];
    preferWords: string[];
    avoidWords: string[];
    examples: {
      formal: string;
      casual: string;
    };
  };
  visual: {
    logos: {
      primary: string;
      icon: string;
      wordmark: string;
      variations: Array<{
        id: string;
        url: string;
        type: 'color' | 'bw' | 'inverted';
      }>;
    };
    colors: {
      palette: Array<{
        hex: string;
        name: string;
        usage: string;
      }>;
      philosophy: string;
    };
    typography: {
      primary: {
        name: string;
        weights: number[];
        usage: string;
      };
      pairings: string[];
    };
  };
}

/**
 * Voice validation response
 */
export interface VoiceValidationResponse {
  score: number;
  onBrand: boolean;
  analysis: {
    toneMatch: number;
    vocabularyMatch: number;
    structureMatch: number;
  };
  issues: Array<{
    type: 'avoid_word' | 'off_tone' | 'jargon' | 'complexity';
    text: string;
    reason: string;
    suggestion: string;
    severity: 'low' | 'medium' | 'high';
  }>;
  rewrite?: string;
  highlights: {
    good: string[];
    bad: string[];
  };
}

/**
 * Content generation response
 */
export interface ContentGenerationResponse {
  content: string;
  metadata: {
    wordCount: number;
    characterCount: number;
    readingLevel: string;
    toneUsed: string;
  };
  brandVoiceScore: number;
  variations?: string[];
}

/**
 * Brand assets response
 */
export interface BrandAssetsResponse {
  logos?: {
    primary: {
      url: string;
      svg?: string;
      dataUri?: string;
      dimensions: { width: number; height: number };
    };
    variations: Array<{
      id: string;
      type: 'color' | 'bw' | 'inverted';
      url: string;
    }>;
  };
  colors?: {
    hex?: string[];
    rgb?: Array<{ r: number; g: number; b: number }>;
    tailwind?: Record<string, string>;
    css?: string;
    figma?: Record<string, any>;
    usage: Array<{
      color: string;
      name: string;
      usage: string;
    }>;
  };
  fonts?: {
    primary: {
      name: string;
      weights: number[];
      googleFontsUrl?: string;
      cssImport?: string;
    };
    fallbacks: string[];
  };
}

/**
 * List brands response
 */
export interface ListBrandsResponse {
  brands: Array<{
    id: string;
    name: string;
    tagline: string;
    thumbnailUrl: string;
    createdAt: string;
    lastUpdated: string;
    stats: {
      logoCount: number;
      taglineCount: number;
      hasGuidelines: boolean;
    };
  }>;
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}
