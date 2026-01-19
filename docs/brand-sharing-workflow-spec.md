# Brand Sharing Workflow - Specification

**Goal**: Enable brand owners to share brand-specific MCP servers with marketing and tech teams

---

## User Journey

### Phase 1: Brand Setup

**Option A: Import Existing Brand**
1. User clicks "Import Brand" on homepage
2. Uploads brand assets:
   - Logo file (PNG, SVG, JPG)
   - Brand guidelines PDF (optional)
   - Style guide JSON (optional - from Figma plugin)
3. AI extracts:
   - Brand colors from logo
   - Typography hints from guidelines
   - Voice characteristics from text
4. User reviews and edits AI-extracted info
5. Brand created

**Option B: Create from Scratch**
1. User clicks "Create Brand"
2. Goes through existing onboarding flow:
   - Name, elevator pitch, audience
   - Generate logo with AI
   - Generate taglines
   - Colorize logo
5. Brand created

### Phase 2: Get MCP Server

1. User navigates to **Brand Settings** → **Share** tab
2. Sees two sharing options:

   **A. Personal MCP Server** (for brand owner)
   - Full access: read + write + generate
   - Can modify brand identity
   - Button: "Get My MCP Config"

   **B. Team MCP Server** (for marketing/tech teams)
   - Read-only access to brand assets
   - Can validate brand voice
   - Cannot modify brand
   - Button: "Share with Team"

3. Click generates:
   - Brand-specific API key (`colater_sk_brand_{brandId}_...`)
   - Pre-configured MCP config JSON
   - Copy-paste instructions
   - Optional: Send via email/Slack

### Phase 3: Team Member Setup

1. Team member receives:
   - Link to setup page: `colater.ai/brand/{brandId}/setup`
   - Or: Pre-configured JSON to paste

2. Setup page shows:
   - Brand preview (logo, name, colors)
   - One-click MCP setup instructions
   - Download button for config file
   - Copy-paste config for manual setup

3. Team member:
   - Downloads `colater-brand-{brandName}.json`
   - Adds to Claude Desktop/Cursor
   - Restarts client
   - Ready to use!

---

## Technical Architecture

### Brand-Specific API Keys

```typescript
interface BrandAPIKey {
  id: string;
  userId: string;              // Owner
  brandId: string;             // Scoped to specific brand
  key: string;                 // Hashed: colater_sk_brand_{brandId}_{random}
  name: string;                // "Marketing Team Key"
  permissions: {
    read: boolean;             // Get brand context, assets
    validate: boolean;         // Validate brand voice
    generate: boolean;         // Generate content/assets
    modify: boolean;           // Modify brand identity
  };
  createdAt: Timestamp;
  expiresAt?: Timestamp;       // Optional expiration
  lastUsedAt?: Timestamp;
  usageCount: number;
  revokedAt?: Timestamp;
}
```

**Key Types**:
1. **Owner Key**: Full permissions
2. **Team Key**: Read + validate only
3. **Developer Key**: Read + generate (for CI/CD)

### Firestore Structure

```
/users/{userId}
  └── /brands/{brandId}
      ├── /apiKeys/{keyId}           # Brand-specific API keys
      │   ├── key (hashed)
      │   ├── permissions
      │   ├── usageCount
      │   └── ...
      └── /sharedWith/{email}        # Invited team members
          ├── role (viewer, editor)
          └── invitedAt
```

### MCP Server Config Generation

When user clicks "Get MCP Config", generate:

```json
{
  "mcpServers": {
    "colater-techflow": {
      "command": "npx",
      "args": ["-y", "@colater/mcp-server"],
      "env": {
        "COLATER_API_KEY": "colater_sk_brand_abc123_xyz789...",
        "COLATER_BRAND_ID": "abc123"
      }
    }
  }
}
```

**Benefits**:
- Brand ID baked into config
- Single brand per MCP instance
- Easy to share (copy/paste or download)
- No manual brand selection needed

---

## UI Components

### 1. Brand Settings → Share Tab

**Location**: `/brands/{brandId}/settings/share`

```
┌─────────────────────────────────────────────────────────┐
│ Share TechFlow Brand                                    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ 🔐 Your Personal Access                                │
│ ┌─────────────────────────────────────────────────┐   │
│ │ Full access to brand settings and AI generation │   │
│ │ [Get My MCP Config] [Copy]                      │   │
│ └─────────────────────────────────────────────────┘   │
│                                                         │
│ 👥 Team Access                                         │
│ ┌─────────────────────────────────────────────────┐   │
│ │ Share read-only access with your team           │   │
│ │ [Generate Team Link] [Copy Link]                │   │
│ │                                                  │   │
│ │ Active Team Keys:                                │   │
│ │ • Marketing Team (3 uses, created 2 days ago)   │   │
│ │   [Revoke]                                       │   │
│ │ • Engineering Team (47 uses, created 1 week ago)│   │
│ │   [Revoke]                                       │   │
│ └─────────────────────────────────────────────────┘   │
│                                                         │
│ 📧 Invite Team Members                                 │
│ ┌─────────────────────────────────────────────────┐   │
│ │ Email: [____________] Role: [Viewer ▾]          │   │
│ │ [Send Invitation]                                │   │
│ │                                                  │   │
│ │ Invited:                                         │   │
│ │ • sarah@company.com (Viewer, pending)           │   │
│ │ • john@company.com (Viewer, accepted)           │   │
│ └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### 2. Brand Setup Page (Public)

**Location**: `/brand/{brandId}/setup?key={inviteKey}`

```
┌─────────────────────────────────────────────────────────┐
│                      🎨 TechFlow                        │
│                 Setup Brand MCP Server                  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ [Logo Preview]                                          │
│                                                         │
│ You've been invited to access the TechFlow brand       │
│ identity for AI workflows.                              │
│                                                         │
│ ┌─────────────────────────────────────────────────┐   │
│ │ What you can do:                                │   │
│ │ ✓ Get brand context (voice, colors, logos)     │   │
│ │ ✓ Validate text against brand voice            │   │
│ │ ✓ Access brand assets in any format            │   │
│ │ ✗ Modify brand settings (read-only)            │   │
│ └─────────────────────────────────────────────────┘   │
│                                                         │
│ Setup Instructions:                                     │
│                                                         │
│ 1️⃣ Download Config                                    │
│    [Download colater-techflow.json] [Copy to Clipboard]│
│                                                         │
│ 2️⃣ Add to Claude Desktop                              │
│    Location: ~/Library/Application Support/Claude/     │
│              claude_desktop_config.json                 │
│                                                         │
│ 3️⃣ Restart Claude Desktop                             │
│                                                         │
│ [Show Detailed Instructions]                            │
│                                                         │
│ Need help? [Documentation] [Video Tutorial]            │
└─────────────────────────────────────────────────────────┘
```

### 3. Brand Import Flow

**Location**: `/import`

```
┌─────────────────────────────────────────────────────────┐
│ Import Your Brand                                       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ Upload your brand assets and we'll extract:            │
│ • Colors from your logo                                 │
│ • Typography from guidelines                            │
│ • Brand voice from existing content                     │
│                                                         │
│ ┌─────────────────────────────────────────────────┐   │
│ │ 📁 Logo (Required)                              │   │
│ │ [Drop file or click to upload]                  │   │
│ │ Supports: PNG, SVG, JPG (max 10MB)             │   │
│ └─────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─────────────────────────────────────────────────┐   │
│ │ 📄 Brand Guidelines (Optional)                  │   │
│ │ [Drop file or click to upload]                  │   │
│ │ Supports: PDF (max 50MB)                        │   │
│ └─────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─────────────────────────────────────────────────┐   │
│ │ 🎨 Style Guide JSON (Optional)                  │   │
│ │ [Drop file or click to upload]                  │   │
│ │ From Figma plugin or design system              │   │
│ └─────────────────────────────────────────────────┘   │
│                                                         │
│ [Cancel] [Import Brand →]                               │
└─────────────────────────────────────────────────────────┘
```

---

## Implementation Plan

### Phase 1: Brand-Specific API Keys (2-3 days)

**Backend**:
1. Create API key generation service
   ```typescript
   // src/services/api-key.service.ts
   async function createBrandAPIKey(
     userId: string,
     brandId: string,
     name: string,
     permissions: KeyPermissions
   ): Promise<{ key: string; keyId: string }> {
     // Generate key: colater_sk_brand_{brandId}_{random32}
     // Hash with bcrypt
     // Store in Firestore
     // Return plain key (only time visible)
   }
   ```

2. Update MCP auth middleware
   ```typescript
   // src/lib/mcp-auth.ts
   async function validateBrandAPIKey(key: string): Promise<{
     valid: boolean;
     userId: string;
     brandId: string;
     permissions: KeyPermissions;
   }> {
     // Extract brandId from key structure
     // Look up hashed key in /users/{userId}/brands/{brandId}/apiKeys
     // Verify not revoked or expired
     // Return permissions
   }
   ```

3. Scope API routes to brandId
   ```typescript
   // All /api/mcp/* routes check:
   // 1. API key is valid
   // 2. API key has permission for operation
   // 3. brandId from request matches key's brandId
   ```

**Frontend**:
1. Brand Settings → Share tab UI
2. "Generate Personal Key" button
3. "Generate Team Key" button
4. Display active keys with revoke option
5. Copy config to clipboard

### Phase 2: Shareable Setup Page (1-2 days)

**Backend**:
1. Create invite link system
   ```typescript
   // /users/{userId}/brands/{brandId}/inviteLinks/{linkId}
   {
     code: string;        // Short code: "xyz789"
     permissions: {...};
     expiresAt: Timestamp;
     maxUses: number;
     usedCount: number;
   }
   ```

2. Public setup page route
   ```typescript
   // /brand/{brandId}/setup?invite={code}
   // Validates invite code
   // Shows brand preview
   // Generates downloadable config
   ```

**Frontend**:
1. Public brand setup page
2. Brand preview card (logo, name, colors)
3. Download config button
4. Copy config button
5. Step-by-step setup instructions
6. Embedded video tutorial (optional)

### Phase 3: Brand Import (2-3 days)

**Backend**:
1. File upload API routes
   ```typescript
   // POST /api/brands/import
   // Accepts: FormData with files
   // Returns: extracted brand data for review
   ```

2. AI extraction flows
   ```typescript
   // src/ai/flows/extract-colors-from-logo.ts
   // src/ai/flows/extract-voice-from-pdf.ts
   // src/ai/flows/parse-style-guide.ts
   ```

**Frontend**:
1. Import brand page UI
2. Multi-file upload component
3. Progress indicators
4. Preview/review extracted data
5. Edit before finalizing

### Phase 4: Team Invitations (2 days)

**Backend**:
1. Email invitation system
   ```typescript
   // POST /api/brands/{brandId}/invite
   // Sends email with setup link
   ```

2. Invitation acceptance
   ```typescript
   // /users/{userId}/brands/{brandId}/sharedWith/{email}
   ```

**Frontend**:
1. Email invite form in Share tab
2. Pending invitations list
3. Accept invitation flow

---

## MCP Server Updates

### 1. Brand ID from Environment

Update MCP server to use `COLATER_BRAND_ID`:

```typescript
// colater-mcp/src/config.ts
export interface ColaterMCPConfig {
  apiKey: string;
  apiEndpoint: string;
  brandId: string;           // Required, from env or config
  cache: {
    enabled: boolean;
    ttl: number;
  };
}

// Load from COLATER_BRAND_ID env var
const envBrandId = process.env.COLATER_BRAND_ID;
```

### 2. Remove Optional brandId from Tools

Tools no longer need `brandId` parameter - it's implicit from config:

```typescript
// Before
const BrandContextInputSchema = z.object({
  brandId: z.string().optional(),  // ❌ Remove
  sections: z.array(...).optional(),
  includeAssets: z.boolean().optional(),
});

// After
const BrandContextInputSchema = z.object({
  sections: z.array(...).optional(),
  includeAssets: z.boolean().optional(),
});
```

### 3. Update Tool Descriptions

```typescript
export const brandContextTool = {
  name: 'get_brand_context',
  description:
    'Retrieve complete brand context for TechFlow including identity, voice, and visual guidelines.',
  // Note: Brand name dynamically injected based on configured brand
};
```

---

## Example Workflows

### Workflow 1: Solo Designer

1. Sarah creates "Cafe Noir" brand on Colater
2. Goes to Settings → Share
3. Clicks "Get My MCP Config"
4. Downloads `colater-cafe-noir.json`
5. Adds to Claude Desktop
6. Now Claude knows Cafe Noir's brand identity in all conversations

### Workflow 2: Marketing Team

1. Sarah creates "TechFlow" brand on Colater
2. Goes to Settings → Share
3. Clicks "Generate Team Link"
4. Copies link: `colater.ai/brand/abc123/setup?invite=xyz789`
5. Shares in Slack: "Hey team, set this up so Claude knows our brand!"
6. 5 team members click link, download config, add to Claude
7. Whole team can now:
   - Ask: "Is this email on-brand?"
   - Ask: "Get me our brand colors in Tailwind format"
   - Ask: "Generate a Twitter post announcing our new feature"

### Workflow 3: Developer

1. Dev team needs brand assets for website
2. Sarah generates "Developer Key" with read access
3. Adds to CI/CD environment variables:
   ```bash
   COLATER_API_KEY=colater_sk_brand_abc123_dev...
   COLATER_BRAND_ID=abc123
   ```
4. Build script uses MCP server to fetch latest brand colors
5. Automatically generates themed CSS
6. Website always uses latest brand colors

---

## Security Considerations

1. **Key Scoping**: API keys scoped to single brand
2. **Permission Levels**: Read, Validate, Generate, Modify
3. **Key Rotation**: Owner can revoke/regenerate team keys
4. **Expiration**: Optional expiration for temporary access
5. **Rate Limiting**: Per-key rate limits
6. **Audit Log**: Track key usage for compliance

---

## Success Metrics

1. **Adoption**:
   - % of brands with shared access
   - Average team size per brand
   - Team member activation rate

2. **Engagement**:
   - API calls per brand per week
   - Most-used tools by team members
   - Retention after 30 days

3. **Satisfaction**:
   - Setup completion time
   - Support tickets related to sharing
   - NPS from team members

---

## Open Questions

1. Should we allow multiple brands in one MCP instance?
   - Pro: Fewer restarts, easier for agencies
   - Con: More complex, harder to share

2. Should team keys be permanent or require periodic renewal?
   - Security vs convenience tradeoff

3. Should we support org-level billing?
   - Free: 1 brand, 3 team members
   - Pro: 5 brands, unlimited team members

4. Should we show real-time usage stats?
   - API calls, most-used tools, active team members

---

Ready to implement! 🚀

Let me know if you want to:
1. Start with Phase 1 (API keys)?
2. Start with Phase 2 (setup page)?
3. Start with Phase 3 (brand import)?
4. Refine the workflow first?
