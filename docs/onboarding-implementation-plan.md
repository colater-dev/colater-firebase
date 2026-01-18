# Onboarding Flow - Implementation Plan

**Epic**: First-Time User Experience Redesign
**Priority**: P1 - High Priority
**Estimated Effort**: 5-7 days (40-56 hours)
**Target Ship Date**: [2 weeks from start]

## Overview

Implement a guided onboarding experience that takes new users from landing page to their first generated brand in under 5 minutes, with contextual guidance and progressive feature discovery.

## Success Criteria

### Functional Requirements
- ✅ New multi-step onboarding flow replaces current single-page form
- ✅ Users can navigate forward/backward through steps
- ✅ Progress persists in localStorage (survive page refresh)
- ✅ All form validation works with helpful error messages
- ✅ Loading state shows progress during AI generation
- ✅ Success state celebrates completion with tutorial modal
- ✅ Analytics events fire at each step

### Technical Requirements
- ✅ TypeScript strict mode (no `any` types)
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Accessible (keyboard navigation, screen readers)
- ✅ Server/client component separation
- ✅ Form validation with Zod schemas
- ✅ Smooth animations with Framer Motion

### Performance Requirements
- ✅ Each step loads < 500ms
- ✅ Animations run at 60fps
- ✅ Bundle size increase < 50kb

## Architecture

### File Structure

```
src/
├── app/
│   └── onboarding/
│       ├── layout.tsx                    # Onboarding layout (no header/sidebar)
│       ├── page.tsx                      # Welcome/landing page (server)
│       ├── welcome-client.tsx            # Welcome page client component
│       ├── steps/
│       │   ├── name/
│       │   │   ├── page.tsx             # Step 1: Brand name (server)
│       │   │   └── name-step-client.tsx # Step 1 client component
│       │   ├── pitch/
│       │   │   ├── page.tsx             # Step 2: Elevator pitch (server)
│       │   │   └── pitch-step-client.tsx
│       │   ├── audience/
│       │   │   ├── page.tsx             # Step 3: Target audience (server)
│       │   │   └── audience-step-client.tsx
│       │   ├── style/
│       │   │   ├── page.tsx             # Step 4: Visual style (server)
│       │   │   └── style-step-client.tsx
│       │   └── review/
│       │       ├── page.tsx             # Step 5: Review & generate (server)
│       │       └── review-step-client.tsx
│       └── generating/
│           ├── page.tsx                  # Loading state (server)
│           └── generating-client.tsx     # Animated loading component
│
├── features/
│   └── onboarding/
│       ├── components/
│       │   ├── onboarding-progress.tsx   # Progress bar component
│       │   ├── onboarding-step-wrapper.tsx # Common step wrapper
│       │   ├── style-pill-selector.tsx   # Visual style pill picker
│       │   ├── ai-helper-button.tsx      # AI completion helper
│       │   ├── example-dropdown.tsx      # Example suggestions
│       │   ├── tutorial-modal.tsx        # Post-generation tutorial
│       │   ├── generating-animation.tsx  # Loading animation
│       │   └── index.ts
│       ├── hooks/
│       │   ├── use-onboarding-state.tsx  # localStorage persistence
│       │   ├── use-step-navigation.tsx   # Navigation helpers
│       │   └── index.ts
│       ├── utils/
│       │   ├── onboarding-analytics.ts   # Analytics tracking
│       │   └── validation-schemas.ts     # Zod schemas for each step
│       └── types.ts                      # TypeScript types
│
└── lib/
    └── onboarding-constants.ts          # Style options, examples, copy

```

### Data Models

```typescript
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
  startedAt: Date;
  lastUpdatedAt: Date;

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
  route: string;
  isComplete: boolean;
  isAccessible: boolean;
}
```

### Routes & Navigation

```typescript
// Route structure
const ONBOARDING_ROUTES = {
  welcome: '/onboarding',
  name: '/onboarding/steps/name',
  pitch: '/onboarding/steps/pitch',
  audience: '/onboarding/steps/audience',
  style: '/onboarding/steps/style',
  review: '/onboarding/steps/review',
  generating: '/onboarding/generating',
  complete: '/brands/[brandId]', // Redirect to brand page
} as const;

// Navigation flow
1. /onboarding (welcome)
2. /onboarding/steps/name
3. /onboarding/steps/pitch
4. /onboarding/steps/audience
5. /onboarding/steps/style
6. /onboarding/steps/review
7. /onboarding/generating
8. /brands/[newBrandId] (with tutorial modal)
```

## Implementation Tasks

### Phase 1: Foundation (Days 1-2)

**Task 1.1: Create Base Layout & Routing**
- Create `/app/onboarding/layout.tsx` with minimal layout (no header/sidebar)
- Set up route structure for all steps
- Create placeholder pages for each step
- Test navigation flow

**Acceptance Criteria**:
- Can navigate between all routes
- Layout hides main app header/sidebar
- Back button in browser works correctly

**Files**:
- `src/app/onboarding/layout.tsx`
- `src/app/onboarding/page.tsx`
- `src/app/onboarding/steps/*/page.tsx`

---

**Task 1.2: State Management & Persistence**
- Create `useOnboardingState` hook with localStorage
- Implement auto-save on field changes (debounced)
- Handle page refresh gracefully
- Clear onboarding state on completion

**Acceptance Criteria**:
- State persists across page refreshes
- State clears after successful brand creation
- Can reset state if corrupted

**Files**:
- `src/features/onboarding/hooks/use-onboarding-state.tsx`
- `src/features/onboarding/types.ts`

**Code Scaffold**:
```typescript
// src/features/onboarding/hooks/use-onboarding-state.tsx
'use client';

import { useState, useEffect } from 'react';
import { OnboardingState } from '../types';

const STORAGE_KEY = 'colater_onboarding_v1';

export function useOnboardingState() {
  const [state, setState] = useState<OnboardingState | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setState(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse onboarding state', e);
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage on state change (debounced)
  useEffect(() => {
    if (!isLoaded || !state) return;

    const timeoutId = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [state, isLoaded]);

  const updateField = (field: keyof OnboardingState, value: any) => {
    setState(prev => ({
      ...prev!,
      [field]: value,
      lastUpdatedAt: new Date(),
    }));
  };

  const clearState = () => {
    localStorage.removeItem(STORAGE_KEY);
    setState(null);
  };

  return {
    state,
    isLoaded,
    updateField,
    clearState,
  };
}
```

---

**Task 1.3: Validation Schemas**
- Create Zod schemas for each step
- Add helpful error messages
- Implement field-level validation

**Acceptance Criteria**:
- Each field has validation rules
- Error messages are user-friendly
- Validation runs on blur and submit

**Files**:
- `src/features/onboarding/utils/validation-schemas.ts`

**Code Scaffold**:
```typescript
// src/features/onboarding/utils/validation-schemas.ts
import { z } from 'zod';

export const nameStepSchema = z.object({
  brandName: z.string()
    .min(1, 'Please enter a brand name')
    .max(50, 'Brand name must be less than 50 characters')
    .regex(/^[a-zA-Z0-9\s\-&]+$/, 'Only letters, numbers, spaces, hyphens and & allowed'),
});

export const pitchStepSchema = z.object({
  elevatorPitch: z.string()
    .min(10, 'Please provide more detail (at least 10 characters)')
    .max(200, 'Keep it concise (under 200 characters)'),
});

export const audienceStepSchema = z.object({
  targetAudience: z.string()
    .min(5, 'Please describe your target audience')
    .max(200, 'Keep it concise (under 200 characters)'),
});

export const styleStepSchema = z.object({
  desirableStyles: z.array(z.string())
    .min(1, 'Select at least one desirable style')
    .max(5, 'Select up to 5 styles'),
  undesirableStyles: z.array(z.string())
    .max(5, 'Select up to 5 styles'),
});
```

---

**Task 1.4: Analytics Setup**
- Create analytics tracking utilities
- Define events for each step
- Implement event firing on key actions

**Acceptance Criteria**:
- Events fire on step completion
- Events fire on AI helper usage
- Events fire on field skip
- Events include timing data

**Files**:
- `src/features/onboarding/utils/onboarding-analytics.ts`

**Code Scaffold**:
```typescript
// src/features/onboarding/utils/onboarding-analytics.ts

type OnboardingEvent =
  | 'onboarding_started'
  | 'onboarding_step_viewed'
  | 'onboarding_step_completed'
  | 'onboarding_field_skipped'
  | 'onboarding_ai_helper_used'
  | 'onboarding_completed'
  | 'first_logo_generated';

interface EventProperties {
  step?: number;
  field?: string;
  duration?: number;
  [key: string]: any;
}

export function trackOnboardingEvent(
  event: OnboardingEvent,
  properties?: EventProperties
) {
  // TODO: Integrate with your analytics provider
  console.log('[Analytics]', event, properties);

  // Example: Google Analytics
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', event, properties);
  }
}
```

### Phase 2: Welcome Page (Day 2)

**Task 2.1: Welcome Page Design**
- Create hero section with value proposition
- Add interactive logo preview carousel
- Implement social proof section
- Add primary CTA

**Acceptance Criteria**:
- Page loads in < 1s
- Animations are smooth (60fps)
- Mobile responsive
- CTA redirects to auth or first step

**Files**:
- `src/app/onboarding/page.tsx`
- `src/app/onboarding/welcome-client.tsx`
- `src/features/onboarding/components/welcome-hero.tsx`
- `src/features/onboarding/components/welcome-preview-carousel.tsx`

**Design Notes**:
- Use existing color scheme (lavender, teal)
- Show 3-4 example brands cycling through
- Include copy: "Your professional brand identity in 5 minutes"
- CTA: "Create Your Brand" button

### Phase 3: Step Components (Days 3-4)

**Task 3.1: Shared Step Wrapper Component**
- Create reusable step wrapper
- Add progress indicator
- Add back/next navigation
- Handle step transitions

**Acceptance Criteria**:
- Progress bar shows current step
- Back button navigates to previous step
- Next button validates and proceeds
- Keyboard navigation works (Tab, Enter)

**Files**:
- `src/features/onboarding/components/onboarding-step-wrapper.tsx`
- `src/features/onboarding/components/onboarding-progress.tsx`

**Code Scaffold**:
```typescript
// src/features/onboarding/components/onboarding-step-wrapper.tsx
'use client';

import { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { OnboardingProgress } from './onboarding-progress';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface OnboardingStepWrapperProps {
  currentStep: number;
  totalSteps: number;
  title: string;
  description?: string;
  children: ReactNode;
  onNext: () => Promise<boolean>; // Returns true if validation passed
  onBack?: () => void;
  nextLabel?: string;
  backLabel?: string;
  isNextDisabled?: boolean;
}

export function OnboardingStepWrapper({
  currentStep,
  totalSteps,
  title,
  description,
  children,
  onNext,
  onBack,
  nextLabel = 'Continue',
  backLabel = 'Back',
  isNextDisabled = false,
}: OnboardingStepWrapperProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNext = async () => {
    setIsSubmitting(true);
    const isValid = await onNext();
    setIsSubmitting(false);

    if (!isValid) {
      // Validation failed, stay on current step
      return;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Progress Bar */}
      <OnboardingProgress current={currentStep} total={totalSteps} />

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl space-y-8">
          {/* Title */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold">{title}</h1>
            {description && (
              <p className="text-muted-foreground">{description}</p>
            )}
          </div>

          {/* Step Content */}
          <div>{children}</div>

          {/* Navigation */}
          <div className="flex justify-between gap-4">
            {onBack ? (
              <Button
                variant="ghost"
                onClick={onBack}
                disabled={isSubmitting}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                {backLabel}
              </Button>
            ) : (
              <div /> // Spacer
            )}

            <Button
              onClick={handleNext}
              disabled={isNextDisabled || isSubmitting}
              className="min-w-[120px]"
            >
              {nextLabel}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

**Task 3.2: Step 1 - Brand Name**
- Create brand name input field
- Add "Need help?" button → AI name generator
- Add examples dropdown
- Implement validation

**Acceptance Criteria**:
- Input autofocuses on load
- Shows character count
- AI helper opens modal with suggestions
- Examples populate field on click

**Files**:
- `src/app/onboarding/steps/name/page.tsx`
- `src/app/onboarding/steps/name/name-step-client.tsx`
- `src/features/onboarding/components/ai-name-generator-modal.tsx`

---

**Task 3.3: Step 2 - Elevator Pitch**
- Create textarea with character counter
- Add helper text with examples
- Show AI completion option
- Implement validation

**Acceptance Criteria**:
- Textarea auto-expands
- Shows character count (10-200)
- AI helper pre-fills based on brand name
- Example text is helpful

**Files**:
- `src/app/onboarding/steps/pitch/page.tsx`
- `src/app/onboarding/steps/pitch/pitch-step-client.tsx`

---

**Task 3.4: Step 3 - Target Audience**
- Create textarea for audience description
- Add common audience examples by industry
- Show AI completion option
- Implement validation

**Acceptance Criteria**:
- Examples dropdown shows relevant options
- AI helper generates audience from name + pitch
- Textarea shows good examples

**Files**:
- `src/app/onboarding/steps/audience/page.tsx`
- `src/app/onboarding/steps/audience/audience-step-client.tsx`

---

**Task 3.5: Step 4 - Visual Style**
- Create pill selector for styles
- Show desirable/undesirable sections
- Display preview images on hover
- Implement multi-select validation

**Acceptance Criteria**:
- Can select multiple pills
- Pills have hover states
- Visual feedback for selection
- Preview images show style examples

**Files**:
- `src/app/onboarding/steps/style/page.tsx`
- `src/app/onboarding/steps/style/style-step-client.tsx`
- `src/features/onboarding/components/style-pill-selector.tsx`

**Code Scaffold**:
```typescript
// src/features/onboarding/components/style-pill-selector.tsx
'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface StylePillSelectorProps {
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  maxSelection?: number;
}

export function StylePillSelector({
  options,
  selected,
  onChange,
  maxSelection = 5,
}: StylePillSelectorProps) {
  const toggleStyle = (style: string) => {
    if (selected.includes(style)) {
      onChange(selected.filter(s => s !== style));
    } else if (selected.length < maxSelection) {
      onChange([...selected, style]);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {options.map(style => {
        const isSelected = selected.includes(style);
        const isDisabled = !isSelected && selected.length >= maxSelection;

        return (
          <Badge
            key={style}
            variant={isSelected ? 'default' : 'outline'}
            className={cn(
              'cursor-pointer transition-all hover:scale-105',
              isSelected && 'bg-primary text-primary-foreground',
              isDisabled && 'opacity-50 cursor-not-allowed'
            )}
            onClick={() => !isDisabled && toggleStyle(style)}
          >
            {style}
          </Badge>
        );
      })}
    </div>
  );
}
```

---

**Task 3.6: Step 5 - Review & Generate**
- Display all collected information
- Show edit buttons for each field
- Implement "Generate My Brand" CTA
- Handle form submission

**Acceptance Criteria**:
- All fields display correctly
- Edit buttons navigate to respective steps
- CTA creates brand and redirects to generating page
- Form submission integrates with existing brand creation

**Files**:
- `src/app/onboarding/steps/review/page.tsx`
- `src/app/onboarding/steps/review/review-step-client.tsx`

### Phase 4: Loading & Success (Day 5)

**Task 4.1: Generating Page**
- Create animated loading state
- Show progress indicators
- Display fun facts/tips
- Estimate completion time

**Acceptance Criteria**:
- Animation is smooth and engaging
- Progress indicators update realistically
- Redirects to brand page on completion
- Handles errors gracefully

**Files**:
- `src/app/onboarding/generating/page.tsx`
- `src/app/onboarding/generating/generating-client.tsx`
- `src/features/onboarding/components/generating-animation.tsx`

**Code Scaffold**:
```typescript
// src/features/onboarding/components/generating-animation.tsx
'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const STEPS = [
  { label: 'Analyzing your brand details', duration: 2000 },
  { label: 'Crafting logo concept', duration: 3000 },
  { label: 'Generating logo variations', duration: 5000 },
  { label: 'Extracting color palette', duration: 2000 },
  { label: 'Creating taglines', duration: 3000 },
];

const FUN_FACTS = [
  "Professional brand designers charge $500-5000 for this",
  "Great logos are simple, memorable, and versatile",
  "Color psychology influences how people perceive brands",
  "The average person sees 5,000 logos per day",
];

export function GeneratingAnimation() {
  const [currentStep, setCurrentStep] = useState(0);
  const [randomFact] = useState(() =>
    FUN_FACTS[Math.floor(Math.random() * FUN_FACTS.length)]
  );

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (currentStep < STEPS.length) {
      timeout = setTimeout(() => {
        setCurrentStep(prev => prev + 1);
      }, STEPS[currentStep].duration);
    }

    return () => clearTimeout(timeout);
  }, [currentStep]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 text-center">
        {/* Animated Icon */}
        <motion.div
          className="w-32 h-32 mx-auto bg-primary/10 rounded-full flex items-center justify-center"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        >
          <div className="w-24 h-24 bg-primary/20 rounded-full" />
        </motion.div>

        {/* Title */}
        <h2 className="text-2xl font-bold">Creating your brand identity...</h2>

        {/* Progress Steps */}
        <div className="space-y-3">
          {STEPS.map((step, index) => (
            <motion.div
              key={step.label}
              className="flex items-center gap-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{
                opacity: index <= currentStep ? 1 : 0.3,
                x: 0
              }}
            >
              {index < currentStep ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : index === currentStep ? (
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              ) : (
                <Circle className="h-5 w-5 text-muted-foreground" />
              )}
              <span className={cn(
                'text-sm',
                index <= currentStep ? 'text-foreground' : 'text-muted-foreground'
              )}>
                {step.label}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Fun Fact */}
        <p className="text-sm text-muted-foreground italic">
          💡 {randomFact}
        </p>
      </div>
    </div>
  );
}
```

---

**Task 4.2: Tutorial Modal**
- Create post-generation tutorial
- Add 3-step walkthrough with highlights
- Implement "Skip" and "Next" navigation
- Save completion state to prevent re-showing

**Acceptance Criteria**:
- Modal appears on first brand creation
- Can skip or complete tutorial
- Highlights key UI elements
- Doesn't show again for returning users

**Files**:
- `src/features/onboarding/components/tutorial-modal.tsx`

**Code Scaffold**:
```typescript
// src/features/onboarding/components/tutorial-modal.tsx
'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

const TUTORIAL_STEPS = [
  {
    title: 'Your Logo Preview',
    description: 'Try different layouts and styles to see what works best',
    highlightSelector: '[data-tutorial="logo-preview"]',
  },
  {
    title: 'Generate More Options',
    description: 'Create additional logo variations with one click',
    highlightSelector: '[data-tutorial="generate-button"]',
  },
  {
    title: 'Customize & Download',
    description: 'Fine-tune colors, fonts, and download when ready',
    highlightSelector: '[data-tutorial="controls"]',
  },
];

export function TutorialModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // Check if user has seen tutorial
    const hasSeenTutorial = localStorage.getItem('colater_tutorial_completed');
    if (!hasSeenTutorial) {
      setIsOpen(true);
    }
  }, []);

  const handleComplete = () => {
    localStorage.setItem('colater_tutorial_completed', 'true');
    setIsOpen(false);
  };

  const handleNext = () => {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const step = TUTORIAL_STEPS[currentStep];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <div className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">
              {step.title}
            </h3>
            <p className="text-sm text-muted-foreground">
              {step.description}
            </p>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex gap-1">
              {TUTORIAL_STEPS.map((_, index) => (
                <div
                  key={index}
                  className={cn(
                    'h-2 w-2 rounded-full',
                    index === currentStep ? 'bg-primary' : 'bg-muted'
                  )}
                />
              ))}
            </div>

            <div className="flex gap-2">
              <Button variant="ghost" onClick={handleComplete}>
                Skip
              </Button>
              <Button onClick={handleNext}>
                {currentStep < TUTORIAL_STEPS.length - 1 ? 'Next' : 'Got it!'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

### Phase 5: Polish & Integration (Days 6-7)

**Task 5.1: Mobile Responsiveness**
- Test on mobile/tablet devices
- Adjust layouts for smaller screens
- Ensure touch targets are adequate (44px min)
- Test keyboard on mobile

**Acceptance Criteria**:
- All steps work on mobile
- No horizontal scrolling
- Touch targets are accessible
- Virtual keyboard doesn't obscure inputs

---

**Task 5.2: Accessibility Audit**
- Add ARIA labels to all interactive elements
- Ensure keyboard navigation works
- Test with screen reader
- Add focus indicators

**Acceptance Criteria**:
- Can complete flow with keyboard only
- Screen reader announces all content
- Focus order is logical
- Color contrast meets WCAG AA

---

**Task 5.3: Error Handling**
- Handle network failures gracefully
- Show helpful error messages
- Implement retry mechanisms
- Add fallbacks for AI failures

**Acceptance Criteria**:
- Network errors show user-friendly messages
- Can retry failed AI generations
- Form errors are specific and helpful
- Doesn't lose user data on errors

---

**Task 5.4: Integration Testing**
- Test entire flow end-to-end
- Verify analytics events fire
- Check localStorage persistence
- Test with existing brand creation logic

**Acceptance Criteria**:
- Can complete full flow without errors
- Analytics data is accurate
- State persists correctly
- Integrates with existing brand service

---

**Task 5.5: Performance Optimization**
- Lazy load heavy components
- Optimize images and animations
- Minimize bundle size
- Add loading skeletons

**Acceptance Criteria**:
- First paint < 1s
- Animations run at 60fps
- Bundle size increase < 50kb
- No layout shifts

## Testing Plan

### Unit Tests
- [ ] `useOnboardingState` hook
- [ ] Validation schemas
- [ ] Analytics utilities
- [ ] Style pill selector component

### Integration Tests
- [ ] Complete onboarding flow
- [ ] Navigation between steps
- [ ] Form submission and brand creation
- [ ] Error handling scenarios

### E2E Tests (Recommended)
- [ ] New user completes onboarding
- [ ] User refreshes mid-flow (persistence)
- [ ] User uses AI helper at each step
- [ ] User edits from review page
- [ ] Mobile flow completion

### Manual Testing Checklist
- [ ] Desktop Chrome
- [ ] Desktop Safari
- [ ] Desktop Firefox
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)
- [ ] Tablet (iPad)
- [ ] Keyboard navigation only
- [ ] Screen reader (VoiceOver/NVDA)

## Analytics Events to Track

```typescript
// Event definitions
'onboarding_started' // User lands on welcome page
'onboarding_step_viewed' // { step: 1-5 }
'onboarding_step_completed' // { step: 1-5, duration: ms }
'onboarding_field_filled' // { field: string, usedAi: boolean }
'onboarding_field_skipped' // { field: string }
'onboarding_ai_helper_used' // { field: string }
'onboarding_back_clicked' // { fromStep: number }
'onboarding_completed' // { duration: ms, totalSteps: 5 }
'first_logo_generated' // { quality_score: number }
'tutorial_viewed' // { step: 1-3 }
'tutorial_completed' // { completed: boolean }
'tutorial_skipped' // { atStep: number }
```

## Constants & Copy

```typescript
// src/lib/onboarding-constants.ts

export const STYLE_OPTIONS = {
  desirable: [
    'Modern', 'Minimalist', 'Professional', 'Playful', 'Elegant',
    'Tech-forward', 'Organic', 'Bold', 'Refined', 'Approachable',
    'Geometric', 'Handcrafted', 'Luxurious', 'Energetic', 'Sophisticated',
  ],
  undesirable: [
    'Corporate', 'Traditional', 'Cluttered', 'Childish', 'Cold',
    'Generic', 'Busy', 'Dated', 'Aggressive', 'Sterile',
  ],
};

export const AUDIENCE_EXAMPLES = {
  'Tech/SaaS': 'Software developers, tech startups, IT professionals aged 25-45',
  'E-commerce': 'Online shoppers, millennials and Gen Z, bargain hunters',
  'Food & Beverage': 'Food enthusiasts, families, health-conscious consumers',
  'Fitness': 'Athletes, gym-goers, wellness enthusiasts aged 20-50',
  'Education': 'Students, lifelong learners, professionals seeking upskilling',
  'Creative': 'Designers, artists, creative professionals and agencies',
};

export const PITCH_EXAMPLES = [
  'A project management tool that helps teams collaborate effortlessly',
  'Premium organic coffee delivered to your door monthly',
  'AI-powered fitness coaching personalized to your goals',
  'An online learning platform for professional development',
];

export const ONBOARDING_COPY = {
  welcome: {
    hero: 'Your professional brand identity in 5 minutes',
    subtitle: 'AI-powered logo, tagline, and brand kit—no design skills needed',
    cta: 'Create Your Brand',
  },
  steps: {
    name: {
      title: "Let's start with your brand name",
      placeholder: 'e.g., TechFlow, Café Luna, FitLife',
    },
    pitch: {
      title: "What does your brand do?",
      description: "In one sentence, describe what you offer and who you help",
      placeholder: "e.g., A cozy coffee shop for remote workers and creatives",
    },
    audience: {
      title: "Who is your brand for?",
      description: "Describe your ideal customer or target audience",
      placeholder: "e.g., Remote workers, freelancers, and digital nomads aged 25-40",
    },
    style: {
      title: "Choose visual styles that match your vision",
      description: "Select styles you want (and don't want) in your brand",
    },
    review: {
      title: "Ready to create your brand?",
      description: "Review your details and generate your brand identity",
    },
  },
};
```

## Definition of Done

- [ ] All tasks completed and merged to main
- [ ] Analytics events firing correctly
- [ ] Mobile responsive and tested
- [ ] Accessible (keyboard + screen reader)
- [ ] No TypeScript errors or warnings
- [ ] Performance metrics met (< 500ms, 60fps)
- [ ] Integration with existing brand creation working
- [ ] localStorage persistence tested
- [ ] Error handling implemented
- [ ] Tutorial modal working
- [ ] Code reviewed and approved
- [ ] Documentation updated (CLAUDE.md)
- [ ] Product owner approval

## Deployment Plan

### Pre-deployment
1. Test on staging environment
2. Run full E2E test suite
3. Verify analytics integration
4. Check localStorage compatibility across browsers

### Deployment
1. Deploy behind feature flag initially
2. Enable for 10% of new users
3. Monitor analytics and error rates
4. Gradually increase to 50%, then 100%

### Post-deployment
1. Monitor key metrics daily for first week
2. Track completion rate, time-to-first-logo
3. Collect user feedback
4. Fix any critical bugs within 24h

## Success Metrics (Week 1)

- **Activation Rate**: 70%+ complete onboarding
- **Time to First Logo**: < 5 minutes average
- **Completion Rate**: 80%+ finish all steps
- **Error Rate**: < 2% see errors
- **Mobile Completion**: 60%+ on mobile
- **7-Day Retention**: 40%+ return

## Resources

### Design
- Figma file: [Link to mockups if available]
- Color palette: Soft lavender (#D1C4E9), Muted teal (#80CBC4)
- Typography: Existing brand fonts from `brand-fonts.ts`

### API Endpoints
- Brand creation: Existing `createBrand` from `brand.service.ts`
- AI completion: Existing `getBrandSuggestions` from `actions.ts`

### External Dependencies
- Framer Motion (already installed)
- React Hook Form (already installed)
- Zod (already installed)

## Questions for Product Owner

1. Should we allow users to skip steps entirely?
2. What happens if user abandons mid-onboarding?
3. Should we email users who don't complete?
4. Do we want A/B tests for different copy/flows?
5. Should tutorial be dismissible forever or show again?

## Risks & Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Users find steps too long | High - Abandonment | Add "Skip" options, track where users drop off |
| AI helper fails | Medium - Poor UX | Show helpful examples as fallback |
| Mobile keyboard obscures input | Medium - UX issue | Test extensively, add scroll-into-view |
| localStorage data loss | Low - Data loss | Auto-save frequently, show recovery UI |
| Analytics not firing | Low - Missing data | Add console logs in dev, test thoroughly |

## Support & Documentation

- Add entry to CLAUDE.md explaining onboarding architecture
- Create troubleshooting guide for common issues
- Document analytics events for data team
- Add comments to complex logic

---

**Ready to implement?** Start with Phase 1 (Foundation) and work through sequentially. Each task has clear acceptance criteria and code scaffolds. Ask questions early if requirements are unclear!
