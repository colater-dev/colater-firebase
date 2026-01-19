# Colater MCP Server

> Brand intelligence layer for AI workflows

The Colater MCP Server exposes your brand identity as a set of tools that AI agents can query in real-time. Use it with Claude Desktop, Cursor, Cline, and other MCP-compatible clients to maintain brand consistency across all your AI-powered workflows.

## Features

- **Brand Context**: Retrieve complete brand identity, voice guidelines, and visual system
- **Voice Validation**: Check if text matches your brand voice with AI-powered analysis
- **Asset Access**: Get logos, colors, and fonts in multiple formats (HEX, Tailwind, CSS, etc.)
- **Brand Discovery**: List and search all your brands
- **Local Caching**: Fast responses with intelligent caching
- **Type-Safe**: Full TypeScript implementation with Zod validation

## Installation

### Via npx (Recommended)

```bash
npx @colater/mcp-server init
```

### Via npm

```bash
npm install -g @colater/mcp-server
colater-mcp init
```

## Setup

### 1. Get Your API Key

1. Visit [colater.ai/settings/api-keys](https://colater.ai/settings/api-keys)
2. Click "Create MCP API Key"
3. Copy the key (starts with `colater_sk_...`)

### 2. Run Setup Wizard

```bash
colater-mcp init
```

This will:
- Prompt for your API key
- Configure default brand (optional)
- Set up caching preferences
- Create config file at `~/.colater/config.json`

### 3. Add to MCP Client

#### Claude Desktop

Edit `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "colater": {
      "command": "npx",
      "args": ["-y", "@colater/mcp-server"]
    }
  }
}
```

#### Cursor

Edit `.cursor/mcp-config.json` in your project:

```json
{
  "mcpServers": {
    "colater": {
      "command": "colater-mcp",
      "args": ["start"]
    }
  }
}
```

### 4. Restart Your Client

Restart Claude Desktop or Cursor to load the MCP server.

## Usage

Once configured, you can use Colater tools in your AI conversations:

### Get Brand Context

```
"Get the complete brand context for my TechFlow brand"
```

Returns:
- Brand positioning and identity
- Voice guidelines (tone, preferred/avoided words)
- Visual system (logos, colors, typography)
- Design philosophy

### Validate Brand Voice

```
"Check if this email matches my brand voice:
[paste your email text]"
```

Returns:
- Overall score (0-1)
- Specific issues (off-tone words, jargon, etc.)
- Suggestions for improvement
- AI-generated rewrite (optional)

### Get Brand Assets

```
"Get my brand colors in Tailwind format"
```

Returns:
- Colors in requested format (HEX, Tailwind, CSS, etc.)
- Logo URLs in various formats
- Font information with Google Fonts links

### List Brands

```
"Show me all my brands"
```

Returns:
- List of all accessible brands
- Thumbnails, taglines, creation dates
- Stats (logo count, guidelines status)

## Tools Reference

### `get_brand_context`

Retrieve complete brand context including identity, voice, and visual guidelines.

**Parameters:**
- `brandId` (optional): Brand ID, uses default if not provided
- `sections` (optional): Filter by sections (`identity`, `voice`, `visual`, `positioning`)
- `includeAssets` (optional): Include asset URLs (default: true)

### `validate_brand_voice`

Check if text matches brand voice and get rewrite suggestions.

**Parameters:**
- `brandId` (optional): Brand ID, uses default if not provided
- `text` (required): Text to validate (max 5000 chars)
- `context` (optional): Context like "email", "social_post", "blog"
- `strictness` (optional): 0-1, validation strictness (default: 0.7)

### `get_brand_assets`

Retrieve brand assets in various formats.

**Parameters:**
- `brandId` (optional): Brand ID, uses default if not provided
- `assetTypes` (required): Array of `logo`, `colors`, `fonts`, `mockups`
- `format` (optional): Output formats for each asset type

### `list_brands`

List all brands accessible to the authenticated user.

**Parameters:**
- `limit` (optional): Max results, 1-100 (default: 50)
- `offset` (optional): Pagination offset (default: 0)
- `sortBy` (optional): `name`, `created`, `updated` (default: updated)
- `filter` (optional): Search query and filters

## Configuration

### Config File

Location: `~/.colater/config.json`

```json
{
  "apiKey": "colater_sk_live_...",
  "apiEndpoint": "https://colater.ai/api/mcp",
  "defaultBrandId": "brand_abc123",
  "cache": {
    "enabled": true,
    "ttl": 300
  }
}
```

### Environment Variables

- `COLATER_API_KEY`: API key (overrides config file)
- `COLATER_MCP_LOG_LEVEL`: Log level (`debug`, `info`, `warn`, `error`)

## Caching

The MCP server includes a local caching layer for improved performance:

- Brand context cached for 5 minutes (default)
- Assets cached for 5 minutes (default)
- Cache stored in `~/.colater/cache`
- Configurable TTL via config file

## Troubleshooting

### "Configuration file not found"

Run `colater-mcp init` to create the config file.

### "Invalid API key"

1. Check your API key at [colater.ai/settings/api-keys](https://colater.ai/settings/api-keys)
2. Ensure it starts with `colater_sk_`
3. Try regenerating the key

### "Brand not found"

1. Ensure the brand ID is correct
2. Check you have access to the brand
3. Try using `list_brands` to see available brands

### MCP client not detecting the server

1. Check the config file syntax
2. Ensure `npx` or `colater-mcp` is in your PATH
3. Restart the MCP client
4. Check client logs for errors

## CLI Commands

```bash
# Start MCP server (default)
colater-mcp

# Run setup wizard
colater-mcp init

# Show version
colater-mcp version

# Show help
colater-mcp help
```

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Development mode
npm run dev

# Run tests
npm test
```

## Links

- **Documentation**: https://docs.colater.ai/mcp
- **Main App**: https://colater.ai
- **API Keys**: https://colater.ai/settings/api-keys
- **Support**: https://colater.ai/support

## License

MIT
