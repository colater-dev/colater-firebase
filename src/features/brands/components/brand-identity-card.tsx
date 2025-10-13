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
import {
  Loader2,
  Wand2,
  Palette,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { shiftHue } from '@/lib/color-utils';
import type { Logo } from '@/lib/types';

interface BrandIdentityCardProps {
  brandName: string;
  primaryTagline: string;
  logos: Logo[] | null;
  currentLogoIndex: number;
  isLoadingLogos: boolean;
  isGeneratingLogo: boolean;
  isColorizing: boolean;
  isLoadingTaglines: boolean;
  onGenerateLogo: () => void;
  onColorizeLogo: () => void;
  onLogoIndexChange: (index: number) => void;
}

export function BrandIdentityCard({
  brandName,
  primaryTagline,
  logos,
  currentLogoIndex,
  isLoadingLogos,
  isGeneratingLogo,
  isColorizing,
  isLoadingTaglines,
  onGenerateLogo,
  onColorizeLogo,
  onLogoIndexChange,
}: BrandIdentityCardProps) {
  const [showColorLogo, setShowColorLogo] = useState(true);
  const [hueShift, setHueShift] = useState(0);
  const [displayedPalette, setDisplayedPalette] = useState<string[] | undefined>(
    undefined
  );
  const [contrast, setContrast] = useState(100);

  const currentLogo = logos?.[currentLogoIndex];

  // Reset hue shift when logo changes
  useEffect(() => {
    if (currentLogo?.palette) {
      setHueShift(0);
      setContrast(100);
      // Initialize displayedPalette with the original palette when logo changes
      setDisplayedPalette(currentLogo.palette);
    } else {
      setDisplayedPalette(undefined);
    }
  }, [currentLogo, currentLogo?.palette]);

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
    <Card>
      <CardHeader className="flex flex-row items-start justify-between">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="text-primary" /> AI Generated Brand Identity
          </CardTitle>
          <CardDescription>Your brand logo and primary tagline.</CardDescription>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={onColorizeLogo}
            disabled={isColorizing || !currentLogo || isGeneratingLogo}
          >
            {isColorizing ? (
              <>
                <Loader2 className="mr-2 animate-spin" />
                Colorizing...
              </>
            ) : (
              <>
                <Palette className="mr-2" /> Colorise
              </>
            )}
          </Button>
          <Button onClick={onGenerateLogo} disabled={isGeneratingLogo}>
            {isGeneratingLogo ? (
              <>
                <Loader2 className="mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              'Another Logo'
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center text-center space-y-6">
        <div className="flex flex-col md:flex-row items-center justify-center w-full gap-8">
          {isLoadingLogos && !logos ? (
            <div className="flex flex-col items-center justify-center h-80 w-80">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="mt-2 text-muted-foreground">Loading logos...</p>
            </div>
          ) : isGeneratingLogo && !currentLogo ? (
            <div className="flex flex-col items-center justify-center h-80 w-80">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="mt-2 text-muted-foreground">Generating your logo...</p>
            </div>
          ) : displayLogoUrl ? (
            <div className="aspect-square rounded-lg flex items-center justify-center p-4 w-80 h-80">
              <Image
                src={displayLogoUrl}
                alt="Generated brand logo"
                width={320}
                height={320}
                className="object-contain"
                unoptimized={displayLogoUrl.startsWith('data:')}
                style={{
                  filter:
                    showColorLogo && currentLogo?.colorLogoUrl
                      ? `hue-rotate(${hueShift}deg) contrast(${contrast}%)`
                      : 'none',
                }}
              />
            </div>
          ) : (
            !isGeneratingLogo && (
              <div className="text-center flex items-center justify-center h-80 w-80 border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground">
                  Click the button to generate a logo.
                </p>
              </div>
            )
          )}

          <div className="flex flex-col gap-2 text-center md:text-left">
            <h3 className="text-4xl font-bold">{brandName}</h3>
            {isLoadingTaglines ? (
              <Skeleton className="h-6 w-3/4 mx-auto md:mx-0" />
            ) : (
              <p className="text-lg text-muted-foreground">{primaryTagline}</p>
            )}
          </div>
        </div>

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
          {logos && logos.length > 1 && (
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center justify-center w-full gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onLogoIndexChange(Math.max(0, currentLogoIndex - 1))}
                  disabled={currentLogoIndex === 0}
                >
                  <ChevronLeft />
                </Button>
                <Button
                  variant="outline"
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
