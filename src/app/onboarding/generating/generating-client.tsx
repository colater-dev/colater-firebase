'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { GeneratingAnimation } from '@/features/onboarding/components';
import { useEffect, useState } from 'react';
import { useOnboardingState } from '@/features/onboarding/hooks/use-onboarding-state';

export default function GeneratingClient() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const brandId = searchParams.get('brandId');
    const { clearState } = useOnboardingState();
    const [isComplete, setIsComplete] = useState(false);

    useEffect(() => {
        if (isComplete && brandId) {
            // Clear onboarding state before redirecting
            clearState();
            router.push(`/brands/${brandId}?new=true`);
        }
    }, [isComplete, brandId, clearState, router]);

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-4 min-h-screen bg-background">
            <GeneratingAnimation onComplete={() => setIsComplete(true)} />
        </div>
    );
}
