
export interface Brand {
    id: string;
    userId: string;
    createdAt: any; // Firestore Timestamp
    latestName: string;
    latestElevatorPitch: string;
    latestAudience: string;
    latestDesirableCues: string;
    latestUndesirableCues: string;
    latestConcept?: string;
    logoUrl?: string;
    primaryTagline?: string;
    font?: string;
}

export interface Tagline {
    id: string;
    brandId: string;
    userId: string;
    tagline: string;
    createdAt: any; // Firestore Timestamp
    status?: 'generated' | 'liked' | 'disliked';
}

export interface Logo {
    id: string;
    brandId: string;
    userId: string;
    logoUrl: string;
    createdAt: any; // Firestore Timestamp
    isPublic?: boolean; // Whether the logo can be publicly shared
    displaySettings?: {
        layout: 'horizontal' | 'vertical';
        textTransform: 'none' | 'lowercase' | 'capitalize' | 'uppercase';
        showBrandName: boolean;
        invertLogo: boolean;
        logoTextGap: number;
        logoTextBalance: number;
        logoBrightness: number;
        logoContrast: number;
    };
    colorLogoUrl?: string; // Deprecated: kept for backward compatibility
    palette?: string[]; // Deprecated: kept for backward compatibility
    colorVersions?: Array<{ colorLogoUrl: string; palette: string[] }>; // Array of color versions with their palettes
    colorLogoUrls?: string[]; // Deprecated: caused nested arrays issue
    palettes?: string[][]; // Deprecated: caused nested arrays issue
    critique?: Critique;
    critiqueFeedback?: Record<string, 'agree' | 'disagree'>;
    externalMediaUrl?: string;
}

export interface CritiquePoint {
    id: string;
    x: number;
    y: number;
    comment: string;
    sentiment: 'positive' | 'negative';
}

export interface Critique {
    overallSummary: string;
    points: CritiquePoint[];
}

export interface LogoFeedback {
    id: string;
    logoId: string;
    brandId: string;
    rating: number; // 1-5 stars
    comment: string;
    authorName?: string; // Present if user was logged in
    authorId?: string; // Present if user was logged in
    isAnonymous: boolean;
    createdAt: any; // Firestore Timestamp
}
