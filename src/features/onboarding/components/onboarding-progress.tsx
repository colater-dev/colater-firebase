'use client';

import { Progress } from "@/components/ui/progress";

interface OnboardingProgressProps {
    current: number;
    total: number;
}

export function OnboardingProgress({ current, total }: OnboardingProgressProps) {
    const percentage = (current / total) * 100;

    return (
        <div className="w-full fixed top-0 left-0 z-50">
            <Progress value={percentage} className="h-1.5 rounded-none bg-primary/20" />
        </div>
    );
}
