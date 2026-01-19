'use client';

import { useOnboardingState } from '@/features/onboarding/hooks/use-onboarding-state';
import { useStepNavigation } from '@/features/onboarding/hooks/use-step-navigation';
import { OnboardingStepWrapper } from '@/features/onboarding/components';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { audienceStepSchema } from '@/features/onboarding/utils/validation-schemas';
import { trackOnboardingEvent } from '@/features/onboarding/utils/onboarding-analytics';
import { useState } from 'react';

export default function AudienceStepClient() {
    const { state, updateField } = useOnboardingState();
    const { next, back } = useStepNavigation('audience');
    const [error, setError] = useState<string | null>(null);

    const handleNext = async () => {
        const result = audienceStepSchema.safeParse({ targetAudience: state.targetAudience });
        if (!result.success) {
            setError(result.error.errors[0].message);
            return false;
        }

        setError(null);
        trackOnboardingEvent('onboarding_step_completed', { step: 3, field: 'targetAudience' });
        next();
        return true;
    };

    return (
        <OnboardingStepWrapper
            currentStep={3}
            totalSteps={5}
            title="Who are we building this for?"
            description="Describe your ideal customer or target audience."
            onNext={handleNext}
            onBack={back}
        >
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="targetAudience" className="text-base font-semibold">
                        Target Audience
                    </Label>
                    <Textarea
                        id="targetAudience"
                        placeholder="e.g., Remote workers, digital nomads, and freelancers aged 25-40 who value high-quality coffee and a focused environment."
                        value={state.targetAudience}
                        onChange={(e) => {
                            updateField('targetAudience', e.target.value);
                            if (error) setError(null);
                        }}
                        className="min-h-[120px] text-lg rounded-xl border-2 focus-visible:ring-primary shadow-sm resize-none"
                        autoFocus
                    />
                    <div className="flex justify-between items-center">
                        {error ? (
                            <p className="text-sm font-medium text-destructive animate-in fade-in slide-in-from-top-1">
                                {error}
                            </p>
                        ) : (
                            <div />
                        )}
                        <p className="text-xs text-muted-foreground">
                            {state.targetAudience.length} / 200 characters
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                    {['Tech Professionals', 'Young Parents', 'Fitness Enthusiasts', 'Eco-conscious Foodies'].map((example) => (
                        <button
                            key={example}
                            type="button"
                            onClick={() => updateField('targetAudience', example)}
                            className="text-left p-3 text-sm rounded-xl border border-dashed border-muted-foreground/30 hover:border-primary/50 hover:bg-primary/5 transition-colors"
                        >
                            {example}
                        </button>
                    ))}
                </div>
            </div>
        </OnboardingStepWrapper>
    );
}
