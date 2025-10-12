export interface Brand {
    id: string;
    userId: string;
    createdAt: any; // Firestore Timestamp
    latestName: string;
    latestElevatorPitch: string;
    latestAudience: string;
}

export interface Tagline {
    id: string;
    brandId: string;
    userId: string;
    tagline: string;
    createdAt: any; // Firestore Timestamp
}
