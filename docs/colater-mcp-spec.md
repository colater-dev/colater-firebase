# Colater MCP Server - Technical Specification

**Product**: Brand Intelligence Layer for AI Workflows
**Version**: 1.0.0
**Protocol**: Model Context Protocol (MCP)
**Target**: Claude Desktop, Cursor, Cline, and other MCP-compatible clients

---

## Executive Summary

The Colater MCP Server exposes brand intelligence as a set of tools and resources that AI agents can query in real-time. This enables any AI workflow to maintain brand consistency, access brand assets, and generate on-brand content automatically.

**Core Value**: Turn Colater from a web app into an **AI-native brand intelligence layer** that powers all creative and marketing workflows.

---

## Architecture Overview

### High-Level Design

```
┌─────────────────┐
│   AI Client     │  (Claude Desktop, Cursor, etc.)
│   (MCP Client)  │
└────────┬────────┘
         │ MCP Protocol (stdio/SSE)
         │
┌────────▼────────┐
│  Colater MCP    │
│     Server      │
├─────────────────┤
│ Tools           │  → brand-context, logo-analysis, voice-check
│ Resources       │  → brands/{id}, logos/{id}, guidelines
│ Prompts         │  → brand-context-injection
└────────┬────────┘
         │ REST API / Firebase SDK
         │
┌────────▼────────┐
│ Colater Backend │
│ (Firebase +     │
│  Next.js API)   │
└─────────────────┘
```

### Technology Stack

**MCP Server**:
- **Runtime**: Node.js 20+ (TypeScript 5+)
- **Protocol**: `@modelcontextprotocol/sdk` (official MCP SDK)
- **Transport**: stdio (standard input/output)
- **Auth**: API key + Firebase Auth tokens

**Backend Integration**:
- **Database**: Firebase Firestore (existing)
- **Storage**: Cloudflare R2 (existing)
- **API**: Next.js API routes + Firebase Admin SDK
- **AI**: Existing Genkit flows

**Distribution**:
- **Package**: npm package `@colater/mcp-server`
- **Installation**: `npx @colater/mcp-server`
- **Config**: JSON config file with API keys

---

## Installation & Setup

### 1. Install MCP Server

```bash
# Via npx (recommended - always latest)
npx @colater/mcp-server init

# Or install globally
npm install -g @colater/mcp-server
colater-mcp init
```

### 2. Configuration

**Create `~/.colater/config.json`**:
```json
{
  "apiKey": "colater_sk_...",
  "apiEndpoint": "https://colater.ai/api/mcp",
  "defaultBrandId": "abc123",
  "cache": {
    "enabled": true,
    "ttl": 300
  }
}
```

### 3. MCP Client Configuration

**Claude Desktop** (`claude_desktop_config.json`):
```json
{
  "mcpServers": {
    "colater": {
      "command": "npx",
      "args": ["-y", "@colater/mcp-server"],
      "env": {
        "COLATER_API_KEY": "colater_sk_..."
      }
    }
  }
}
```

**Cursor** (`.cursor/mcp-config.json`):
```json
{
  "mcpServers": {
    "colater": {
      "command": "colater-mcp",
      "args": ["start"],
      "env": {
        "COLATER_API_KEY": "colater_sk_..."
      }
    }
  }
}
```

### 4. Authentication Flow

1. User visits `https://colater.ai/settings/api-keys`
2. Clicks "Create MCP API Key"
3. Key is generated: `colater_sk_live_...`
4. User copies key to MCP config
5. MCP server validates key on first request

**API Key Structure**:
```
colater_sk_[environment]_[random32chars]

Examples:
- colater_sk_live_a1b2c3d4e5f6...  (production)
- colater_sk_test_x9y8z7w6v5u4...  (testing)
```

**Permissions**:
- Read-only by default
- Optional: Write permissions for asset generation
- Scoped to specific brands (or all brands for user)

---

## MCP Tools

### Tool 1: `get_brand_context`

**Description**: Retrieve complete brand context including identity, voice, and visual guidelines.

**Input Schema**:
```typescript
{
  "brandId": string;           // Optional, uses default if not provided
  "sections"?: string[];       // Optional filter: ["identity", "voice", "visual", "positioning"]
  "includeAssets"?: boolean;   // Include logo URLs, mockups, etc. (default: true)
}
```

**Output Schema**:
```typescript
{
  "brand": {
    "id": string;
    "name": string;
    "tagline": string;
    "elevatorPitch": string;
    "targetAudience": string;
    "createdAt": string;
    "lastUpdated": string;
  },
  "identity": {
    "positioning": {
      "challenge": string;      // Market problem brand solves
      "solution": string;       // Brand's unique approach
      "keyAttributes": string[];// 3-5 brand attributes
    }
  },
  "voice": {
    "tone": string[];           // e.g., ["professional", "approachable", "energetic"]
    "preferWords": string[];    // Encouraged vocabulary
    "avoidWords": string[];     // Discouraged words/phrases
    "examples": {
      "formal": string;         // Example formal communication
      "casual": string;         // Example casual communication
    }
  },
  "visual": {
    "logos": {
      "primary": string;        // URL to primary logo
      "icon": string;           // URL to icon/mark
      "wordmark": string;       // URL to text-only version
      "variations": Array<{
        "id": string;
        "url": string;
        "type": "color" | "bw" | "inverted";
      }>;
    },
    "colors": {
      "palette": Array<{
        "hex": string;
        "name": string;
        "usage": string;        // "Primary CTA buttons, headlines"
      }>;
      "philosophy": string;     // Color strategy explanation
    },
    "typography": {
      "primary": {
        "name": string;         // "Jost"
        "weights": number[];    // [400, 600, 700]
        "usage": string;        // "Headlines, UI elements"
      },
      "pairings": string[];     // Recommended font combinations
    }
  }
}
```

**Usage Example**:
```typescript
// In Claude Desktop
const context = await use_mcp_tool("colater", "get_brand_context", {
  brandId: "techflow_brand_123"
});

// AI now knows:
// - Brand name: TechFlow
// - Voice: approachable, energetic
// - Colors: Ember Orange (#FF6B35)
// - Avoid: corporate jargon
```

---

### Tool 2: `validate_brand_voice`

**Description**: Check if text matches brand voice and get rewrite suggestions.

**Input Schema**:
```typescript
{
  "brandId"?: string;
  "text": string;              // Text to validate (max 5000 chars)
  "context"?: string;          // e.g., "email", "social_post", "blog"
  "strictness"?: number;       // 0-1, how strict validation should be (default: 0.7)
}
```

**Output Schema**:
```typescript
{
  "score": number;             // 0-1, overall brand voice match
  "onBrand": boolean;          // Quick yes/no
  "analysis": {
    "toneMatch": number;       // 0-1, tone alignment
    "vocabularyMatch": number; // 0-1, word choice alignment
    "structureMatch": number;  // 0-1, sentence structure alignment
  },
  "issues": Array<{
    "type": "avoid_word" | "off_tone" | "jargon" | "complexity";
    "text": string;            // Problematic text
    "reason": string;          // Why it's off-brand
    "suggestion": string;      // Better alternative
    "severity": "low" | "medium" | "high";
  }>,
  "rewrite"?: string;          // AI-generated on-brand version
  "highlights": {
    "good": string[];          // On-brand phrases to keep
    "bad": string[];           // Off-brand phrases to change
  }
}
```

**Usage Example**:
```typescript
// Validate email copy
const result = await use_mcp_tool("colater", "validate_brand_voice", {
  brandId: "techflow_brand_123",
  text: "Leverage our synergistic enterprise solutions...",
  context: "email"
});

// Returns:
// score: 0.35
// issues: [
//   { text: "leverage", reason: "Corporate jargon", suggestion: "use" },
//   { text: "synergistic", reason: "Conflicts with 'approachable'", suggestion: "collaborative" }
// ]
// rewrite: "Use our collaborative tools to streamline your workflow..."
```

---

### Tool 3: `generate_branded_content`

**Description**: Generate text content that matches brand voice.

**Input Schema**:
```typescript
{
  "brandId"?: string;
  "contentType": "tagline" | "social_post" | "email" | "blog_intro" | "product_description";
  "prompt": string;            // What to write about
  "tone"?: "formal" | "casual" | "auto"; // Override brand tone (default: auto)
  "length"?: "short" | "medium" | "long"; // Target length
  "platform"?: string;         // "twitter", "linkedin", "instagram", etc.
}
```

**Output Schema**:
```typescript
{
  "content": string;           // Generated content
  "metadata": {
    "wordCount": number;
    "characterCount": number;
    "readingLevel": string;    // "grade 8", "grade 10", etc.
    "toneUsed": string;        // Actual tone applied
  },
  "brandVoiceScore": number;   // Self-assessed brand match (0-1)
  "variations"?: string[];     // Alternative versions (optional)
}
```

**Usage Example**:
```typescript
const content = await use_mcp_tool("colater", "generate_branded_content", {
  brandId: "techflow_brand_123",
  contentType: "social_post",
  prompt: "Announce new real-time collaboration feature",
  platform: "twitter",
  length: "short"
});

// Returns:
// content: "🎨 New in TechFlow: Real-time design feedback!\n\n
//          Now your whole team can comment directly on mockups.
//          No more screenshot → Slack → confusion loops.\n\n
//          Try it free: techflow.com/collaboration"
```

---

### Tool 4: `get_brand_assets`

**Description**: Retrieve brand assets (logos, colors, fonts) in various formats.

**Input Schema**:
```typescript
{
  "brandId"?: string;
  "assetTypes": Array<"logo" | "colors" | "fonts" | "mockups">;
  "format"?: {
    "logo": "url" | "svg" | "png" | "data_uri";
    "colors": "hex" | "rgb" | "hsl" | "tailwind" | "css" | "figma";
    "fonts": "names" | "google_fonts_url" | "css_imports";
  };
}
```

**Output Schema**:
```typescript
{
  "logos": {
    "primary": {
      "url": string;
      "svg"?: string;          // If requested
      "dataUri"?: string;      // If requested
      "dimensions": { width: number; height: number; };
    },
    "variations": Array<{
      "id": string;
      "type": "color" | "bw" | "inverted";
      "url": string;
    }>;
  },
  "colors": {
    "hex": string[];           // ["#FF6B35", "#F7F7F7"]
    "rgb": Array<{ r: number; g: number; b: number; }>;
    "tailwind"?: object;       // Tailwind config format
    "css"?: string;            // :root CSS variables
    "figma"?: object;          // Figma color tokens
    "usage": Array<{
      "color": string;
      "name": string;
      "usage": string;
    }>;
  },
  "fonts": {
    "primary": {
      "name": string;
      "weights": number[];
      "googleFontsUrl"?: string;
      "cssImport"?: string;
    },
    "fallbacks": string[];
  }
}
```

**Usage Example**:
```typescript
// Get colors in Tailwind format
const assets = await use_mcp_tool("colater", "get_brand_assets", {
  brandId: "techflow_brand_123",
  assetTypes: ["colors"],
  format: {
    colors: "tailwind"
  }
});

// Returns:
// {
//   colors: {
//     tailwind: {
//       "brand-primary": "#FF6B35",
//       "brand-neutral": "#F7F7F7",
//       "brand-accent": "#2C3E50"
//     }
//   }
// }
```

---

### Tool 5: `analyze_logo`

**Description**: Get AI analysis of a logo's design, style, and effectiveness.

**Input Schema**:
```typescript
{
  "brandId"?: string;
  "logoId"?: string;           // Specific logo, or uses primary
  "analysisType"?: "design" | "sentiment" | "technical" | "competitive" | "all";
}
```

**Output Schema**:
```typescript
{
  "design": {
    "style": string[];         // ["minimalist", "geometric", "modern"]
    "elements": string[];      // ["abstract shape", "negative space"]
    "complexity": "simple" | "moderate" | "complex";
    "memorability": number;    // 0-1 score
  },
  "sentiment": {
    "emotions": string[];      // ["trustworthy", "professional", "energetic"]
    "industry_fit": number;    // 0-1, how well it fits the industry
    "target_appeal": number;   // 0-1, appeal to target audience
  },
  "technical": {
    "scalability": number;     // 0-1, works at small sizes
    "versatility": number;     // 0-1, works in multiple contexts
    "colorUsage": string;      // "monochrome", "two-tone", "full-color"
    "fileSize": number;        // bytes
    "dimensions": { width: number; height: number; };
  },
  "critique": {
    "strengths": string[];     // ["memorable shape", "unique"]
    "considerations": string[];// ["may need more contrast"]
    "suggestions": string[];   // ["consider adding color version"]
  },
  "competitive": {
    "uniqueness": number;      // 0-1, how unique vs competitors
    "trends": string[];        // Current design trends used
  }
}
```

---

### Tool 6: `check_brand_consistency`

**Description**: Audit content/assets for brand guideline compliance.

**Input Schema**:
```typescript
{
  "brandId"?: string;
  "artifacts": Array<{
    "type": "url" | "text" | "image" | "document";
    "content": string;         // URL, text content, or image URL
    "name"?: string;           // Optional label
  }>;
  "checks"?: string[];         // Optional: ["colors", "fonts", "voice", "logo_usage"]
}
```

**Output Schema**:
```typescript
{
  "overallScore": number;      // 0-1, overall compliance
  "findings": Array<{
    "artifact": string;        // Which artifact
    "check": string;           // What was checked
    "status": "pass" | "warning" | "fail";
    "severity": "low" | "medium" | "high";
    "issue": string;           // What's wrong
    "location"?: string;       // Where in artifact
    "recommendation": string;  // How to fix
  }>,
  "summary": {
    "passed": number;
    "warnings": number;
    "failures": number;
  }
}
```

**Usage Example**:
```typescript
const audit = await use_mcp_tool("colater", "check_brand_consistency", {
  brandId: "techflow_brand_123",
  artifacts: [
    { type: "url", content: "https://techflow.com", name: "Website" },
    { type: "image", content: "https://r2.../marketing-graphic.png", name: "Ad Banner" }
  ]
});

// Returns findings like:
// - Website: Using #FF7744 instead of brand primary #FF6B35 (medium severity)
// - Ad Banner: Font 'Arial' instead of brand font 'Jost' (high severity)
```

---

### Tool 7: `generate_asset`

**Description**: Generate branded visual assets (social graphics, mockups, etc.).

**Input Schema**:
```typescript
{
  "brandId"?: string;
  "assetType": "social_post" | "og_image" | "email_header" | "presentation_slide";
  "platform"?: "twitter" | "instagram" | "linkedin" | "facebook" | "generic";
  "content": {
    "headline": string;
    "description"?: string;
    "cta"?: string;           // Call-to-action text
  };
  "style"?: "minimal" | "bold" | "elegant" | "auto";
  "includeElements"?: {
    "logo": boolean;
    "brandColors": boolean;
    "mockup": string;         // e.g., "laptop", "phone", "business_card"
  };
}
```

**Output Schema**:
```typescript
{
  "assetUrl": string;          // Public URL to generated asset
  "dimensions": { width: number; height: number; };
  "format": "png" | "jpg" | "svg";
  "metadata": {
    "layout": string;          // "logo_left_text_right", etc.
    "colorsUsed": string[];    // HEX codes used
    "fontUsed": string;
    "generatedAt": string;
  },
  "variations"?: Array<{      // Alternative designs
    "url": string;
    "style": string;
  }>;
}
```

**Usage Example**:
```typescript
const asset = await use_mcp_tool("colater", "generate_asset", {
  brandId: "techflow_brand_123",
  assetType: "social_post",
  platform: "instagram",
  content: {
    headline: "New Feature: Real-time Collaboration",
    description: "Work together seamlessly",
    cta: "Try it Free"
  }
});

// Returns URL to generated 1080x1080 Instagram post with:
// - TechFlow logo
// - Ember Orange accents
// - Jost font for headline
// - Brand-consistent design
```

---

### Tool 8: `list_brands`

**Description**: List all brands accessible to the authenticated user.

**Input Schema**:
```typescript
{
  "limit"?: number;            // Max results (default: 50)
  "offset"?: number;           // Pagination offset
  "sortBy"?: "name" | "created" | "updated";
  "filter"?: {
    "search"?: string;         // Search by name
    "hasLogo"?: boolean;       // Only brands with logos
  };
}
```

**Output Schema**:
```typescript
{
  "brands": Array<{
    "id": string;
    "name": string;
    "tagline": string;
    "thumbnailUrl": string;    // Logo thumbnail
    "createdAt": string;
    "lastUpdated": string;
    "stats": {
      "logoCount": number;
      "taglineCount": number;
      "hasGuidelines": boolean;
    };
  }>,
  "pagination": {
    "total": number;
    "limit": number;
    "offset": number;
    "hasMore": boolean;
  }
}
```

---

## MCP Resources

Resources provide read-only access to brand data via URI patterns.

### Resource 1: `colater://brands/{brandId}`

**Description**: Full brand profile (same as `get_brand_context` tool).

**URI Pattern**: `colater://brands/{brandId}`

**MIME Type**: `application/json`

---

### Resource 2: `colater://brands/{brandId}/logos`

**Description**: All logo variations for a brand.

**URI Pattern**: `colater://brands/{brandId}/logos`

**Output**:
```typescript
{
  "logos": Array<{
    "id": string;
    "url": string;
    "type": "primary" | "icon" | "wordmark";
    "variant": "color" | "bw" | "inverted";
    "dimensions": { width: number; height: number; };
    "createdAt": string;
  }>
}
```

---

### Resource 3: `colater://brands/{brandId}/colors`

**Description**: Color palette in various formats.

**URI Pattern**: `colater://brands/{brandId}/colors?format={format}`

**Query Parameters**:
- `format`: `hex`, `rgb`, `hsl`, `tailwind`, `css`, `figma`

**Output**: Format-specific color definitions

---

### Resource 4: `colater://brands/{brandId}/guidelines`

**Description**: Auto-generated brand guidelines PDF.

**URI Pattern**: `colater://brands/{brandId}/guidelines`

**MIME Type**: `application/pdf`

---

## MCP Prompts

Prompts allow dynamic injection of brand context into AI conversations.

### Prompt 1: `brand_context_system_prompt`

**Description**: System prompt that injects brand context at the start of conversations.

**Arguments**:
```typescript
{
  "brandId": string;
  "detail": "minimal" | "standard" | "detailed"; // Context depth
}
```

**Generated Prompt**:
```
You are working with the brand "{brand_name}".

Brand Context:
- Tagline: {tagline}
- Target Audience: {audience}
- Voice: {tone_adjectives}
- Key Attributes: {attributes}

Brand Colors:
- Primary: {primary_color} ({color_name}) - Use for {usage}
- Neutral: {neutral_color} ({color_name}) - Use for {usage}

Brand Voice Guidelines:
- DO use: {prefer_words}
- AVOID: {avoid_words}
- Tone: {tone_description}

When generating content:
1. Maintain the {tone} tone
2. Use brand vocabulary naturally
3. Reference brand positioning when relevant
4. Ensure visual descriptions use brand colors
```

**Usage**:
```typescript
// AI client automatically injects this at conversation start
// when Colater MCP is active
```

---

## API Implementation

### Backend API Routes

**Base URL**: `https://colater.ai/api/mcp`

#### `POST /api/mcp/auth`
Validate API key and return user context.

**Request**:
```json
{
  "apiKey": "colater_sk_live_..."
}
```

**Response**:
```json
{
  "valid": true,
  "userId": "user_123",
  "defaultBrandId": "brand_456",
  "permissions": ["read", "write"],
  "expiresAt": "2025-12-31T23:59:59Z"
}
```

---

#### `POST /api/mcp/brands/context`
Get brand context (implements `get_brand_context` tool).

**Request**:
```json
{
  "brandId": "brand_123",
  "sections": ["identity", "voice", "visual"],
  "includeAssets": true
}
```

**Response**: See `get_brand_context` output schema

---

#### `POST /api/mcp/voice/validate`
Validate brand voice (implements `validate_brand_voice` tool).

**Request**:
```json
{
  "brandId": "brand_123",
  "text": "Leverage our synergistic...",
  "context": "email",
  "strictness": 0.7
}
```

**Response**: See `validate_brand_voice` output schema

---

#### `POST /api/mcp/content/generate`
Generate branded content (implements `generate_branded_content` tool).

**Request**:
```json
{
  "brandId": "brand_123",
  "contentType": "social_post",
  "prompt": "Announce new feature",
  "platform": "twitter"
}
```

**Response**: See `generate_branded_content` output schema

---

#### `POST /api/mcp/assets/generate`
Generate visual assets (implements `generate_asset` tool).

**Request**:
```json
{
  "brandId": "brand_123",
  "assetType": "social_post",
  "platform": "instagram",
  "content": {
    "headline": "New Feature",
    "description": "Work together seamlessly"
  }
}
```

**Response**: See `generate_asset` output schema

---

## MCP Server Implementation

### Project Structure

```
colater-mcp/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts                 # Main entry point
│   ├── server.ts                # MCP server setup
│   ├── config.ts                # Configuration management
│   ├── auth.ts                  # API key validation
│   ├── cache.ts                 # Local caching layer
│   ├── tools/
│   │   ├── brand-context.ts     # get_brand_context
│   │   ├── voice-validate.ts    # validate_brand_voice
│   │   ├── content-generate.ts  # generate_branded_content
│   │   ├── assets-get.ts        # get_brand_assets
│   │   ├── logo-analyze.ts      # analyze_logo
│   │   ├── consistency-check.ts # check_brand_consistency
│   │   ├── asset-generate.ts    # generate_asset
│   │   ├── brands-list.ts       # list_brands
│   │   └── index.ts
│   ├── resources/
│   │   ├── brands.ts            # Brand resources
│   │   ├── logos.ts             # Logo resources
│   │   ├── colors.ts            # Color resources
│   │   ├── guidelines.ts        # Guidelines resources
│   │   └── index.ts
│   ├── prompts/
│   │   ├── brand-context.ts     # Brand context injection
│   │   └── index.ts
│   ├── api/
│   │   ├── client.ts            # HTTP client for Colater API
│   │   └── types.ts             # API types
│   └── utils/
│       ├── logger.ts
│       ├── errors.ts
│       └── validators.ts
├── cli/
│   ├── init.ts                  # Setup wizard
│   └── test.ts                  # Test connection
└── README.md
```

### Core Implementation

**`src/index.ts`**:
```typescript
#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { loadConfig } from './config.js';
import { registerTools } from './tools/index.js';
import { registerResources } from './resources/index.js';
import { registerPrompts } from './prompts/index.js';
import { logger } from './utils/logger.js';

async function main() {
  const config = await loadConfig();

  const server = new Server(
    {
      name: 'colater-mcp',
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {},
        resources: {},
        prompts: {},
      },
    }
  );

  // Register all tools
  registerTools(server, config);

  // Register all resources
  registerResources(server, config);

  // Register all prompts
  registerPrompts(server, config);

  // Error handling
  server.onerror = (error) => {
    logger.error('Server error:', error);
  };

  // Start server with stdio transport
  const transport = new StdioServerTransport();
  await server.connect(transport);

  logger.info('Colater MCP Server started');
}

main().catch((error) => {
  logger.error('Fatal error:', error);
  process.exit(1);
});
```

---

**`src/tools/brand-context.ts`**:
```typescript
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { z } from 'zod';
import { ColaterAPIClient } from '../api/client.js';
import { withCache } from '../cache.js';

const BrandContextInputSchema = z.object({
  brandId: z.string().optional(),
  sections: z.array(z.enum(['identity', 'voice', 'visual', 'positioning'])).optional(),
  includeAssets: z.boolean().optional().default(true),
});

export function registerBrandContextTool(
  server: Server,
  apiClient: ColaterAPIClient
) {
  server.setRequestHandler('tools/call', async (request) => {
    if (request.params.name !== 'get_brand_context') {
      return;
    }

    const input = BrandContextInputSchema.parse(request.params.arguments);

    // Use cache with 5-minute TTL
    const result = await withCache(
      `brand_context_${input.brandId}`,
      async () => {
        return await apiClient.getBrandContext(input);
      },
      300 // 5 minutes
    );

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  });
}
```

---

**`src/api/client.ts`**:
```typescript
import axios, { AxiosInstance } from 'axios';
import { logger } from '../utils/logger.js';

export class ColaterAPIClient {
  private client: AxiosInstance;

  constructor(apiKey: string, baseURL: string = 'https://colater.ai/api/mcp') {
    this.client = axios.create({
      baseURL,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });

    // Request logging
    this.client.interceptors.request.use((config) => {
      logger.debug(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
      return config;
    });

    // Error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response) {
          logger.error(`API Error: ${error.response.status} ${error.response.statusText}`);
          throw new Error(`API Error: ${error.response.data.message || error.message}`);
        } else if (error.request) {
          logger.error('API Error: No response received');
          throw new Error('Network error: Could not reach Colater API');
        } else {
          logger.error(`API Error: ${error.message}`);
          throw error;
        }
      }
    );
  }

  async getBrandContext(input: any) {
    const response = await this.client.post('/brands/context', input);
    return response.data;
  }

  async validateBrandVoice(input: any) {
    const response = await this.client.post('/voice/validate', input);
    return response.data;
  }

  async generateBrandedContent(input: any) {
    const response = await this.client.post('/content/generate', input);
    return response.data;
  }

  async getBrandAssets(input: any) {
    const response = await this.client.post('/assets/get', input);
    return response.data;
  }

  async analyzeLogo(input: any) {
    const response = await this.client.post('/logo/analyze', input);
    return response.data;
  }

  async checkConsistency(input: any) {
    const response = await this.client.post('/consistency/check', input);
    return response.data;
  }

  async generateAsset(input: any) {
    const response = await this.client.post('/assets/generate', input);
    return response.data;
  }

  async listBrands(input: any) {
    const response = await this.client.post('/brands/list', input);
    return response.data;
  }
}
```

---

**`src/cache.ts`**:
```typescript
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

const CACHE_DIR = path.join(os.homedir(), '.colater', 'cache');

interface CacheEntry {
  value: any;
  expiresAt: number;
}

async function ensureCacheDir() {
  await fs.mkdir(CACHE_DIR, { recursive: true });
}

async function getCacheFile(key: string): Promise<string> {
  return path.join(CACHE_DIR, `${key}.json`);
}

export async function getCache(key: string): Promise<any | null> {
  await ensureCacheDir();
  const file = await getCacheFile(key);

  try {
    const data = await fs.readFile(file, 'utf-8');
    const entry: CacheEntry = JSON.parse(data);

    if (Date.now() > entry.expiresAt) {
      await fs.unlink(file);
      return null;
    }

    return entry.value;
  } catch (error) {
    return null;
  }
}

export async function setCache(key: string, value: any, ttl: number): Promise<void> {
  await ensureCacheDir();
  const file = await getCacheFile(key);

  const entry: CacheEntry = {
    value,
    expiresAt: Date.now() + (ttl * 1000),
  };

  await fs.writeFile(file, JSON.stringify(entry), 'utf-8');
}

export async function withCache<T>(
  key: string,
  fn: () => Promise<T>,
  ttl: number
): Promise<T> {
  const cached = await getCache(key);
  if (cached !== null) {
    return cached;
  }

  const value = await fn();
  await setCache(key, value, ttl);
  return value;
}
```

---

**`cli/init.ts`**:
```typescript
import inquirer from 'inquirer';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import chalk from 'chalk';

interface InitAnswers {
  apiKey: string;
  defaultBrandId?: string;
  enableCache: boolean;
}

export async function init() {
  console.log(chalk.bold.blue('\n🎨 Colater MCP Server Setup\n'));

  const answers = await inquirer.prompt<InitAnswers>([
    {
      type: 'input',
      name: 'apiKey',
      message: 'Enter your Colater API key:',
      validate: (input) => {
        if (!input.startsWith('colater_sk_')) {
          return 'API key must start with "colater_sk_"';
        }
        return true;
      },
    },
    {
      type: 'input',
      name: 'defaultBrandId',
      message: 'Enter default brand ID (optional):',
    },
    {
      type: 'confirm',
      name: 'enableCache',
      message: 'Enable local caching?',
      default: true,
    },
  ]);

  const config = {
    apiKey: answers.apiKey,
    apiEndpoint: 'https://colater.ai/api/mcp',
    ...(answers.defaultBrandId && { defaultBrandId: answers.defaultBrandId }),
    cache: {
      enabled: answers.enableCache,
      ttl: 300,
    },
  };

  const configDir = path.join(os.homedir(), '.colater');
  const configFile = path.join(configDir, 'config.json');

  await fs.mkdir(configDir, { recursive: true });
  await fs.writeFile(configFile, JSON.stringify(config, null, 2));

  console.log(chalk.green('\n✓ Configuration saved!'));
  console.log(chalk.gray(`  Location: ${configFile}\n`));

  console.log(chalk.bold('Next steps:'));
  console.log('1. Add Colater MCP to your MCP client config');
  console.log('2. Test with: ' + chalk.cyan('colater-mcp test\n'));
}
```

---

## Package Configuration

**`package.json`**:
```json
{
  "name": "@colater/mcp-server",
  "version": "1.0.0",
  "description": "Brand intelligence layer for AI workflows",
  "type": "module",
  "main": "dist/index.js",
  "bin": {
    "colater-mcp": "dist/index.js"
  },
  "scripts": {
    "build": "tsc",
    "dev": "tsx watch src/index.ts",
    "test": "vitest",
    "prepublishOnly": "npm run build"
  },
  "keywords": [
    "mcp",
    "brand",
    "ai",
    "design",
    "marketing"
  ],
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.0.0",
    "axios": "^1.6.0",
    "zod": "^3.24.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "typescript": "^5.3.0",
    "tsx": "^4.7.0",
    "vitest": "^1.0.0",
    "inquirer": "^9.2.0",
    "chalk": "^5.3.0"
  }
}
```

---

## Error Handling

### Error Codes

```typescript
enum ColaterMCPError {
  // Authentication
  INVALID_API_KEY = 'INVALID_API_KEY',
  EXPIRED_API_KEY = 'EXPIRED_API_KEY',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',

  // Brand
  BRAND_NOT_FOUND = 'BRAND_NOT_FOUND',
  BRAND_ACCESS_DENIED = 'BRAND_ACCESS_DENIED',

  // Validation
  INVALID_INPUT = 'INVALID_INPUT',
  TEXT_TOO_LONG = 'TEXT_TOO_LONG',

  // API
  API_ERROR = 'API_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',

  // Generation
  GENERATION_FAILED = 'GENERATION_FAILED',
  ASSET_GENERATION_TIMEOUT = 'ASSET_GENERATION_TIMEOUT',
}
```

### Error Response Format

```typescript
{
  "error": {
    "code": "BRAND_NOT_FOUND",
    "message": "Brand with ID 'xyz' not found",
    "details": {
      "brandId": "xyz",
      "userId": "user_123"
    },
    "retryable": false,
    "documentation": "https://docs.colater.ai/mcp/errors#BRAND_NOT_FOUND"
  }
}
```

---

## Rate Limiting

### Limits by Plan

**Free Tier**:
- 100 requests/hour
- 1,000 requests/day
- No asset generation

**Pro Tier**:
- 1,000 requests/hour
- 10,000 requests/day
- 50 asset generations/day

**Team Tier**:
- 5,000 requests/hour
- 50,000 requests/day
- 500 asset generations/day

### Rate Limit Headers

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 742
X-RateLimit-Reset: 1704067200
```

---

## Security

### API Key Management

**Generation**:
- Keys generated with cryptographically secure random
- 256-bit entropy minimum
- Never logged or stored in plaintext

**Storage**:
- Hashed with bcrypt (cost factor: 12)
- Only first 8 characters visible in UI
- Can be revoked instantly

**Rotation**:
- Automatic rotation every 90 days (optional)
- Email notification before expiry
- Grace period for transition

### Permissions

**Read-Only** (default):
- `brand:read` - Get brand context
- `logo:read` - Analyze logos
- `voice:validate` - Validate text

**Write** (requires explicit grant):
- `content:generate` - Generate text content
- `asset:generate` - Generate visual assets
- `brand:update` - Modify brand data (future)

### Data Privacy

- Brand data never leaves Colater servers (except as API responses)
- No training on user brand data
- AI generations are ephemeral (not stored unless explicitly saved)
- Audit logs for all API access

---

## Testing

### Manual Testing

```bash
# Test connection
colater-mcp test

# Test specific tool
colater-mcp test --tool get_brand_context --brand abc123
```

### Integration Tests

```typescript
// tests/tools/brand-context.test.ts
import { describe, it, expect } from 'vitest';
import { ColaterAPIClient } from '../src/api/client';

describe('get_brand_context', () => {
  it('should return brand context', async () => {
    const client = new ColaterAPIClient(process.env.TEST_API_KEY!);

    const result = await client.getBrandContext({
      brandId: 'test_brand_123',
    });

    expect(result.brand).toBeDefined();
    expect(result.brand.name).toBe('Test Brand');
    expect(result.visual.colors.palette).toHaveLength(3);
  });

  it('should handle invalid brand ID', async () => {
    const client = new ColaterAPIClient(process.env.TEST_API_KEY!);

    await expect(
      client.getBrandContext({ brandId: 'invalid' })
    ).rejects.toThrow('BRAND_NOT_FOUND');
  });
});
```

---

## Deployment

### NPM Package

```bash
# Build
npm run build

# Publish
npm publish --access public
```

### GitHub Actions CI/CD

```yaml
name: Publish

on:
  push:
    tags:
      - 'v*'

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
          registry-url: 'https://registry.npmjs.org'
      - run: npm ci
      - run: npm run build
      - run: npm test
      - run: npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

---

## Documentation

### User Guide

**Location**: `https://docs.colater.ai/mcp`

**Sections**:
1. Getting Started
   - Installation
   - Configuration
   - First tool call
2. Tools Reference
   - Complete tool documentation
   - Code examples
3. Resources Reference
   - URI patterns
   - Output schemas
4. Recipes
   - Common workflows
   - Integration examples
5. Troubleshooting
   - Error codes
   - FAQ

### API Reference

**Location**: `https://docs.colater.ai/mcp/api`

Auto-generated from OpenAPI spec.

---

## Roadmap

### Phase 1: MVP (Weeks 1-4)
- ✅ Tool: `get_brand_context`
- ✅ Tool: `validate_brand_voice`
- ✅ Tool: `get_brand_assets`
- ✅ Resource: `colater://brands/{id}`
- ✅ Prompt: `brand_context_system_prompt`
- ✅ CLI: Setup wizard
- ✅ Documentation: User guide

### Phase 2: Content Generation (Weeks 5-6)
- Tool: `generate_branded_content`
- Enhanced voice validation with AI rewrite
- Support for multiple content types
- Template library

### Phase 3: Asset Generation (Weeks 7-8)
- Tool: `generate_asset`
- Social media graphics
- OG images
- Email headers
- Mockup integrations

### Phase 4: Advanced Features (Weeks 9-12)
- Tool: `analyze_logo`
- Tool: `check_brand_consistency`
- Multi-brand management
- Competitive analysis
- Brand evolution tracking

### Phase 5: Enterprise (Post-Launch)
- Team collaboration
- Audit logs
- Webhook notifications
- Custom integrations
- Dedicated support

---

## Success Metrics

### Adoption
- 1,000+ MCP server installs (Month 1)
- 100+ daily active users (Month 3)
- 50+ paying customers (Month 6)

### Engagement
- Average 10+ tool calls per user per week
- 70%+ of users configure default brand
- 40%+ use asset generation tools

### Satisfaction
- NPS: 50+
- 5-star reviews: 4.5+
- Customer retention: 85%+

### Revenue
- $5k MRR (Month 3)
- $25k MRR (Month 6)
- $100k MRR (Month 12)

---

## Open Questions

1. **Pricing Model**:
   - Free for read-only tools?
   - Per-generation pricing for assets?
   - Subscription tiers?

2. **Caching Strategy**:
   - How long to cache brand context?
   - Client-side vs server-side cache?
   - Cache invalidation on brand updates?

3. **Multi-User Teams**:
   - Shared API keys?
   - Role-based permissions?
   - Usage attribution?

4. **Offline Mode**:
   - Cache brand context locally for offline use?
   - Graceful degradation when API is down?

5. **Custom Integrations**:
   - Allow users to write custom MCP tools?
   - Plugin system for extending functionality?

---

Ready to build! 🚀

Let me know which phase you'd like to prioritize, or if you want me to create implementation tasks for Phase 1 (MVP) that can be assigned to Gemini Flash.
