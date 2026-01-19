# Brand Presentation Feature - Redesign Specification

**Priority**: P1 - High Priority (Existing Feature Enhancement)
**Estimated Effort**: 4-5 days
**Target Users**: Designers, Agencies, Founders presenting to stakeholders

---

## Problem Analysis

### Current State Issues

**What Works**:
- ✅ First 3-4 slides are well-designed (Icon, Logo, Color Logo, Color Palette)
- ✅ Beautiful visual quality and animations
- ✅ Smooth scrolling between slides
- ✅ Contextual action buttons per slide

**What Doesn't Work**:
1. **Unclear Purpose**: After slide 4, it's unclear who this is for or what story it's telling
2. **Redundant Slides**: Logo Grid, Logo System, Design System Snapshot all show similar content
3. **Weak AI Content**: "Brand Idea", "Visual Intent", and "Takeaway" slides have generic, uninspiring AI text
4. **Missing Context**: No clear narrative arc or presentation flow
5. **Unused Actions**: Many action buttons ("Shuffle Names", "Refresh Phrases") don't do anything meaningful
6. **No Export**: Can't export as PDF, share publicly, or present to clients
7. **Too Many Slides**: 13 slides is overwhelming for a quick brand presentation

### Target Persona: **Sarah, Freelance Designer**

**Who is Sarah?**
- 28 years old, freelance brand designer
- Works with 3-5 small business clients per month
- Needs to present brand concepts to non-designer clients
- Budget: $1-5k per project
- Pain: Clients don't understand design rationale, need quick turnarounds

**Sarah's Job-to-be-Done**:
> "When I create a brand identity for a client, I need to present it professionally so that they understand the strategy and approve quickly, without back-and-forth revisions."

**What Sarah Needs**:
1. **Story-driven flow**: Takes client on a journey from concept → logo → applications
2. **Client-friendly language**: No designer jargon, clear explanations
3. **Editable content**: Customize slides with her own text
4. **Professional export**: Download as PDF to send to clients
5. **Fast creation**: Auto-generate 90% of content, tweak 10%
6. **Share link**: Send a public link clients can view

---

## Redesigned Experience

### Core Principles

1. **Tell a Story**: Every presentation is a narrative journey
2. **Less is More**: 6-8 slides max, each with clear purpose
3. **Actionable Over Aesthetic**: Every slide should educate or persuade
4. **Editable by Default**: Sarah should customize everything
5. **Client-Ready**: Language and design for non-designers

### New Slide Structure (8 Slides)

#### **Slide 1: Cover - "Meet [Brand Name]"**
**Purpose**: Set the stage, create excitement
**Content**:
- Large brand name with logo
- Tagline underneath
- Optional: Client name ("Created for ABC Company")
- Subtle background color from palette

**Editable Fields**:
- Brand name
- Tagline
- Client name (optional)
- Background color picker

**Actions**: [Edit Text] [Change Layout]

---

#### **Slide 2: The Challenge - "Why This Brand Exists"**
**Purpose**: Context - what problem does this brand solve?
**Content**:
- "The Challenge" header
- 2-3 sentence description of market problem
- Visual: Abstract shape or pattern from logo

**AI-Generated Content**:
```typescript
{
  challengeTitle: "The Challenge",
  problemStatement: "Small businesses struggle to create professional brand identities on limited budgets. They need accessible, high-quality design that builds trust with customers.",
  marketContext: "The gap between DIY logo makers and expensive agencies leaves startups underserved."
}
```

**Editable Fields**: All text fields
**Actions**: [Rewrite Challenge] [Edit Text]

---

#### **Slide 3: The Solution - "Brand Strategy"**
**Purpose**: Explain the brand's unique approach
**Content**:
- "The Solution" header
- Brand's elevator pitch (refined)
- 3 key brand attributes (keywords)
- Target audience callout

**AI-Generated Content**:
```typescript
{
  solutionStatement: "AI-powered brand creation that delivers designer-quality results in minutes, not weeks.",
  keyAttributes: ["Accessible", "Professional", "Fast"],
  targetAudienceStatement: "Built for founders, freelancers, and small businesses who value quality design."
}
```

**Editable Fields**: All text, attributes
**Actions**: [Refine Strategy] [Edit Attributes]

---

#### **Slide 4: The Mark - "Logo Revealed"**
**Purpose**: Showcase the logo as the hero
**Content**:
- Full-screen logo (B&W version)
- Clean, minimal presentation
- No text distractions

**Actions**: [Switch Logo Version] [Download Logo]

---

#### **Slide 5: Visual Identity - "Logo System"**
**Purpose**: Show logo versatility across contexts
**Content**:
- 2x2 grid:
  - Top-left: Color logo on white
  - Top-right: B&W logo on brand color
  - Bottom-left: Logo on black background
  - Bottom-right: Logo icon only

**Actions**: [Customize Grid] [Download Assets]

---

#### **Slide 6: Color Story - "Brand Palette"**
**Purpose**: Explain color choices and usage
**Content**:
- Color swatches (3-5 colors)
- Color names (AI-generated meaningful names)
- One-sentence color philosophy
- Usage hints per color

**AI-Generated Content**:
```typescript
{
  colorPhilosophy: "Energetic orange inspires action, while soft gray provides balance and sophistication.",
  colorUsage: [
    { color: "#FF6B35", name: "Ember Orange", usage: "Primary actions, headlines" },
    { color: "#F7F7F7", name: "Canvas Gray", usage: "Backgrounds, subtle elements" },
    { color: "#2C3E50", name: "Anchor Navy", usage: "Body text, grounding" }
  ]
}
```

**Editable Fields**: Color names, philosophy, usage notes
**Actions**: [Edit Colors] [Adjust Hue] [Rename Colors]

---

#### **Slide 7: In The Wild - "Applications"**
**Purpose**: Show logo in real-world contexts
**Content**:
- Grid of 2-3 mockups:
  - Business card mockup
  - Website hero mockup
  - Social media post mockup
- Realistic, professional presentation

**Actions**: [Change Mockup Style] [Add Custom Mockup]

---

#### **Slide 8: Next Steps - "Bringing It to Life"**
**Purpose**: Clear call-to-action and deliverables
**Content**:
- "What You're Getting" section
  - ✓ Logo files (PNG, SVG)
  - ✓ Color palette guide
  - ✓ Typography recommendations
  - ✓ Brand guidelines (optional)
- Next steps callout
- Contact info or CTA button

**AI-Generated Content**:
```typescript
{
  deliverablesList: [
    "High-resolution logo files (PNG, SVG, JPG)",
    "Complete color palette with HEX codes",
    "Typography pairing recommendations",
    "Basic brand usage guidelines"
  ],
  nextStepsStatement: "Ready to launch your brand? Let's finalize the details and prepare your assets.",
  closingMessage: "Your brand identity is ready to make an impact."
}
```

**Editable Fields**: Deliverables list, next steps text
**Actions**: [Customize Deliverables] [Edit Contact Info]

---

## Enhanced AI Content Generation

### New AI Flow: `generate-presentation-narrative.ts`

```typescript
interface PresentationNarrativeInput {
  brandName: string;
  elevatorPitch: string;
  targetAudience: string;
  desirableCues: string;
  logoConceptSummary: string;
  palette: string[];
  colorNames?: string[];
}

interface PresentationNarrativeOutput {
  // Slide 2: The Challenge
  challengeTitle: string;
  problemStatement: string;
  marketContext: string;

  // Slide 3: The Solution
  solutionStatement: string;
  keyAttributes: string[]; // 3 attributes
  targetAudienceStatement: string;

  // Slide 6: Color Story
  colorPhilosophy: string;
  colorUsage: Array<{
    color: string;
    name: string;
    usage: string;
  }>;

  // Slide 8: Next Steps
  deliverablesList: string[];
  nextStepsStatement: string;
  closingMessage: string;
}
```

**Prompt Strategy**:
- Use brand details to generate contextual, specific content
- Avoid generic phrases like "innovation driven by excellence"
- Make it sound like Sarah (the designer) wrote it
- Focus on benefits to the client, not design theory
- Keep sentences short and punchy

---

## New Features

### 1. **Edit Mode**
- Click any text to edit inline
- Changes save automatically to Firestore
- Preview mode vs Edit mode toggle
- Undo/redo support

**Implementation**:
```typescript
interface EditableSlide {
  slideId: string;
  editableFields: {
    [fieldKey: string]: {
      value: string;
      type: 'text' | 'textarea' | 'list';
      maxLength?: number;
    }
  };
}

// Firestore structure
/users/{userId}/brands/{brandId}/presentations/{presentationId}
  - slides: EditableSlide[]
  - lastEdited: Timestamp
  - version: number
```

---

### 2. **PDF Export**
- "Download as PDF" button in header
- Generates clean, print-ready PDF
- Includes all 8 slides
- Optional: Add custom cover page with client branding

**Implementation**:
- Use `html-to-image` to capture each slide as PNG
- Use `jsPDF` to combine into multi-page PDF
- Server-side generation for better quality (optional)

**User Flow**:
1. Click "Export PDF"
2. Modal: "Customize your export"
   - [ ] Include contact information
   - [ ] Add client logo
   - [ ] Include cover page
3. Generate PDF (5-10 seconds)
4. Auto-download

---

### 3. **Public Share Link**
- Generate shareable link: `colater.ai/p/{presentationId}`
- Password protection (optional)
- View-only mode (no edit buttons)
- Analytics: Track views, time spent per slide

**Firestore Structure**:
```typescript
interface SharedPresentation {
  presentationId: string;
  brandId: string;
  userId: string;
  isPublic: boolean;
  shareToken: string; // Random UUID
  password?: string; // Hashed
  expiresAt?: Timestamp;
  viewCount: number;
  lastViewed?: Timestamp;
}
```

**Share Modal UI**:
```
┌─────────────────────────────────────┐
│  Share Your Presentation            │
├─────────────────────────────────────┤
│  Link: colater.ai/p/abc123          │
│  [Copy Link]                         │
│                                      │
│  ☐ Password protect                  │
│  ☐ Set expiration date               │
│                                      │
│  👁 12 views                         │
│                                      │
│  [Copy Link]  [Revoke Access]       │
└─────────────────────────────────────┘
```

---

### 4. **Slide Reordering**
- Drag-and-drop to reorder slides
- Skip/hide slides
- Duplicate slides

**UI**:
- Thumbnail sidebar showing all slides
- Drag handle on each thumbnail
- Checkbox to show/hide slide in presentation

---

### 5. **Template Library** (Future)
- Pre-made slide templates for different industries
- "Tech Startup" template vs "Coffee Shop" template
- Different visual styles (Minimal, Bold, Elegant)

---

## Technical Implementation

### Phase 1: Core Redesign (Days 1-2)

**Task 1.1: Restructure Slides**
- Remove redundant slides: `DesignSystemSnapshotSlide`, `VisualIntentSlide`
- Merge similar slides: `LogoGridSlide` + `LogoSystemSlide` → `VisualIdentitySlide`
- Add new slides: `ChallengeSlide`, `SolutionSlide`, `NextStepsSlide`

**Task 1.2: New AI Flow**
- Create `generate-presentation-narrative.ts`
- Update `getPresentationData` server action
- Cache results in Firestore under `presentations` subcollection

**Task 1.3: Update Existing Slides**
- Simplify `BrandIdentitySlide` → `CoverSlide`
- Enhance `ColorWorldSlide` with usage hints
- Redesign `BrandInActionSlide` with better mockups

**Acceptance Criteria**:
- 8 slides total (down from 13)
- Each slide has clear purpose
- AI-generated content is contextual and specific
- No generic placeholder text

---

### Phase 2: Edit Mode (Day 3)

**Task 2.1: Inline Editing**
- Add `contentEditable` to text fields
- Debounced auto-save to Firestore
- Visual feedback when editing (border highlight)

**Task 2.2: Edit/Preview Toggle**
- Button in header: "Edit Mode" / "Preview Mode"
- Hide action buttons in preview mode
- Show save indicator

**Task 2.3: Presentations Subcollection**
- Create `/users/{userId}/brands/{brandId}/presentations/{presentationId}` structure
- Store customized slide content
- Version tracking

**Acceptance Criteria**:
- Can click any text to edit
- Changes save automatically
- Can toggle between edit/preview modes
- Customizations persist on refresh

---

### Phase 3: Export & Share (Days 4-5)

**Task 3.1: PDF Export**
- Install `jspdf` and configure
- Create PDF generation function
- Add "Export PDF" button
- Loading state during generation

**Task 3.2: Share Link**
- Create public presentation route: `/p/[shareToken]`
- Generate share tokens
- Implement password protection (optional)
- Add share modal UI

**Task 3.3: Analytics**
- Track presentation views
- Time spent per slide
- Most viewed slides

**Acceptance Criteria**:
- PDF exports cleanly with all 8 slides
- Share links work without authentication
- Password protection functional
- View count tracked

---

## File Structure

```
src/
├── app/
│   ├── brands/[brandId]/presentation/
│   │   ├── page.tsx                          # Main presentation page
│   │   ├── presentation-client.tsx           # Presentation viewer
│   │   └── edit/
│   │       └── page.tsx                      # Edit mode page
│   └── p/[shareToken]/
│       ├── page.tsx                          # Public share page
│       └── share-client.tsx                  # Public viewer
│
├── features/presentation/
│   ├── components/
│   │   ├── slides/
│   │   │   ├── cover-slide.tsx              # Slide 1
│   │   │   ├── challenge-slide.tsx          # Slide 2
│   │   │   ├── solution-slide.tsx           # Slide 3
│   │   │   ├── logo-reveal-slide.tsx        # Slide 4
│   │   │   ├── visual-identity-slide.tsx    # Slide 5 (replaces grid)
│   │   │   ├── color-story-slide.tsx        # Slide 6 (enhanced)
│   │   │   ├── applications-slide.tsx       # Slide 7
│   │   │   └── next-steps-slide.tsx         # Slide 8
│   │   ├── editable-text.tsx                # Reusable editable text
│   │   ├── slide-thumbnail.tsx              # Thumbnail in sidebar
│   │   ├── export-pdf-modal.tsx             # PDF export UI
│   │   ├── share-modal.tsx                  # Share link UI
│   │   └── index.ts
│   ├── hooks/
│   │   ├── use-presentation-edit.tsx        # Edit mode logic
│   │   ├── use-pdf-export.tsx               # PDF generation
│   │   └── index.ts
│   └── utils/
│       ├── pdf-generator.ts                 # PDF export logic
│       ├── share-token.ts                   # Token generation
│       └── index.ts
│
├── ai/flows/
│   └── generate-presentation-narrative.ts   # New AI flow
│
└── services/
    └── presentation.service.ts              # CRUD for presentations
```

---

## Data Models

```typescript
// src/lib/types.ts

interface Presentation {
  id: string;
  brandId: string;
  userId: string;
  createdAt: Timestamp;
  lastEdited: Timestamp;
  version: number;

  // Customized content
  slides: PresentationSlide[];

  // Metadata
  title?: string;
  clientName?: string;
  isPublic: boolean;
  shareToken?: string;
  sharePassword?: string;
  expiresAt?: Timestamp;

  // Analytics
  viewCount: number;
  lastViewed?: Timestamp;
}

interface PresentationSlide {
  slideId: string; // 'cover', 'challenge', 'solution', etc.
  order: number;
  isVisible: boolean;

  // Editable content (varies by slide type)
  content: {
    [fieldKey: string]: string | string[];
  };
}

// Example: Cover Slide
interface CoverSlideContent {
  brandName: string;
  tagline: string;
  clientName?: string;
  backgroundColor: string;
}

// Example: Challenge Slide
interface ChallengeSlideContent {
  challengeTitle: string;
  problemStatement: string;
  marketContext: string;
}
```

---

## UI/UX Enhancements

### Header Controls (Edit Mode)

```
┌────────────────────────────────────────────────────────┐
│ [← Back] [Brand Name] Presentation                     │
│                                                         │
│ [Preview Mode ▼]  [Export PDF]  [Share]  [× Close]    │
└────────────────────────────────────────────────────────┘
```

**Edit Mode Dropdown**:
- ○ Preview Mode (view-only)
- ● Edit Mode (inline editing)
- Reorder Slides
- Reset to Default

---

### Slide Navigation (Sidebar)

```
┌─────────────┐
│ Slides      │
├─────────────┤
│ [✓] Cover   │ ← Current
│ [ ] Challeng│
│ [✓] Solution│
│ [✓] Logo    │
│ [ ] Identity│
│ [✓] Colors  │
│ [✓] Apps    │
│ [✓] Next    │
└─────────────┘
```

- Checkboxes to show/hide slides
- Drag to reorder
- Click to jump to slide
- Visual indicator of current slide

---

### Inline Editing

**Before Edit**:
```
┌──────────────────────────────────┐
│ The Challenge                     │
│                                   │
│ Small businesses struggle to...   │
│                                   │
│ [Click to edit]                   │
└──────────────────────────────────┘
```

**During Edit**:
```
┌──────────────────────────────────┐
│ The Challenge                     │
│ ┌────────────────────────────┐   │
│ │ Small businesses struggle  │   │
│ │ to create professional...  │   │
│ │ █                          │   │
│ └────────────────────────────┘   │
│ ✓ Saving...                       │
└──────────────────────────────────┘
```

---

## Copy Examples

### Cover Slide
```
Brand Name: TechFlow
Tagline: Project management for creative teams
Client: (Optional) Created for Acme Design Studio
```

### Challenge Slide
```
The Challenge

Creative teams waste hours in scattered tools,
jumping between Slack, Trello, and email just
to track project progress.

Without a unified workflow, deadlines slip
and communication breaks down.
```

### Solution Slide
```
The Solution

TechFlow brings creative project management
into one beautiful, intuitive workspace.

✦ Collaborative
✦ Visual
✦ Fast

Built for designers, agencies, and
creative professionals who value simplicity.
```

### Color Story Slide
```
Brand Palette

Ember Orange (#FF6B35)
→ Energizes calls-to-action and headlines

Canvas Gray (#F7F7F7)
→ Provides breathing room and sophistication

Anchor Navy (#2C3E50)
→ Grounds text and builds trust

Color Philosophy: Bold energy balanced
with calm professionalism.
```

### Next Steps Slide
```
What You're Getting

✓ High-resolution logo files (PNG, SVG, JPG)
✓ Complete color palette with HEX codes
✓ Typography pairing recommendations
✓ Basic brand usage guidelines

Next Steps

Ready to launch TechFlow? Let's finalize
the details and prepare your assets for launch.

Your brand identity is ready to make an impact.

[Contact: hello@sarahdesigns.com]
```

---

## Success Metrics

**Engagement**:
- Average slides viewed: 6+ out of 8
- Time spent: 3-5 minutes per presentation
- Edit rate: 40%+ customize at least one field

**Sharing**:
- 30%+ of presentations are shared publicly
- Average 5+ views per shared presentation
- 20%+ password-protect their presentations

**Export**:
- 50%+ export to PDF
- Average 1.5 PDF exports per presentation

**Satisfaction**:
- "This helped me present to my client" - 80%+ agree
- NPS score: 40+

---

## Open Questions

1. Should presentations be versioned (v1, v2, v3)?
2. Should we allow adding custom slides?
3. Should PDF export be a premium feature?
4. Do we need collaborative editing (multiple users)?
5. Should there be different templates for different industries?

---

## Dependencies

**New npm packages**:
```bash
npm install jspdf html2canvas
```

**Existing packages to leverage**:
- `html-to-image` (already installed)
- `framer-motion` (already installed)
- React Hook Form + Zod for edit forms

---

## Rollout Plan

### Week 1: Core Redesign
- Implement 8-slide structure
- New AI narrative flow
- Updated slide components

### Week 2: Edit & Export
- Inline editing functionality
- PDF export feature
- Share link generation

### Week 3: Polish
- Analytics tracking
- Mobile responsive adjustments
- Performance optimization

### Week 4: Beta Testing
- Test with 10 designers
- Collect feedback
- Iterate on UX

---

## For Gemini Flash Implementation

### Instructions for Antigravity

**Context**: You are redesigning the brand presentation feature in Colater. The current implementation has 13 slides, many of which are redundant or have weak AI-generated content. Your goal is to create a focused, story-driven 8-slide presentation that designers can customize and share with clients.

**Your Task**:
1. Implement the 8 new slides as specified in "New Slide Structure"
2. Create the AI flow `generate-presentation-narrative.ts`
3. Add inline editing capability with auto-save
4. Implement PDF export functionality
5. Create public share link feature

**Key Requirements**:
- Each slide must have clear purpose and editable content
- AI-generated text should be specific to the brand, not generic
- All changes save automatically to Firestore
- Export to PDF should be high-quality and print-ready
- Share links work without authentication

**Success Criteria**:
- 8 slides total (down from 13)
- All text is editable inline
- PDF export generates clean, professional document
- Share links are publicly accessible
- Mobile responsive

**Files to Create/Modify**:
- See "File Structure" section above
- Update `presentation-client.tsx` with new slides
- Create new slide components in `features/presentation/components/slides/`
- Create `generate-presentation-narrative.ts` AI flow
- Add PDF export and share features

**Testing**:
- Create a test brand and generate presentation
- Edit text inline and verify it saves
- Export PDF and check quality
- Generate share link and test in incognito mode
- Test on mobile device

Please implement this specification, following the architectural patterns established in the codebase (service layer, Firebase hooks, component extraction). Ask questions if any requirements are unclear.
