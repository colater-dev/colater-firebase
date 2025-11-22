
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
    colorLogoUrl?: string; // Deprecated: kept for backward compatibility
    palette?: string[]; // Deprecated: kept for backward compatibility
    colorVersions?: Array<{ colorLogoUrl: string; palette: string[] }>; // Array of color versions with their palettes
    colorLogoUrls?: string[]; // Deprecated: caused nested arrays issue
    palettes?: string[][]; // Deprecated: caused nested arrays issue
    critique?: Critique;
    critiqueFeedback?: Record<string, 'agree' | 'disagree'>;
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
