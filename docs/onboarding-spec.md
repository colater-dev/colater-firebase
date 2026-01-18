# Onboarding Flow Specification

**Priority**: P1 - High Priority
**Impact**: User Activation & Conversion
**Effort**: Large (5-7 days)
**Owner**: Product + Design

## Problem Statement

New users landing on Colater face a blank canvas with no guidance on:
- What Colater does and why it's valuable
- How to create their first brand
- What inputs are needed for quality outputs
- What to expect from the AI generation process

This leads to:
- High bounce rates on the landing page
- Abandoned brand creation forms
- Poor quality first logos (inadequate input)
- Confusion about next steps after logo generation

## Success Metrics

- **Primary**: Time-to-first-logo < 5 minutes
- **Activation**: 70%+ of new users complete first brand
- **Retention**: 40%+ return within 7 days
- **Quality**: Average logo rating > 3.5/5 on first attempt

## User Journey

### Phase 1: Landing → Sign Up (Motivation)

**Goal**: Show value before auth wall

**Current State**: Immediate Google sign-in required

**Proposed Flow**:
1. **Hero Section** - Show animated example of logo generation
2. **Interactive Preview** - Let users see 3-4 example brands with live logo switching
3. **Social Proof** - "Join 1,000+ creators" + sample gallery
4. **CTA**: "Create Your Brand" → Google Sign-in

**Copy Examples**:
- "Your professional brand identity in 5 minutes"
- "AI-powered logo, tagline, and brand kit"
- "No design skills needed"

### Phase 2: First Brand Creation (Guided Input)

**Goal**: Get quality inputs without overwhelming

**Current State**: Empty form with 5 fields, "Fill for me" button

**Proposed Flow**:

**Step 1: Brand Name** (Single focus)
```
"Let's start with your brand name"
[Text input: "e.g., TechFlow, Café Luna, FitLife"]
[Skip button: "I need help with this"]

→ If skip: Show AI name generator modal
```

**Step 2: Elevator Pitch** (Conversational)
```
"In one sentence, what does [BrandName] do?"
[Textarea: "e.g., A cozy coffee shop for remote workers"]
[Helper text: "Describe what you offer and who you help"]
```

**Step 3: Target Audience** (Specific)
```
"Who is [BrandName] for?"
[Textarea: "e.g., Remote workers, freelancers, digital nomads aged 25-40"]
[Examples dropdown: Show common audiences by industry]
```

**Step 4: Visual Style** (Pill Selection)
```
"Choose styles that match your vision:"

Desirable: [Modern] [Minimalist] [Professional] [Playful] [Elegant]
           [Tech-forward] [Organic] [Bold] [Refined] [Approachable]

Undesirable: [Corporate] [Traditional] [Cluttered] [Childish] [Cold]

[Show 3 logo examples for each selected style]
```

**Step 5: Review & Generate**
```
"Here's what we'll create:"
✓ Brand Name: TechFlow
✓ Does: A project management tool for creative teams
✓ For: Design agencies and creative studios
✓ Style: Modern, minimalist, professional

[Generate My Brand] (Primary CTA)
[< Back to edit]
```

### Phase 3: First Logo Generation (Set Expectations)

**Goal**: Manage expectations during AI generation

**Current State**: Loading spinner, unclear wait time

**Proposed Flow**:

**Loading State** (30-60 seconds):
```
[Animated brand icon building itself]

"Creating your brand identity..."

Progress indicators:
✓ Analyzing your brand details
→ Crafting logo concept
→ Generating logo variations
→ Extracting color palette
→ Creating taglines

Fun fact: "Professional brand designers charge $500-5000 for this"
```

**First Success State**:
```
[Confetti animation]

"Your brand is ready! 🎉"

[Show logo in main preview]

Quick Tutorial (Modal overlay):
1. "This is your logo preview - try different layouts"
2. "Generate more options here" [Point to Generate button]
3. "Customize colors and fonts" [Point to controls]
4. "Download or share when ready" [Point to actions]

[Got it, show me around] [Skip tutorial]
```

### Phase 4: Feature Discovery (Progressive)

**Goal**: Surface features as users need them

**Contextual Tooltips**:
- After 2nd logo: "Try the ranker to help AI learn your style"
- After selecting logo: "Create a professional presentation for clients"
- After 5 minutes: "Need inspiration? Browse the moodboard"
- Before leaving: "Save this logo? Download your brand kit"

**Empty States**:
- No taglines yet: "Generate taglines that capture your essence"
- No color versions: "Colorize your logo for different uses"
- No mockups: "See your logo on business cards and apparel"

## Implementation Plan

### Week 1: Foundation
- Design new landing page with interactive preview
- Create step-by-step brand creation wizard
- Build loading state with progress animation

### Week 2: Guided Experience
- Implement progressive disclosure for form fields
- Add inline examples and helpers
- Create contextual tooltips system

### Week 3: Polish & Testing
- Add tutorial modal and walkthrough
- Implement analytics tracking
- A/B test against current flow

## Open Questions

1. **Skip vs. Required**: Should all fields be optional with AI completion fallback?
2. **Example Brands**: Should we seed accounts with pre-made example brands?
3. **Email Capture**: When to ask for email (before/after sign-in)?
4. **Mobile Experience**: Does onboarding differ significantly on mobile?
5. **Return Users**: How to handle users who created brand but never finished?

## Design Notes

### Visual Style
- Use existing soft lavender (#D1C4E9) and muted teal (#80CBC4)
- Animate transitions between steps (Framer Motion)
- Show progress bar at top (Step 2 of 5)
- Keep form focused (hide nav/sidebar during onboarding)

### Copy Tone
- Friendly but professional
- Action-oriented (verbs: Create, Choose, Generate)
- Avoid jargon (not "brand identity system", say "logo and colors")
- Celebrate small wins ("Great choice!", "Looking good!")

### Accessibility
- Keyboard navigation between steps
- Clear focus states
- Screen reader announcements for progress
- Error states with helpful suggestions

## Technical Considerations

### Routing
```
/onboarding/welcome       → Landing preview
/onboarding/name          → Step 1
/onboarding/pitch         → Step 2
/onboarding/audience      → Step 3
/onboarding/style         → Step 4
/onboarding/review        → Step 5
/onboarding/generating    → Loading state
/brands/[id]              → Success redirect
```

### State Management
- Use URL query params for step navigation
- Store partial progress in localStorage
- Save to Firestore only on final submit
- Handle browser back/forward gracefully

### Analytics Events
```typescript
track('onboarding_started')
track('onboarding_step_completed', { step: 'name' })
track('onboarding_skipped_field', { field: 'audience' })
track('onboarding_used_ai_helper', { field: 'pitch' })
track('onboarding_completed', { duration: 245 })
track('first_logo_generated', { quality_inputs: true })
```

## Future Enhancements

- **Video Tutorials**: Short clips showing advanced features
- **Templates**: "Start from template" option with industry presets
- **Personalization**: Remember user's industry and tailor suggestions
- **Gamification**: Achievement badges for milestones
- **Email Drip**: Follow-up emails with tips and use cases

## References

- Current `/brands/new` page
- Existing "Fill for me" AI flow
- Brand creation form validation (Zod schemas)
- Multi-step form patterns in the wild (Linear, Notion, Figma)
