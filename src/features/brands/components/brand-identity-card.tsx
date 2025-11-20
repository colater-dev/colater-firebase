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
  const [hueShift, setHueShift] = useState(0);
  const [displayedPalette, setDisplayedPalette] = useState<string[] | undefined>(
    undefined
  );
  const [contrast, setContrast] = useState(100);
  const [selectedProvider, setSelectedProvider] = useState<'gemini' | 'openai' | 'ideogram'>('ideogram');
  const [currentColorVersionIndex, setCurrentColorVersionIndex] = useState(0);

  const currentLogo = logos?.[currentLogoIndex];

  // Reset hue shift and color version index when logo changes
  useEffect(() => {
    // Support both old (single palette) and new (multiple palettes) structure
    const palettes = currentLogo?.palettes || (currentLogo?.palette ? [currentLogo.palette] : undefined);
    const currentPalette = palettes?.[currentColorVersionIndex];

    if (currentPalette) {
      setHueShift(0);
      setContrast(100);
      setDisplayedPalette(currentPalette);
    } else {
      setDisplayedPalette(undefined);
    }

    // Reset to first color version when logo changes
    setCurrentColorVersionIndex(0);
  }, [currentLogo, currentLogo?.palette, currentLogo?.palettes]);

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

  const handleHueChange = (value: number[]) => {
    const newHue = value[0];
    setHueShift(newHue);
    if (currentLogo?.palette) {
      const newPalette = currentLogo.palette.map((color) => shiftHue(color, newHue));
      setDisplayedPalette(newPalette);
    }
  };

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
              {showColorLogo && displayedPalette && displayedPalette.length > 0 && (
                <>
                  <Slider
                    defaultValue={[0]}
                    max={360}
                    step={1}
                    className="w-full"
                    onValueChange={handleHueChange}
                    value={[hueShift]}
                  />
                  <div className="flex items-center gap-4 flex-wrap justify-center">
                    {displayedPalette.map((color, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div
                          className="w-6 h-6 shrink-0 rounded-full border border-gray-300"
                          style={{ backgroundColor: color }}
                        />
                        <span className="text-sm font-mono text-muted-foreground">
                          {color}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
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

                {/* On Brand Color (Darkened) - Multiple cards for each palette color when color logo exists */}
                {(() => {
                  // Support both old and new structure
                  const colorLogoUrls = currentLogo.colorLogoUrls || (currentLogo.colorLogoUrl ? [currentLogo.colorLogoUrl] : []);
                  const palettes = currentLogo.palettes || (currentLogo.palette ? [currentLogo.palette] : []);
                  const hasColorVersions = colorLogoUrls.length > 0;
                  const currentPalette = palettes[currentColorVersionIndex];

                  if (hasColorVersions && currentPalette && currentPalette.length > 0) {
                    return currentPalette.map((color, index) => {
                      const darkenedColor = darkenColor(color, 0.2);
                      const shouldInvert = isLightColor(darkenedColor);

                      return (
                        <div
                          key={`brand-color-${index}`}
                          className="relative aspect-square flex items-center justify-center"
                          style={{ backgroundColor: darkenedColor }}
                        >
                          {/* Small palette display at top */}
                          <div className="absolute top-2 left-2 flex gap-1">
                            {currentPalette.map((paletteColor, paletteIndex) => (
                              <div
                                key={`palette-dot-${paletteIndex}`}
                                className="w-3 h-3 rounded-full border"
                                style={{
                                  backgroundColor: paletteColor,
                                  borderColor: paletteIndex === index ? 'white' : 'transparent',
                                  borderWidth: paletteIndex === index ? '2px' : '1px'
                                }}
                                title={paletteColor}
                              />
                            ))}
                          </div>

                          <Image
                            src={currentLogo.logoUrl}
                            alt={`Logo on brand color ${index + 1}`}
                            width={200}
                            height={200}
                            className="object-contain w-full h-full"
                            unoptimized={currentLogo.logoUrl.startsWith('data:')}
                            style={{
                              filter: shouldInvert ? 'invert(1)' : 'none',
                              mixBlendMode: shouldInvert ? 'lighten' : 'darken'
                            }}
                          />
                          <p className="absolute bottom-2 left-0 right-0 text-xs text-center text-gray-400">
                            On Brand Color {currentPalette.length > 1 ? index + 1 : ''}
                          </p>
                        </div>
                      );
                    });
                  } else {
                    return (
                      <div
                        className="relative aspect-square flex items-center justify-center"
                        style={{
                          backgroundColor: displayedPalette?.[0] ? darkenColor(displayedPalette[0], 0.2) : '#2563eb'
                        }}
                      >
                        <Image
                          src={currentLogo.logoUrl}
                          alt="Logo on brand color"
                          width={200}
                          height={200}
                          className="object-contain w-full h-full"
                          unoptimized={currentLogo.logoUrl.startsWith('data:')}
                          style={{ mixBlendMode: 'darken' }}
                        />
                        <p className="absolute bottom-2 left-0 right-0 text-xs text-center text-gray-400">On Brand Color</p>
                      </div>
                    );
                  }
                })()}

                {/* Color Logo (if exists) or Generate Button */}
                {(() => {
                  // Support both old and new structure
                  const colorLogoUrls = currentLogo.colorLogoUrls || (currentLogo.colorLogoUrl ? [currentLogo.colorLogoUrl] : []);
                  const hasColorVersions = colorLogoUrls.length > 0;
                  const currentColorUrl = colorLogoUrls[currentColorVersionIndex];

                  if (hasColorVersions && currentColorUrl) {
                    return (
                      <div className="relative aspect-square bg-white border border-gray-200 flex items-center justify-center">
                        <Image
                          src={currentColorUrl}
                          alt="Color logo"
                          width={200}
                          height={200}
                          className="object-contain w-full h-full"
                          unoptimized={currentColorUrl.startsWith('data:')}
                        />
                        <div className="absolute top-2 right-2 flex gap-1">
                          {colorLogoUrls.length > 1 && (
                            <>
                              <Button
                                size="icon"
                                variant="outline"
                                className="h-8 w-8 bg-gray-100"
                                onClick={() => setCurrentColorVersionIndex((currentColorVersionIndex - 1 + colorLogoUrls.length) % colorLogoUrls.length)}
                              >
                                <ChevronLeft className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="outline"
                                className="h-8 w-8 bg-gray-100"
                                onClick={() => setCurrentColorVersionIndex((currentColorVersionIndex + 1) % colorLogoUrls.length)}
                              >
                                <ChevronRight className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-8 w-8 bg-gray-100"
                            onClick={onColorizeLogo}
                            disabled={isColorizing || isGeneratingLogo}
                          >
                            {isColorizing ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <RefreshCw className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                        <p className="absolute bottom-2 left-0 right-0 text-xs text-center text-gray-400">
                          Color Version {colorLogoUrls.length > 1 ? `${currentColorVersionIndex + 1}/${colorLogoUrls.length}` : ''}
                        </p>
                      </div>
                    );
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
              </div>

              {/* Brand Palette Section */}
              {(() => {
                // Support both old and new structure
                const colorLogoUrls = currentLogo.colorLogoUrls || (currentLogo.colorLogoUrl ? [currentLogo.colorLogoUrl] : []);
                const palettes = currentLogo.palettes || (currentLogo.palette ? [currentLogo.palette] : []);
                const hasColorVersions = colorLogoUrls.length > 0;
                const currentPalette = palettes[currentColorVersionIndex];

                if (hasColorVersions && currentPalette && currentPalette.length > 0) {
                  return (
                    <div className="mt-8">
                      <div className="space-y-0">
                        {currentPalette.map((color, colorIndex) => {
                          const darker1 = darkenColor(color, 0.15);
                          const darker2 = darkenColor(color, 0.3);
                          const lighter1 = lightenColor(color, 0.15);
                          const lighter2 = lightenColor(color, 0.3);

                          const shades = [darker2, darker1, color, lighter1, lighter2];

                          return (
                            <div key={`palette-${colorIndex}`}>
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
