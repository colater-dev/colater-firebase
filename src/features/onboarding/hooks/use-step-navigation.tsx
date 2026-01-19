'use client';

import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

const ONBOARDING_ROUTES = {
    welcome: '/onboarding',
    name: '/onboarding/steps/name',
    pitch: '/onboarding/steps/pitch',
    audience: '/onboarding/steps/audience',
    style: '/onboarding/steps/style',
    review: '/onboarding/steps/review',
    generating: '/onboarding/generating',
} as const;

type StepKey = keyof typeof ONBOARDING_ROUTES;

const STEP_ORDER: StepKey[] = [
    'welcome',
    'name',
    'pitch',
    'audience',
    'style',
    'review',
    'generating',
];

export function useStepNavigation(currentStepKey: StepKey) {
    const router = useRouter();

    const next = useCallback(() => {
        const currentIndex = STEP_ORDER.indexOf(currentStepKey);
        const nextKey = STEP_ORDER[currentIndex + 1];
        if (nextKey) {
            router.push(ONBOARDING_ROUTES[nextKey]);
        }
    }, [currentStepKey, router]);

    const back = useCallback(() => {
        const currentIndex = STEP_ORDER.indexOf(currentStepKey);
        const prevKey = STEP_ORDER[currentIndex - 1];
        if (prevKey) {
            router.push(ONBOARDING_ROUTES[prevKey]);
        }
    }, [currentStepKey, router]);

    const goTo = useCallback((key: StepKey) => {
        router.push(ONBOARDING_ROUTES[key]);
    }, [router]);

    return {
        next,
        back,
        goTo,
        totalSteps: STEP_ORDER.length - 2, // Excluding welcome and generating
        currentStepNumber: STEP_ORDER.indexOf(currentStepKey), // 1-indexed if counting from name
    };
}
