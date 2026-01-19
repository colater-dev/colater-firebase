'use client';

import { useOnboardingState } from '@/features/onboarding/hooks/use-onboarding-state';
import { useStepNavigation } from '@/features/onboarding/hooks/use-step-navigation';
import { OnboardingStepWrapper, StylePillSelector } from '@/features/onboarding/components';
import { DESIRABLE_STYLES, UNDESIRABLE_STYLES } from '@/lib/onboarding-constants';
import { styleStepSchema } from '@/features/onboarding/utils/validation-schemas';
import { trackOnboardingEvent } from '@/features/onboarding/utils/onboarding-analytics';
import { useState } from 'react';
import { Separator } from '@/components/ui/separator';

export default function StyleStepClient() {
    const { state, updateFields } = useOnboardingState();
    const { next, back } = useStepNavigation('style');
    const [error, setError] = useState<string | null>(null);

    const handleNext = async () => {
        const result = styleStepSchema.safeParse({
            desirableStyles: state.desirableStyles,
            undesirableStyles: state.undesirableStyles,
        });

        if (!result.success) {
            setError(result.error.errors[0].message);
            return false;
        }

        setError(null);
        trackOnboardingEvent('onboarding_step_completed', {
            step: 4,
            desirableCount: state.desirableStyles.length,
            undesirableCount: state.undesirableStyles.length
        });
        next();
        return true;
    };

    return (
        <OnboardingStepWrapper
            currentStep={4}
            totalSteps={5}
            title="Define your visual style"
            description="Help our AI understand the mood you want to evoke."
            onNext={handleNext}
            onBack={back}
        >
            <div className="space-y-8">
                <div className="space-y-4">
                    <div className="flex justify-between items-end">
                        <h3 className="text-lg font-bold">Desirable Styles</h3>
                        <span className="text-xs text-muted-foreground font-medium">Select up to 5</span>
                    </div>
                    <StylePillSelector
                        options={DESIRABLE_STYLES}
                        selected={state.desirableStyles}
                        onChange={(selected) => updateFields({ desirableStyles: selected })}
                        maxSelection={5}
                    />
                </div>

                <Separator className="bg-primary/10" />

                <div className="space-y-4">
                    <div className="flex justify-between items-end">
                        <h3 className="text-lg font-bold text-destructive/80">Styles to Avoid</h3>
                        <span className="text-xs text-muted-foreground font-medium">Optional</span>
                    </div>
                    <StylePillSelector
                        options={UNDESIRABLE_STYLES}
                        selected={state.undesirableStyles}
                        onChange={(selected) => updateFields({ undesirableStyles: selected })}
                        maxSelection={3}
                        variant="destructive"
                    />
                </div>

                {error && (
                    <p className="text-sm font-medium text-destructive animate-in fade-in slide-in-from-top-1 text-center">
                        {error}
                    </p>
                )}
            </div>
        </OnboardingStepWrapper>
    );
}
