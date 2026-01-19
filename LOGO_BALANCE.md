# Logo Balance System

## Overview

The Logo Balance System automatically calculates the optimal size ratio between logo icons and brand name text (wordmarks) using advanced image analysis and visual weight calculations. This eliminates the need for manual adjustments and ensures professional, optically balanced brand presentations.

## How It Works

### 1. Visual Weight Analysis

The system analyzes both the logo and wordmark to determine their visual "weight" - how much visual presence each element has.

**For Logos:**
- **Density**: How much of the canvas is filled with pixels
- **Contrast**: Luminance values (dark vs. light)
- **Complexity**: Edge detection to measure detail level
- **Aspect Ratio**: Width-to-height ratio affects perceived weight

**For Wordmarks:**
- **Character Count**: Longer words feel heavier
- **Font Weight**: Bold vs. light fonts
- **Text Width**: Actual rendered width at a given size
- **Ascenders/Descenders**: Characters like 'g', 'y', 'h', 'k' add visual weight

### 2. Balance Calculation

The algorithm calculates optimal sizing to achieve visual equilibrium:

```typescript
// Example: If logo is visually heavier
logoWeight = 0.7  (dense, complex logo)
wordmarkWeight = 0.4  (short, light font)
ratio = 0.7 / 0.4 = 1.75

// Result: Logo should be scaled down OR text scaled up
logoScale = 0.85
wordmarkScale = 1.15
```

### 3. Display Settings Conversion

The calculated scales are converted to the existing `verticalLogoTextBalance` format (0-100):
- **0-30**: Logo dominates (larger logo, smaller text)
- **30-70**: Balanced (similar visual weights)
- **70-100**: Text dominates (smaller logo, larger text)

## Usage

### In React Components

```typescript
import { useLogoBalance } from '@/hooks/use-logo-balance';

function MyComponent({ logo, brand }) {
  const {
    displaySettings,
    isAnalyzing,
    balance,
    error
  } = useLogoBalance(
    logo.logoUrl,
    brand.latestName,
    brand.font || 'Inter'
  );

  if (isAnalyzing) {
    return <Loader />;
  }

  if (displaySettings) {
    // Use displaySettings.verticalLogoTextBalance
    const balanceValue = displaySettings.verticalLogoTextBalance;
    const logoSize = 18 * (1.5 - (balanceValue / 100));
    const textSize = 7 * (0.5 + (balanceValue / 100));
  }
}
```

### With UI Control Component

```typescript
import { LogoBalanceControl } from '@/features/brands/components';

function BrandEditor({ logo, brand, onUpdate }) {
  return (
    <LogoBalanceControl
      logoUrl={logo.logoUrl}
      brandName={brand.latestName}
      font={brand.font}
      currentBalance={brand.displaySettings?.verticalLogoTextBalance}
      onBalanceChange={(balance) => {
        onUpdate({
          displaySettings: {
            ...brand.displaySettings,
            verticalLogoTextBalance: balance
          }
        });
      }}
    />
  );
}
```

### Preloading for Multiple Logos

For better UX, preload balance calculations for all logos in a brand:

```typescript
import { preloadLogoBalances } from '@/hooks/use-logo-balance';

// On brand page load
useEffect(() => {
  if (logos && brand) {
    preloadLogoBalances(
      logos,
      brand.latestName,
      brand.font || 'Inter'
    );
  }
}, [logos, brand]);
```

## Algorithm Details

### Logo Analysis (`analyzeLogoImage`)

1. **First Pass - Pixel Analysis**:
   - Iterate through all pixels
   - Track filled pixels (alpha > 30)
   - Calculate luminance for each pixel
   - Find bounding box coordinates

2. **Second Pass - Edge Detection**:
   - Simplified Sobel operator
   - Compare each pixel with 4 neighbors
   - Detect significant alpha differences
   - Count edge pixels

3. **Calculate Metrics**:
   ```typescript
   density = filledPixels / totalPixels
   contrast = avgLuminance / 255
   complexity = edgePixels / filledPixels
   visualWeight = density * 0.45 + contrastFactor * 0.30 + complexity * 0.25
   ```

### Wordmark Analysis (`analyzeWordmark`)

1. **Text Measurement**:
   - Create canvas context
   - Measure actual rendered width using `measureText()`
   - Estimate height based on font size

2. **Font Weight Detection**:
   ```typescript
   if (font.includes('thin')) → weight = 0.7
   if (font.includes('bold')) → weight = 1.3
   if (font.includes('black')) → weight = 1.5
   ```

3. **Calculate Visual Weight**:
   ```typescript
   lengthFactor = min(charCount / 8, 1.5)
   widthFactor = min(widthPerChar / baseSize, 1.2)
   visualWeight = (fontWeight * 0.5 + lengthFactor * 0.3 + widthFactor * 0.2) / 2
   ```

### Balance Calculation (`calculateBalance`)

1. **Ratio Analysis**:
   ```typescript
   currentRatio = logoWeight / wordmarkWeight
   targetRatio = 1.0  // Perfect balance
   ```

2. **Scale Adjustments**:
   - If logo heavier (ratio > 1.3):
     - Reduce logo size: `logoScale = max(0.6, 1 / √ratio)`
     - Increase text size: `wordmarkScale = min(1.4, √(ratio * 0.8))`

   - If text heavier (ratio < 0.7):
     - Increase logo size: `logoScale = min(1.6, √(1 / ratio))`
     - Reduce text size: `wordmarkScale = max(0.7, √ratio)`

3. **Orientation Adjustments**:
   - Horizontal logos: `logoScale *= 0.9`
   - Vertical logos: `logoScale *= 1.1`

4. **Text Length Adjustments**:
   - Very long names (>15 chars): `wordmarkScale *= 0.85`
   - Short names (<5 chars): `wordmarkScale *= 1.15`

5. **Gap Calculation**:
   ```typescript
   suggestedGap = max(20, min(80, baseGap * totalWeight))
   ```

6. **Confidence Score**:
   ```typescript
   weightBalance = min(logoWeight, wordmarkWeight) / max(logoWeight, wordmarkWeight)
   extremityFactor = 1 - abs(0.5 - totalWeight / 2)
   confidence = weightBalance * 0.6 + extremityFactor * 0.4
   ```

## Performance & Caching

### In-Memory Cache

- Calculated balances are cached using a composite key:
  ```typescript
  cacheKey = `${logoUrl}:${brandName}:${font}:${baseSize}`
  ```
- Cache expiry: 1 hour
- Cache operations:
  - `clearBalanceCache()`: Clear all cached values
  - `getBalanceCacheStats()`: View cache statistics

### Image Loading

- Uses `crossOrigin = 'anonymous'` for CORS compatibility
- Canvas API for pixel data extraction
- Error handling for failed image loads

### Optimization Tips

1. **Preload on page load**: Use `preloadLogoBalances()` for all brand logos
2. **Skip cache when needed**: Pass `skipCache: true` to `useLogoBalance()`
3. **Disable when not needed**: Pass `enabled: false` to prevent analysis
4. **Reanalyze on demand**: Call `reanalyze()` from hook result

## Examples

### Example 1: Dense Logo + Short Name

```
Logo: Complex icon with high density (0.7)
Wordmark: "Acme" in bold font (0.4)

Result:
- logoScale: 0.85 (reduce logo)
- wordmarkScale: 1.15 (increase text)
- balance: 62 (text larger)
- confidence: 0.78
```

### Example 2: Simple Logo + Long Name

```
Logo: Minimal icon with low density (0.3)
Wordmark: "International Solutions Group" (0.6)

Result:
- logoScale: 1.3 (increase logo)
- wordmarkScale: 0.75 (reduce text)
- balance: 38 (logo larger)
- confidence: 0.82
```

### Example 3: Balanced Design

```
Logo: Moderate complexity (0.5)
Wordmark: "TechCorp" in regular font (0.5)

Result:
- logoScale: 1.0
- wordmarkScale: 1.0
- balance: 50 (perfectly balanced)
- confidence: 0.92
```

## Integration Checklist

- [x] Logo analysis utility with image processing
- [x] Visual weight calculation algorithms
- [x] Auto-balance hook with caching
- [x] Canvas text measurement utilities
- [x] Cover slide integration
- [x] UI control component with manual override
- [ ] BrandIdentityCard integration
- [ ] LogoShowcase integration
- [ ] Persistence to Firebase displaySettings

## Future Enhancements

1. **Machine Learning**: Train on designer-approved balances for better accuracy
2. **Color Consideration**: Factor in color contrast and vibrancy
3. **Context Awareness**: Different balances for different use cases (business card vs. website)
4. **A/B Testing**: Show multiple options and learn from user preferences
5. **Real-time Preview**: Live preview of balance adjustments
6. **Batch Processing**: Analyze multiple logos simultaneously
7. **Export Recommendations**: Generate balance reports for designers

## Troubleshooting

### Issue: "Failed to load image"
**Solution**: Ensure logo URL is accessible and CORS is configured properly.

### Issue: Low confidence scores
**Solution**: This is normal for extreme designs. Use manual adjustment or provide more typical logo/text combinations.

### Issue: Unexpected results
**Solution**: Check logo image quality. Very small or very large images may not analyze well. Recommended size: 500-2000px.

### Issue: Slow performance
**Solution**: Use preloading and ensure caching is enabled. Check cache stats with `getBalanceCacheStats()`.

## API Reference

### `useLogoBalance(logoUrl, brandName, font, options)`

**Parameters:**
- `logoUrl: string | undefined` - URL of the logo image
- `brandName: string | undefined` - Brand name text
- `font: string | undefined` - Font family name
- `options: UseLogoBalanceOptions` - Configuration options

**Returns:**
- `isAnalyzing: boolean` - Analysis in progress
- `error: Error | null` - Error if analysis failed
- `logoAnalysis: LogoAnalysisResult | null` - Logo metrics
- `wordmarkAnalysis: WordmarkAnalysisResult | null` - Wordmark metrics
- `balance: BalanceResult | null` - Balance calculation
- `displaySettings: DisplaySettings | null` - Ready-to-use settings
- `reanalyze: () => Promise<void>` - Force reanalysis

### `analyzeLogoWordmarkBalance(logoUrl, brandName, font, baseSize)`

Low-level function for direct analysis without React hooks.

### `preloadLogoBalances(logos, brandName, font, baseSize)`

Preload and cache balance calculations for multiple logos.

### `clearBalanceCache()`

Clear the entire balance cache.

### `getBalanceCacheStats()`

Get cache size and entry details.

## Credits

Developed as part of the Colater Brand Canvas presentation enhancement project. Uses HTML5 Canvas API for image analysis and custom algorithms for visual weight calculation.
