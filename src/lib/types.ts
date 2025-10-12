export interface Brand {
    id: string;
    userId: string;
    createdAt: any; // Firestore Timestamp
    latestName: string;
    latestElevatorPitch: string;
    latestAudience: string;
    logoUrl?: string;
}

export interface Tagline {
    id: string;
    brandId: string;
    userId: string;
    tagline: string;
    createdAt: any; // Firestore Timestamp
}

export interface Logo {
    id: string;
    brandId: string;
    userId: string;
    logoUrl: string;
    createdAt: any; // Firestore Timestamp
}
