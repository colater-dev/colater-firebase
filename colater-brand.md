# Colater Brand Guide

> **AI-powered brand identity design platform**

---

## Table of Contents

1. [Brand Overview](#brand-overview)
2. [Visual Identity](#visual-identity)
3. [Voice & Messaging](#voice--messaging)
4. [Design Principles](#design-principles)
5. [Typography System](#typography-system)
6. [Brand Assets](#brand-assets)

---

## Brand Overview

### Mission

Colater empowers creators, founders, and teams to build professional brand identities through AI-guided design. We make brand clarity accessible to everyone, eliminating the gap between vision and visual execution.

### Core Value Proposition

**Clarify. Generate. Consistency.**

Three pillars that define the Colater experience:

1. **Clarify Your Position** - Define brand strategy, target audience, and unique value proposition with AI guidance
2. **Generate Visual Assets** - Create logos, color palettes, presentations, and mockups that reflect brand identity
3. **Stay Consistent** - Maintain brand consistency across web, apps, and all customer touchpoints automatically

### Positioning

Colater sits at the intersection of:
- **Brand Strategy** - Helping users articulate their positioning
- **AI Generation** - Creating professional visual assets on demand
- **Brand Intelligence** - Acting as the brand layer for AI workflows via MCP integration

**Target Audience:**
- Solo founders building their first brand
- Small teams needing brand consistency
- Marketers working with AI tools (Claude, Cursor)
- Developers integrating brand assets into products

---

## Visual Identity

### Logo System

**Primary Logos:**
- `colater.png` - Black wordmark (primary)
- `.idx/icon.png` - Gradient icon (orange to magenta)

**Usage Guidelines:**
- Wordmark for light backgrounds
- Gradient icon for app favicon, profile images, and social media
- Maintain clear space: minimum 20px padding on all sides
- Minimum size: 120px width for wordmark, 32px for icon

### Color System

**Design Philosophy:** Minimalist grayscale foundation with subtle accent opportunities.

#### Light Mode
```css
--background: 0 0% 97.6%      /* Very light gray */
--foreground: 0 0% 0%          /* Pure black */
--primary: 0 0% 0%             /* Black */
--secondary: 0 0% 96%          /* Light gray */
--muted: 0 0% 96%              /* Light gray */
--border: 0 0% 89%             /* Medium-light gray */
--card: 0 0% 100%              /* White */
```

#### Dark Mode
```css
--background: 0 0% 9%          /* Very dark gray */
--foreground: 0 0% 100%        /* White */
--primary: 0 0% 100%           /* White */
--secondary: 0 0% 14%          /* Dark gray */
--muted: 0 0% 14%              /* Dark gray */
--border: 0 0% 20%             /* Medium-dark gray */
--card: 0 0% 9%                /* Very dark gray */
```

#### Accent Colors (User Brands)

When displaying user-generated brands, we use vibrant accent colors:

```typescript
// Example brand colors
{
  TechFlow: "#6366f1",    // Indigo
  CaféLuna: "#f59e0b",    // Amber
  FitLife: "#10b981"      // Emerald
}
```

**Color Extraction:** Brand colors are extracted from user logos using AI-powered palette generation.

---

## Voice & Messaging

### Headline

**Primary:**
> "Clarify your brand. Generate on-brand assets."

**Subheadline:**
> "Agentic AI that helps you define your positioning, create professional visual assets, and maintain brand consistency across every touchpoint."

### Secondary Messaging

**Professional Credibility:**
> "Look professional from day one. Attract investors and customers with a cohesive brand that communicates trust and expertise."

### Tone & Voice

- **Clear, not clever** - Direct communication over wordplay
- **Empowering, not prescriptive** - Guide users, don't dictate
- **Professional, not corporate** - Approachable expertise
- **Action-oriented** - Focus on what users can accomplish
- **Concise** - Respect the user's time

**Do:**
- "Generate your logo in seconds"
- "Define your brand positioning with AI"
- "Export assets in any format"

**Don't:**
- "Revolutionize your brand journey"
- "Unlock the power of AI-driven branding"
- "Transform your visual identity paradigm"

### Messaging Framework

| Audience | Pain Point | Colater Solution |
|----------|------------|------------------|
| Solo Founders | "I'm not a designer, but I need a professional brand" | AI-guided brand creation from scratch |
| Marketing Teams | "Our brand feels inconsistent across channels" | Centralized brand source of truth + MCP integration |
| Developers | "I need brand assets but don't want to bug designers" | API access to brand context and assets |

---

## Design Principles

### 1. Minimalism First

- **Whitespace is a feature** - Let content breathe
- **Grayscale foundation** - Reserve color for user brands
- **Typography hierarchy** - Clear visual structure without decoration

### 2. Infinite Canvas Thinking

Inspired by tools like Figma and Miro, Colater embraces:
- Non-linear workflows
- Spatial organization of ideas
- Freedom to explore without rigid steps

### 3. AI as Collaborator

- AI suggests, users decide
- Multiple options, not single outputs
- Iterative refinement encouraged
- Users maintain creative control

### 4. Professional Simplicity

- Clean interfaces over feature bloat
- Guided experiences for beginners
- Power features discoverable, not prominent
- Export-ready outputs, zero friction

---

## Typography System

### Primary Font

**Inter** (system default for UI)
- Clean, readable, modern
- Excellent at all sizes
- Open source, self-hosted

### Brand Fonts Library

Colater offers **28 curated Google Fonts** organized by personality:

#### Modern (11 fonts)
`Archivo`, `Cabin`, `Commissioner`, `Gabarito`, `Hepta Slab`, `Instrument Sans`, `Jost`, `Julius Sans One`, `Kodchasan`, `Lexend`, `Michroma`, `Saira`, `Tektur`

**Use for:** Tech startups, SaaS products, contemporary brands

#### Formal (5 fonts)
`Aboreto`, `BioRhyme Expanded`, `Faculty Glyphic`, `Fraunces`, `Instrument Serif`

**Use for:** Legal, finance, luxury, established brands

#### Stylish (4 fonts)
`Freeman`, `Genos`, `Jomhuria`, `Nixie One`

**Use for:** Fashion, creative agencies, bold statements

#### Rounded (1 font)
`Corben`

**Use for:** Friendly, approachable brands

#### Cute (3 fonts)
`Caprasimo`, `Rowdies`, `Tilt Warp`

**Use for:** Kids brands, playful products, casual services

### Typography Guidelines

**Hierarchy:**
```css
h1: 3.5rem (56px) - Hero headlines
h2: 2.5rem (40px) - Section headers
h3: 1.75rem (28px) - Card titles
body: 1rem (16px) - Default text
small: 0.875rem (14px) - Captions, metadata
```

**Font Weights:**
- Regular (400) - Body text
- Medium (500) - Emphasis
- Bold (700) - Headings
- Black (900) - Hero text

---

## Brand Assets

### Generative Capabilities

Users can generate:

1. **Logos** - Multiple variations with color extraction
2. **Taglines** - AI-generated positioning statements
3. **Color Palettes** - Extracted from logos, organized by usage
4. **Presentations** - 6-slide brand decks
5. **Mockups** - T-shirts, laptop stickers, business cards
6. **Social Assets** - Instagram stories, Twitter headers

### Presentation Structure

Standard 6-slide format:
1. **Cover** - Brand name + tagline
2. **Brand Concept** - Positioning and audience
3. **Logo Showcase** - Variations and usage
4. **Color Story** - Palette with hex codes
5. **Applications** - Mockups in context
6. **Social Assets** - Digital touchpoints

### Export Formats

All assets exportable in:
- **PNG** - High-resolution (2x, 3x)
- **SVG** - Vector logos
- **PDF** - Presentations and brand guidelines
- **JSON** - Structured brand data (for MCP, API)
- **CSS/Tailwind** - Color variables

---

## MCP Integration

**Position:** Brand intelligence layer for AI workflows

Colater acts as a **Model Context Protocol (MCP) server**, providing:

- `get_brand_context` - Retrieve identity, voice, visual guidelines
- `validate_brand_voice` - Check if text matches brand voice
- `get_brand_assets` - Logos, colors, fonts in multiple formats
- `list_brands` - Search and discover brands

**Use Case:**
> Marketing teams connect Colater to Claude Desktop. When writing emails, social posts, or documentation, Claude automatically knows the brand voice, colors, and visual assets to reference.

**Setup:**
```json
{
  "mcpServers": {
    "colater-brandname": {
      "command": "npx",
      "args": ["-y", "@colater/mcp-server"],
      "env": {
        "COLATER_API_KEY": "colater_sk_...",
        "COLATER_BRAND_ID": "brand_id"
      }
    }
  }
}
```

---

## Brand Data Structure

Every Colater brand includes:

```typescript
interface Brand {
  latestName: string;              // Brand name
  latestElevatorPitch: string;     // One-sentence description
  latestAudience: string;          // Target audience
  latestDesirableCues: string;     // Visual style (e.g., "minimalist, elegant")
  latestUndesirableCues: string;   // Anti-patterns (e.g., "complex, childish")
  primaryTagline: string;          // Main tagline
  logoUrl: string;                 // Primary logo
  font: string;                    // Selected font from library
}
```

---

## Examples in the Wild

### Example Brands (Demo Data)

```typescript
const exampleBrands = [
  {
    name: "TechFlow",
    pitch: "Project management for creative teams",
    color: "#6366f1"  // Indigo
  },
  {
    name: "Café Luna",
    pitch: "Late-night coffee and community",
    color: "#f59e0b"  // Amber
  },
  {
    name: "FitLife",
    pitch: "Personalized fitness coaching",
    color: "#10b981"  // Emerald
  }
];
```

---

## URLs & Resources

- **Main App:** https://colater.ai
- **Documentation:** https://docs.colater.ai
- **MCP Setup:** https://colater.ai/settings/api-keys
- **API Endpoint:** https://colater.ai/api/mcp

---

## Design Evolution Notes

### Original Concept (Blueprint)

Early designs explored:
- **Soft lavender** (#D1C4E9) for creativity and clarity
- **Muted teal** (#80CBC4) as accent
- **PT Sans** as primary font

**Decision:** Pivoted to grayscale-first approach to:
- Let user brands shine (not compete with platform colors)
- Emphasize professionalism and clarity
- Reduce visual noise in complex interfaces

### Current Direction

- **Grayscale foundation** - Timeless, professional, flexible
- **User brands provide color** - Platform adapts to user content
- **Typography-driven hierarchy** - Clear structure without decoration
- **Motion for delight** - Framer Motion animations add polish

---

## Maintenance & Updates

This brand guide is a living document. When making changes:

1. **Update this file first** - Ensure documentation reflects reality
2. **Update design tokens** - Sync `globals.css` with any color/spacing changes
3. **Update components** - Propagate changes to UI library
4. **Test dark mode** - Ensure all changes work in both themes
5. **Commit with context** - Explain "why" in commit messages

**Last Updated:** 2026-01-28
**Version:** 1.0
**Maintained by:** Colater Team

---

*Built with clarity. Designed for consistency. Powered by AI.*
