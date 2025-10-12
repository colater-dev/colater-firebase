
export interface Brand {
    id: string;
    userId: string;
    createdAt: any; // Firestore Timestamp
    latestName: string;
    latestElevatorPitch: string;
    latestAudience: string;
    latestDesirableCues: string;
    latestUndesirableCues: string;
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
    colorLogoUrl?: string;
    palette?: string[];
}
