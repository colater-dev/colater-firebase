'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { ChevronLeft, ChevronRight, Share2 } from 'lucide-react';
import { BRAND_FONTS } from '@/config/brand-fonts';
import { shiftHue, darkenColor, isLightColor, lightenColor } from '@/lib/color-utils';
import { ShaderLoader } from '@/components/ui/shader-loader';
import type { Logo } from '@/lib/types';
import { BrandApplications } from './brand-applications';
import { BrandIdentityHeader } from './brand-identity-header';
import { LogoShowcase } from './logo-showcase';
import { useToast } from '@/hooks/use-toast';

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
  onGenerateLogo: (provider: 'gemini' | 'openai' | 'ideogram' | 'reve' | 'nano-banana') => void;
  onColorizeLogo: () => void;
  onLogoIndexChange: (index: number) => void;
  onCritiqueLogo: () => void;
  isCritiquing: boolean;
  selectedBrandFont: string;
  onFontChange: (font: string) => void;
  onSaveDisplaySettings?: (logoId: string, settings: Logo['displaySettings']) => void;
  onMakeLogoPublic?: (logoId: string) => Promise<void>;
  readOnly?: boolean;
  selectedProvider: 'gemini' | 'openai' | 'ideogram' | 'reve' | 'nano-banana';
  setSelectedProvider: (provider: 'gemini' | 'openai' | 'ideogram' | 'reve' | 'nano-banana') => void;
  onSaveExternalMedia?: (logoId: string, url: string) => void;
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
  selectedBrandFont,
  onFontChange,
  onSaveDisplaySettings,
  onMakeLogoPublic,
  readOnly = false,
  selectedProvider,
  setSelectedProvider,
  onSaveExternalMedia,
}: BrandIdentityCardProps) {
  const { toast } = useToast();

  const [showCritique, setShowCritique] = useState(false);
  const [expandedPointId, setExpandedPointId] = useState<string | null>(null);
  const [hueShifts, setHueShifts] = useState<Record<number, number>>({});
  const [displayedPalette, setDisplayedPalette] = useState<string[] | undefined>(
    undefined
  );
  const [logoScale, setLogoScale] = useState(1);
  const [logoTextGap, setLogoTextGap] = useState(50);
  const [logoTextBalance, setLogoTextBalance] = useState(50);
  const [logoLayout, setLogoLayout] = useState<'horizontal' | 'vertical'>('horizontal');
  const [logoBrightness, setLogoBrightness] = useState(100);
  const [logoContrast, setLogoContrast] = useState(120);
  const [showBrandName, setShowBrandName] = useState(true);
  const [invertLogo, setInvertLogo] = useState(false);
  const [textTransform, setTextTransform] = useState<'none' | 'lowercase' | 'capitalize' | 'uppercase'>('none');
  const [externalMediaUrl, setExternalMediaUrl] = useState('');
  const [isSavingMedia, setIsSavingMedia] = useState(false);

  const [animationType, setAnimationType] = useState<'fade' | 'slide' | 'scale' | 'blur' | null>(null);
  const [animationKey, setAnimationKey] = useState(0);

  const triggerAnimation = (type: 'fade' | 'slide' | 'scale' | 'blur') => {
    setAnimationType(type);
    setAnimationKey(prev => prev + 1);
  };


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

  const handleShareLogo = async () => {
    if (!currentLogo) return;

    // Check if logo is already public, if not make it public first
    if (!currentLogo.isPublic && onMakeLogoPublic) {
      try {
        await onMakeLogoPublic(currentLogo.id);
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Failed to share',
          description: 'Could not make logo public. Please try again.',
        });
        return;
      }
    }

    const url = `${window.location.origin}/brands/${currentLogo.brandId}/logos/${currentLogo.id}`;
    navigator.clipboard.writeText(url);
    toast({
      title: 'Link copied!',
      description: 'Anyone with this link can now view this logo.',
    });
  };

  // Load display settings from current logo
  useEffect(() => {
    if (currentLogo?.displaySettings) {
      setLogoLayout(currentLogo.displaySettings.layout);
      setTextTransform(currentLogo.displaySettings.textTransform);
      setShowBrandName(currentLogo.displaySettings.showBrandName);
      setInvertLogo(currentLogo.displaySettings.invertLogo);
      setLogoTextGap(currentLogo.displaySettings.logoTextGap);
      setLogoTextBalance(currentLogo.displaySettings.logoTextBalance);
      setLogoBrightness(currentLogo.displaySettings.logoBrightness);
      setLogoTextBalance(currentLogo.displaySettings.logoTextBalance);
      setLogoBrightness(currentLogo.displaySettings.logoBrightness);
      setLogoContrast(currentLogo.displaySettings.logoContrast);
    }
    if (currentLogo?.externalMediaUrl) {
      setExternalMediaUrl(currentLogo.externalMediaUrl);
    } else {
      setExternalMediaUrl('');
    }
  }, [currentLogo?.id]);

  // Debounced save of display settings
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  useEffect(() => {
    if (!currentLogo || !onSaveDisplaySettings) return;

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Debounce save by 500ms
    saveTimeoutRef.current = setTimeout(() => {
      const settings = {
        layout: logoLayout,
        textTransform,
        showBrandName,
        invertLogo,
        logoTextGap,
        logoTextBalance,
        logoBrightness,
        logoContrast,
      };
      onSaveDisplaySettings(currentLogo.id, settings);
    }, 500);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [currentLogo?.id, logoLayout, textTransform, showBrandName, invertLogo, logoTextGap, logoTextBalance, logoBrightness, logoContrast, onSaveDisplaySettings]);


  // Reset hue shifts when logo changes
  useEffect(() => {
    setHueShifts({});

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

  return (
    <Card className="w-full">
      {!readOnly && (
        <BrandIdentityHeader
          isGeneratingConcept={isGeneratingConcept}
          onGenerateConcept={onGenerateConcept}
          logoConcept={logoConcept}
          onConceptChange={onConceptChange}
          selectedProvider={selectedProvider}
          setSelectedProvider={setSelectedProvider}
          isGeneratingLogo={isGeneratingLogo}
          onGenerateLogo={onGenerateLogo}
          showCritique={showCritique}
          setShowCritique={setShowCritique}
          isCritiquing={isCritiquing}
          onCritiqueLogo={onCritiqueLogo}
          currentLogo={currentLogo}
          selectedBrandFont={selectedBrandFont}
          onFontChange={onFontChange}
          onShareLogo={handleShareLogo}
        />
      )}
      <CardContent className="flex flex-col items-center justify-center text-center space-y-6 p-0">
        <div className="w-full space-y-4 pt-6 flex flex-col items-center">
          {/* Logo Applications Showcase */}
          {currentLogo?.logoUrl && (
            <LogoShowcase
              currentLogo={currentLogo}
              brandName={brandName}
              selectedBrandFont={selectedBrandFont}
              showCritique={showCritique}
              expandedPointId={expandedPointId}
              setExpandedPointId={setExpandedPointId}
              hueShifts={hueShifts}
              setHueShifts={setHueShifts}
              cardModes={cardModes}
              cycleCardMode={cycleCardMode}
              getCardMode={getCardMode}
              getModeStyles={getModeStyles}
              onColorizeLogo={onColorizeLogo}
              isColorizing={isColorizing}
              isGeneratingLogo={isGeneratingLogo}
              logoLayout={logoLayout}
              setLogoLayout={setLogoLayout}
              textTransform={textTransform}
              setTextTransform={setTextTransform}
              animationType={animationType}
              triggerAnimation={triggerAnimation}
              animationKey={animationKey}
              showBrandName={showBrandName}
              setShowBrandName={setShowBrandName}
              invertLogo={invertLogo}
              setInvertLogo={setInvertLogo}
              logoTextGap={logoTextGap}
              setLogoTextGap={setLogoTextGap}
              logoTextBalance={logoTextBalance}
              setLogoTextBalance={setLogoTextBalance}
              logoBrightness={logoBrightness}
              setLogoBrightness={setLogoBrightness}
              logoContrast={logoContrast}
              setLogoContrast={setLogoContrast}
              readOnly={readOnly}
              // External Media Props
              externalMediaUrl={externalMediaUrl}
              onExternalMediaChange={setExternalMediaUrl}
              isSavingMedia={isSavingMedia}
              onExternalMediaBlur={() => {
                if (currentLogo && externalMediaUrl !== currentLogo.externalMediaUrl && onSaveExternalMedia) {
                  setIsSavingMedia(true);
                  onSaveExternalMedia(currentLogo.id, externalMediaUrl);
                  setTimeout(() => setIsSavingMedia(false), 1000);
                }
              }}
              onFileUpload={async (file) => {
                if (!file || !onSaveExternalMedia) return;

                try {
                  setIsSavingMedia(true);
                  const { getPresignedUploadUrl } = await import('@/app/actions/upload-media');

                  // 1. Get presigned URL
                  const result = await getPresignedUploadUrl(file.type, file.name);
                  if (!result.success || !result.url || !result.publicUrl) {
                    throw new Error(result.error || 'Failed to get upload URL');
                  }

                  // 2. Upload file
                  const uploadResponse = await fetch(result.url, {
                    method: 'PUT',
                    body: file,
                    headers: {
                      'Content-Type': file.type,
                    },
                  });

                  if (!uploadResponse.ok) {
                    throw new Error('Failed to upload file');
                  }

                  // 3. Save URL
                  setExternalMediaUrl(result.publicUrl);
                  onSaveExternalMedia(currentLogo.id, result.publicUrl);

                  toast({
                    title: 'Upload Successful',
                    description: 'File uploaded and saved.',
                  });
                } catch (error) {
                  console.error('Upload error:', error);
                  toast({
                    variant: 'destructive',
                    title: 'Upload Failed',
                    description: 'Could not upload file. Please check your R2 credentials.',
                  });
                } finally {
                  setIsSavingMedia(false);
                }
              }}
            />
          )}

          {/* Brand Applications Section */}
          {currentLogo?.logoUrl && (() => {
            // Determine primary color from palette or fallback
            const colorVersions = currentLogo.colorVersions || [];
            let primaryColor = '#000000';

            if (colorVersions.length > 0 && colorVersions[0].palette.length > 0) {
              primaryColor = colorVersions[0].palette[0];
            } else if (currentLogo.palette && currentLogo.palette.length > 0) {
              primaryColor = currentLogo.palette[0];
            }

            // Apply hue shift if applicable
            if (colorVersions.length > 0) {
              const currentHueShift = hueShifts[0] || 0;
              primaryColor = shiftHue(primaryColor, currentHueShift);
            }

            return (
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4 px-4 py-2 bg-gray-50 rounded-lg border border-gray-100 w-fit self-end">
                  <Slider
                    value={[logoScale]}
                    onValueChange={(value) => setLogoScale(value[0])}
                    min={1}
                    max={2.0}
                    step={0.01}
                    className="w-32"
                  />
                  <span className="text-xs font-mono text-gray-400 w-8 text-right">{logoScale.toFixed(2)}x</span>
                </div>
                <BrandApplications
                  logoUrl={currentLogo.logoUrl}
                  brandName={brandName}
                  tagline={primaryTagline}
                  primaryColor={primaryColor}
                  fontVariable={BRAND_FONTS.find(f => f.name === selectedBrandFont)?.variable || 'sans-serif'}
                  palette={colorVersions.length > 0 ? colorVersions[0].palette : currentLogo.palette || []}
                  logoScale={logoScale}
                />
              </div>
            );
          })()}

          {/* Brand Palette Section - Show all color version palettes with hue shifts */}
          {currentLogo?.logoUrl && (() => {
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


      </CardContent>
    </Card>
  );
}
