'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Loader2,
  Wand2,
  Palette,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
} from 'lucide-react';
import { shiftHue, darkenColor, isLightColor, lightenColor } from '@/lib/color-utils';
import { ShaderLoader } from '@/components/ui/shader-loader';
import type { Logo, Critique, CritiquePoint as CritiquePointType } from '@/lib/types';

// CritiquePoint Component
function CritiquePoint({
  point,
  isExpanded,
  onToggle
}: {
  point: CritiquePointType;
  isExpanded: boolean;
  onToggle: (e: React.MouseEvent) => void;
}) {
  return (
    <div
      className="absolute cursor-pointer z-20"
      style={{
        left: `${point.x}%`,
        top: `${point.y}%`,
        transform: 'translate(-50%, -50%)',
      }}
      onClick={onToggle}
    >
      <div
        className={`
          flex items-center shadow-lg transition-all duration-300 ease-out
          ${isExpanded
            ? 'bg-background border border-input px-3 py-2 min-w-[200px]'
            : `border-2 w-8 h-8 justify-center ${point.sentiment === 'positive' ? 'bg-green-500/90 border-green-600' : 'bg-red-500/90 border-red-600'}`
          }
        `}
        style={{
          borderRadius: '30px 30px 2px 30px',
        }}
      >
        {!isExpanded && (
          point.sentiment === 'positive' ? (
            <ThumbsUp className="w-4 h-4 text-white flex-shrink-0" />
          ) : (
            <ThumbsDown className="w-4 h-4 text-white flex-shrink-0" />
          )
        )}
        {isExpanded && (
          <span className="text-sm text-foreground text-left leading-relaxed">
            {point.comment}
          </span>
        )}
      </div>
    </div>
  );
}

interface BrandIdentityCardProps {
  brandName: string;
  primaryTagline: string;
  logos: Logo[] | null;
  currentLogoIndex: number;
  isLoadingLogos: boolean;
  isGeneratingLogo: boolean;
  isGeneratingConcept: boolean;
  isColorizing: boolean;
  isLoadingTaglines: boolean;
  logoConcept: string | null;
  onGenerateConcept: () => void;
  onConceptChange: (concept: string) => void;
  onGenerateLogo: (provider: 'gemini' | 'openai' | 'ideogram') => void;
  onColorizeLogo: () => void;
  onLogoIndexChange: (index: number) => void;
  onCritiqueLogo: () => void;
  isCritiquing: boolean;
}

export function BrandIdentityCard({
  brandName,
  primaryTagline,
  logos,
  currentLogoIndex,
  isLoadingLogos,
  isGeneratingLogo,
  isGeneratingConcept,
  isColorizing,
  isLoadingTaglines,
  logoConcept,
  onGenerateConcept,
  onConceptChange,
  onGenerateLogo,
  onColorizeLogo,
  onLogoIndexChange,
  onCritiqueLogo,
  isCritiquing,
}: BrandIdentityCardProps) {
  const [showColorLogo, setShowColorLogo] = useState(true);
  const [showCritique, setShowCritique] = useState(false);
  const [selectedFont, setSelectedFont] = useState<'brand' | 'tagline' | null>(null);
  const [expandedPointId, setExpandedPointId] = useState<string | null>(null);
  const [hueShifts, setHueShifts] = useState<Record<number, number>>({});
  const [displayedPalette, setDisplayedPalette] = useState<string[] | undefined>(
    undefined
  );
  const [contrast, setContrast] = useState(100);
  const [selectedProvider, setSelectedProvider] = useState<'gemini' | 'openai' | 'ideogram'>('ideogram');
  const [cardModes, setCardModes] = useState<Record<string, number>>({});

  const getCardMode = (key: string, defaultInvert: boolean) => {
    if (cardModes[key] !== undefined) return cardModes[key];
    return defaultInvert ? 2 : 0;
  };

  const cycleCardMode = (key: string, defaultInvert: boolean) => {
    const current = getCardMode(key, defaultInvert);
    setCardModes(prev => ({ ...prev, [key]: (current + 1) % 4 }));
  };

  const getModeStyles = (mode: number) => {
    switch (mode) {
      case 0: return { mixBlendMode: 'darken' as const, filter: 'none' };
      case 1: return { mixBlendMode: 'lighten' as const, filter: 'none' };
      case 2: return { mixBlendMode: 'lighten' as const, filter: 'invert(1)' };
      case 3: return { mixBlendMode: 'darken' as const, filter: 'invert(1)' };
      default: return { mixBlendMode: 'darken' as const, filter: 'none' };
    }
  };

  const currentLogo = logos?.[currentLogoIndex];

  // Reset hue shifts when logo changes
  useEffect(() => {
    setHueShifts({});
    setContrast(100);

    // Set displayed palette from first color version if available
    const colorVersions = currentLogo?.colorVersions || [];
    if (colorVersions.length === 0 && currentLogo?.palette) {
      setDisplayedPalette(currentLogo.palette);
    } else if (colorVersions.length > 0) {
      setDisplayedPalette(colorVersions[0]?.palette);
    } else {
      setDisplayedPalette(undefined);
    }
  }, [currentLogo, currentLogo?.palette, currentLogo?.colorVersions]);

  // Close expanded point when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setExpandedPointId(null);
    };

    if (expandedPointId) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [expandedPointId]);

  const displayLogoUrl = currentLogo
    ? showColorLogo && currentLogo.colorLogoUrl
      ? currentLogo.colorLogoUrl
      : currentLogo.logoUrl
    : null;

  return (
    <Card className="shadow-none border-0 bg-transparent">
      <CardHeader className="flex flex-col lg:flex-row items-start justify-between gap-4 p-0">
        <div className="flex flex-wrap gap-2 items-center">
          <Button
            onClick={onGenerateConcept}
            disabled={isGeneratingConcept}
          >
            {isGeneratingConcept ? (
              <>
                <Loader2 className="mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              'Generate Brand Concept'
            )}
          </Button>
          {logoConcept && (
            <>
              <Select value={selectedProvider} onValueChange={(value: 'gemini' | 'openai' | 'ideogram') => setSelectedProvider(value)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gemini">Gemini</SelectItem>
                  <SelectItem value="openai">OpenAI</SelectItem>
                  <SelectItem value="ideogram">Ideogram</SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={() => onGenerateLogo(selectedProvider)}
                disabled={isGeneratingLogo || !logoConcept}
              >
                {isGeneratingLogo ? (
                  <>
                    <Loader2 className="mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  'Generate Logo'
                )}
              </Button>
              <Button
                variant={showCritique ? "default" : "outline"}
                onClick={() => {
                  if (currentLogo?.critique) {
                    setShowCritique(!showCritique);
                  } else {
                    onCritiqueLogo();
                    setShowCritique(true);
                  }
                }}
                disabled={isCritiquing || !currentLogo}
              >
                {isCritiquing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Critiquing...
                  </>
                ) : (
                  <>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    {currentLogo?.critique ? (showCritique ? 'Hide Critique' : 'Show Critique') : 'Critique'}
                  </>
                )}
              </Button>
            </>
          )}
        </div>
        {logoConcept && (
          <div className="w-full lg:w-auto lg:max-w-md flex-1">
            <Textarea
              id="logo-concept"
              value={logoConcept}
              onChange={(e) => onConceptChange(e.target.value)}
              placeholder="Logo concept will appear here..."
              className="min-h-[120px] resize-none"
            />
          </div>
        )}
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center text-center space-y-6 p-0">
        <div className="w-full space-y-4 pt-6 flex flex-col items-center">
          {currentLogo?.colorLogoUrl && (
            <div className="flex flex-col gap-4 items-center w-full max-w-sm">
              <div className="flex items-center space-x-2">
                <Label htmlFor="color-toggle">B&amp;W</Label>
                <Switch
                  id="color-toggle"
                  checked={showColorLogo}
                  onCheckedChange={setShowColorLogo}
                />
                <Label htmlFor="color-toggle">Color</Label>
              </div>
              {showColorLogo && (
                <div className="w-full space-y-2">
                  <Label htmlFor="contrast-slider">Contrast</Label>
                  <Slider
                    id="contrast-slider"
                    defaultValue={[100]}
                    min={50}
                    max={150}
                    step={1}
                    className="w-full"
                    onValueChange={(v) => setContrast(v[0])}
                    value={[contrast]}
                  />
                </div>
              )}
            </div>
          )}

          {/* Logo Applications Showcase */}
          {currentLogo?.logoUrl && (
            <div className="w-full max-w-4xl mt-8">
              <h4 className="text-lg font-semibold mb-4 text-center">Logo Applications</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0">
                {/* Original on White */}
                <div className="relative aspect-square bg-white border border-gray-200 flex items-center justify-center">
                  <Image
                    src={currentLogo.logoUrl}
                    alt="Logo on white background"
                    width={200}
                    height={200}
                    className="object-contain w-full h-full"
                    unoptimized={currentLogo.logoUrl.startsWith('data:')}
                    style={{ filter: 'contrast(1.1)' }}
                  />
                  {/* Critique Points Overlay - Card 1 */}
                  {showCritique && currentLogo?.critique?.points && currentLogo.critique.points
                    .filter((_, idx) => idx % 3 === 0)
                    .map((point) => (
                      <CritiquePoint
                        key={point.id}
                        point={point}
                        isExpanded={expandedPointId === point.id}
                        onToggle={(e) => {
                          e.stopPropagation();
                          setExpandedPointId(expandedPointId === point.id ? null : point.id);
                        }}
                      />
                    ))}
                  <p className="absolute bottom-2 left-0 right-0 text-xs text-center text-gray-400">On White</p>
                </div>

                {/* On Gray (Darker, 50% opacity) - MOVED TO 2ND POSITION */}
                <div className="relative aspect-square bg-gray-600 flex items-center justify-center">
                  <Image
                    src={currentLogo.logoUrl}
                    alt="Logo on gray background"
                    width={200}
                    height={200}
                    className="object-contain w-full h-full opacity-50"
                    unoptimized={currentLogo.logoUrl.startsWith('data:')}
                  />
                  {/* Critique Points Overlay - Card 2 */}
                  {showCritique && currentLogo?.critique?.points && currentLogo.critique.points
                    .filter((_, idx) => idx % 3 === 1)
                    .map((point) => (
                      <CritiquePoint
                        key={point.id}
                        point={point}
                        isExpanded={expandedPointId === point.id}
                        onToggle={(e) => {
                          e.stopPropagation();
                          setExpandedPointId(expandedPointId === point.id ? null : point.id);
                        }}
                      />
                    ))}
                  <p className="absolute bottom-2 left-0 right-0 text-xs text-center text-gray-400">On Gray</p>
                </div>

                {/* Inverted on Black */}
                <div className="relative aspect-square bg-black flex items-center justify-center">
                  <Image
                    src={currentLogo.logoUrl}
                    alt="Inverted logo on black background"
                    width={200}
                    height={200}
                    className="object-contain w-full h-full"
                    unoptimized={currentLogo.logoUrl.startsWith('data:')}
                    style={{ filter: 'invert(1)' }}
                  />
                  {/* Critique Points Overlay - Card 3 */}
                  {showCritique && currentLogo?.critique?.points && currentLogo.critique.points
                    .filter((_, idx) => idx % 3 === 2)
                    .map((point) => (
                      <CritiquePoint
                        key={point.id}
                        point={point}
                        isExpanded={expandedPointId === point.id}
                        onToggle={(e) => {
                          e.stopPropagation();
                          setExpandedPointId(expandedPointId === point.id ? null : point.id);
                        }}
                      />
                    ))}
                  <p className="absolute bottom-2 left-0 right-0 text-xs text-center text-gray-400">Inverted on Black</p>
                </div>

                {/* On Brand Color (Darkened) - Show all palette colors from all color versions with hue shift */}
                {(() => {
                  // Support new colorVersions structure and legacy fields
                  const colorVersions = currentLogo.colorVersions || [];

                  // Migrate legacy fields if needed
                  if (colorVersions.length === 0 && currentLogo.colorLogoUrl) {
                    colorVersions.push({ colorLogoUrl: currentLogo.colorLogoUrl, palette: currentLogo.palette || [] });
                  }

                  // Flatten all colors from all versions with their hue shifts
                  const allBrandColors: Array<{ color: string; versionIndex: number; colorIndex: number; palette: string[] }> = [];
                  colorVersions.forEach((colorVersion, versionIndex) => {
                    const currentHueShift = hueShifts[versionIndex] || 0;
                    const shiftedPalette = colorVersion.palette.map(color => shiftHue(color, currentHueShift));

                    shiftedPalette.forEach((color, colorIndex) => {
                      allBrandColors.push({
                        color,
                        versionIndex,
                        colorIndex,
                        palette: shiftedPalette
                      });
                    });
                  });

                  if (allBrandColors.length > 0) {
                    return allBrandColors.map((brandColor, index) => {
                      const darkenedColor = darkenColor(brandColor.color, 0.2);
                      const shouldInvert = isLightColor(darkenedColor);
                      const cardKey = `brand-color-v${brandColor.versionIndex}-c${brandColor.colorIndex}`;
                      const mode = getCardMode(cardKey, shouldInvert);
                      const styles = getModeStyles(mode);

                      return (
                        <div
                          key={cardKey}
                          className="relative aspect-square flex items-center justify-center group"
                          style={{ backgroundColor: darkenedColor }}
                        >
                          {/* Small palette display at top */}
                          <div className="absolute top-2 left-2 flex gap-1 z-10">
                            {brandColor.palette.map((paletteColor, paletteIndex) => (
                              <div
                                key={`palette-dot-${paletteIndex}`}
                                className="w-3 h-3 rounded-full border"
                                style={{
                                  backgroundColor: paletteColor,
                                  borderColor: paletteIndex === brandColor.colorIndex ? 'white' : 'transparent',
                                  borderWidth: paletteIndex === brandColor.colorIndex ? '2px' : '1px'
                                }}
                                title={paletteColor}
                              />
                            ))}
                          </div>

                          {/* Toggle Button */}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-2 right-2 w-8 h-8 bg-black/20 hover:bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity z-10"
                            onClick={(e) => {
                              e.stopPropagation();
                              cycleCardMode(cardKey, shouldInvert);
                            }}
                          >
                            <RefreshCw className="w-4 h-4" />
                          </Button>

                          <Image
                            src={currentLogo.logoUrl}
                            alt={`Logo on brand color ${index + 1}`}
                            width={200}
                            height={200}
                            className="object-contain w-full h-full"
                            unoptimized={currentLogo.logoUrl.startsWith('data:')}
                            style={styles}
                          />
                          <p className="absolute bottom-2 left-0 right-0 text-xs text-center text-gray-400">
                            On Brand Color
                          </p>
                        </div>
                      );
                    });
                  } else {
                    const cardKey = 'brand-color-fallback';
                    const mode = getCardMode(cardKey, false); // Default to darken/none
                    const styles = getModeStyles(mode);

                    return (
                      <div
                        className="relative aspect-square flex items-center justify-center group"
                        style={{
                          backgroundColor: displayedPalette?.[0] ? darkenColor(displayedPalette[0], 0.2) : '#2563eb'
                        }}
                      >
                        {/* Toggle Button */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-2 right-2 w-8 h-8 bg-black/20 hover:bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity z-10"
                          onClick={(e) => {
                            e.stopPropagation();
                            cycleCardMode(cardKey, false);
                          }}
                        >
                          <RefreshCw className="w-4 h-4" />
                        </Button>

                        <Image
                          src={currentLogo.logoUrl}
                          alt="Logo on brand color"
                          width={200}
                          height={200}
                          className="object-contain w-full h-full"
                          unoptimized={currentLogo.logoUrl.startsWith('data:')}
                          style={styles}
                        />
                        <p className="absolute bottom-2 left-0 right-0 text-xs text-center text-gray-400">On Brand Color</p>
                      </div>
                    );
                  }
                })()}

                {/* Color Logo Versions - Show all versions with individual hue sliders */}
                {(() => {
                  // Support new colorVersions structure and legacy fields
                  const colorVersions = currentLogo.colorVersions || [];

                  // Migrate legacy fields if needed
                  if (colorVersions.length === 0 && currentLogo.colorLogoUrl) {
                    colorVersions.push({ colorLogoUrl: currentLogo.colorLogoUrl, palette: currentLogo.palette || [] });
                  }

                  if (colorVersions.length > 0) {
                    return colorVersions.map((colorVersion, versionIndex) => {
                      const currentHueShift = hueShifts[versionIndex] || 0;
                      const shiftedPalette = colorVersion.palette.map(color => shiftHue(color, currentHueShift));

                      return (
                        <div key={`color-version-${versionIndex}`} className="relative aspect-square bg-white border border-gray-200 flex flex-col items-center justify-center">
                          {/* Color logo with hue shift */}
                          <div className="flex-1 w-full flex items-center justify-center relative">
                            <Image
                              src={colorVersion.colorLogoUrl}
                              alt={`Color logo version ${versionIndex + 1}`}
                              width={200}
                              height={200}
                              className="object-contain w-full h-full"
                              unoptimized={colorVersion.colorLogoUrl.startsWith('data:')}
                              style={{
                                filter: `hue-rotate(${currentHueShift}deg)`
                              }}
                            />

                            {/* Small palette display at top */}
                            <div className="absolute top-2 left-2 flex gap-1">
                              {shiftedPalette.map((paletteColor, paletteIndex) => (
                                <div
                                  key={`palette-dot-${paletteIndex}`}
                                  className="w-3 h-3 rounded-full border"
                                  style={{
                                    backgroundColor: paletteColor,
                                    borderColor: 'white',
                                    borderWidth: '1px'
                                  }}
                                  title={paletteColor}
                                />
                              ))}
                            </div>
                          </div>

                          {/* Hue slider at bottom */}
                          <div className="w-full px-3 pb-3 pt-1">
                            <Slider
                              defaultValue={[0]}
                              max={360}
                              step={1}
                              className="w-full"
                              value={[currentHueShift]}
                              onValueChange={(value) => {
                                setHueShifts(prev => ({ ...prev, [versionIndex]: value[0] }));
                              }}
                            />
                          </div>

                          <p className="absolute bottom-12 left-0 right-0 text-xs text-center text-gray-400">
                            Color Version {colorVersions.length > 1 ? versionIndex + 1 : ''}
                          </p>
                        </div>
                      );
                    });
                  } else {
                    return (
                      <div className="relative aspect-square bg-gray-100 border border-gray-200 flex items-center justify-center">
                        <Button
                          onClick={onColorizeLogo}
                          disabled={isColorizing || isGeneratingLogo}
                          variant="outline"
                        >
                          {isColorizing ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <Palette className="mr-2 h-4 w-4" />
                              Generate Color Version
                            </>
                          )}
                        </Button>
                      </div>
                    );
                  }
                })()}

                {/* Retry button card - always show when color versions exist */}
                {currentLogo.colorVersions && currentLogo.colorVersions.length > 0 && (
                  <div className="relative aspect-square bg-gray-100 border border-gray-200 flex items-center justify-center">
                    <Button
                      onClick={onColorizeLogo}
                      disabled={isColorizing || isGeneratingLogo}
                      variant="outline"
                    >
                      {isColorizing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Generate Another
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>

              {/* Brand Palette Section - Show all color version palettes with hue shifts */}
              {(() => {
                // Support new colorVersions structure and legacy fields
                const colorVersions = currentLogo.colorVersions || [];

                // Migrate legacy fields if needed
                if (colorVersions.length === 0 && currentLogo.colorLogoUrl) {
                  colorVersions.push({ colorLogoUrl: currentLogo.colorLogoUrl, palette: currentLogo.palette || [] });
                }

                if (colorVersions.length > 0) {
                  return (
                    <div className="mt-8">
                      <div className="space-y-0">
                        {colorVersions.map((colorVersion, versionIndex) => {
                          const currentHueShift = hueShifts[versionIndex] || 0;
                          const shiftedPalette = colorVersion.palette.map(color => shiftHue(color, currentHueShift));

                          return shiftedPalette.map((color, colorIndex) => {
                            const darker1 = darkenColor(color, 0.15);
                            const darker2 = darkenColor(color, 0.3);
                            const lighter1 = lightenColor(color, 0.15);
                            const lighter2 = lightenColor(color, 0.3);

                            const shades = [darker2, darker1, color, lighter1, lighter2];

                            return (
                              <div key={`palette-v${versionIndex}-c${colorIndex}`}>
                                <div className="grid grid-cols-5 gap-0">
                                  {shades.map((shade, shadeIndex) => {
                                    const isLight = isLightColor(shade);
                                    const textColor = isLight ? 'text-gray-900' : 'text-white';

                                    return (
                                      <div
                                        key={`shade-${shadeIndex}`}
                                        className={`aspect-square flex items-center justify-center ${textColor}`}
                                        style={{ backgroundColor: shade }}
                                      >
                                        <p className="text-xs font-mono">{shade.toUpperCase()}</p>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          });
                        })}
                      </div>
                    </div>
                  );
                }
                return null;
              })()}
            </div>
          )}

          {logos && logos.length > 1 && (
            <div className="flex flex-col items-center gap-4 w-full">
              <div className="flex items-center justify-center w-full gap-4">
                <Button
                  variant="light"
                  size="icon"
                  onClick={() => onLogoIndexChange(Math.max(0, currentLogoIndex - 1))}
                  disabled={currentLogoIndex === 0}
                >
                  <ChevronLeft />
                </Button>
                <Button
                  variant="light"
                  size="icon"
                  onClick={() =>
                    onLogoIndexChange(Math.min(logos.length - 1, currentLogoIndex + 1))
                  }
                  disabled={currentLogoIndex === logos.length - 1}
                >
                  <ChevronRight />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Logo {currentLogoIndex + 1} of {logos.length}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
