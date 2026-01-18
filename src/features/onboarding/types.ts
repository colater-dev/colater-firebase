// src/features/onboarding/types.ts

export interface OnboardingState {
    // Step data
    brandName: string;
    elevatorPitch: string;
    targetAudience: string;
    desirableStyles: string[];
    undesirableStyles: string[];

    // Metadata
    currentStep: number;
    completedSteps: number[];
    startedAt: string; // ISO string
    lastUpdatedAt: string; // ISO string

    // Flags
    usedAiHelper: Record<string, boolean>;
    skippedFields: string[];
}

export interface StyleOption {
    id: string;
    label: string;
    category: 'desirable' | 'undesirable';
    description: string;
    exampleImages?: string[]; // Preview logos
}

export interface OnboardingStep {
    step: number;
    title: string;
    description?: string;
    route: string;
    isComplete: boolean;
    isAccessible: boolean;
}
