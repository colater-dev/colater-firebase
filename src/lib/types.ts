
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
    displaySettings?: Logo['displaySettings'];
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
    prompt?: string;
    concept?: string;
    createdAt: any; // Firestore Timestamp
    isPublic?: boolean; // Whether the logo can be publicly shared
    displaySettings?: {
        layout?: 'horizontal' | 'vertical'; // Deprecated
        textTransform: 'none' | 'lowercase' | 'capitalize' | 'uppercase';
        showBrandName: boolean;
        invertLogo: boolean;
        logoTextGap?: number; // Deprecated
        logoTextBalance?: number; // Deprecated
        logoContrast: number;

        horizontalLogoTextGap?: number;
        horizontalLogoTextBalance?: number;
        verticalLogoTextGap?: number;
        verticalLogoTextBalance?: number;
    };
    colorLogoUrl?: string; // Deprecated: kept for backward compatibility
    palette?: string[]; // Deprecated: kept for backward compatibility
    colorNames?: string[]; // Deprecated: kept for backward compatibility
    colorVersions?: Array<{ colorLogoUrl: string; palette: string[]; colorNames?: string[] }>; // Array of color versions with their palettes
    critique?: Critique;
    critiqueFeedback?: Record<string, 'agree' | 'disagree'>;
    externalMediaUrl?: string;
    vectorLogoUrl?: string;
    isDeleted?: boolean;
    cropDetails?: { x: number; y: number; width: number; height: number };
    font?: string;
    rating?: number; // 1-5 stars ranking
    feedback?: string; // qualitative feedback for prompt improvement
    presentationData?: any;
    justification?: any;
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

export interface Presentation {
    id: string;
    brandId: string;
    userId: string;
    createdAt: any;
    lastEdited: any;
    version: number;
    slides: PresentationSlide[];
    title?: string;
    clientName?: string;
    isPublic: boolean;
    shareToken?: string;
    sharePassword?: string;
    expiresAt?: any;
    viewCount: number;
    lastViewed?: any;
}

export interface PresentationSlide {
    slideId: string;
    order: number;
    isVisible: boolean;
    content: Record<string, any>;
}
