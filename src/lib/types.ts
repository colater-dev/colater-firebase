
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
    colorLogoUrl?: string; // Deprecated: kept for backward compatibility
    palette?: string[]; // Deprecated: kept for backward compatibility
    colorLogoUrls?: string[]; // Array of color logo URLs
    palettes?: string[][]; // Array of palettes, each palette is an array of hex colors
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
