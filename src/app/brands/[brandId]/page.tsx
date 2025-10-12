

'use client';

import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import {
  doc,
  collection,
  serverTimestamp,
  query,
  orderBy,
  updateDoc,
  addDoc,
} from 'firebase/firestore';
import { useUser, useFirestore, useDoc, useCollection, useMemoFirebase } from '@/firebase';
import { getTaglineSuggestions, getLogoSuggestion, getColorizedLogo, convertUrlToDataUri } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, ArrowLeft, Sparkles, Wand2, ChevronLeft, ChevronRight, Star, Trash2, Palette, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Brand, Tagline, Logo } from '@/lib/types';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';


// #region Color Conversion Utilities
// These functions handle converting colors between HEX and HSL formats.

/**
 * Converts an HSL color value to RGB. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes h, s, and l are contained in the set [0, 1] and
 * returns r, g, and b in the set [0, 255].
 *
 * @param   {number}  h       The hue
 * @param   {number}  s       The saturation
 * @param   {number}  l       The lightness
 * @return  {Array}           The RGB representation
 */
function hslToRgb(h: number, s: number, l: number){
    let r, g, b;

    if(s == 0){
        r = g = b = l; // achromatic
    }else{
        const hue2rgb = (p: number, q: number, t: number) => {
            if(t < 0) t += 1;
            if(t > 1) t -= 1;
            if(t < 1/6) return p + (q - p) * 6 * t;
            if(t < 1/2) return q;
            if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        }

        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

/**
 * Converts an RGB color value to HSL. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes r, g, and b are contained in the set [0, 255] and
 * returns h, s, and l in the set [0, 1].
 *
 * @param   {number}  r       The red color value
 * @param   {number}  g       The green color value
 * @param   {number}  b       The blue color value
 * @return  {Array}           The HSL representation
 */
function rgbToHsl(r: number, g: number, b: number){
    r /= 255, g /= 255, b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s, l = (max + min) / 2;

    if(max == min){
        h = s = 0; // achromatic
    }else{
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch(max){
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return [h, s, l];
}


function hexToRgb(hex: string) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function rgbToHex(r: number, g: number, b: number) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).padStart(6, '0');
}

function shiftHue(hex: string, degrees: number) {
    const rgb = hexToRgb(hex);
    if (!rgb) return hex;

    const [h, s, l] = rgbToHsl(rgb.r, rgb.g, rgb.b);
    
    let newHue = (h + degrees / 360) % 1;
    if (newHue < 0) {
        newHue += 1;
    }

    const [newR, newG, newB] = hslToRgb(newHue, s, l);
    return rgbToHex(newR, newG, newB);
}

// #endregion


export default function BrandPage() {
  const { brandId } = useParams();
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isGeneratingTaglines, setIsGeneratingTaglines] = useState(false);
  const [isGeneratingLogo, setIsGeneratingLogo] = useState(false);
  const [isColorizing, setIsColorizing] = useState(false);
  const [currentLogoIndex, setCurrentLogoIndex] = useState(0);
  const [showColorLogo, setShowColorLogo] = useState(true);
  const [hueShift, setHueShift] = useState(0);
  const [displayedPalette, setDisplayedPalette] = useState<string[] | undefined>(undefined);

  const brandRef = useMemoFirebase(
    () => user ? doc(firestore, `users/${user.uid}/brands`, brandId as string) : null,
    [user, firestore, brandId]
  );
  const { data: brand, isLoading: isLoadingBrand } = useDoc<Brand>(brandRef);

  const taglinesQuery = useMemoFirebase(
    () => user ? query(
        collection(firestore, `users/${user.uid}/brands/${brandId}/taglineGenerations`),
        orderBy('createdAt', 'desc')
    ) : null,
    [user, firestore, brandId]
  );
  const { data: allTaglines, isLoading: isLoadingTaglines } = useCollection<Tagline>(taglinesQuery);

  const logosQuery = useMemoFirebase(
    () => user ? query(
        collection(firestore, `users/${user.uid}/brands/${brandId}/logoGenerations`),
        orderBy('createdAt', 'asc') // Sort oldest to newest
    ) : null,
    [user, firestore, brandId]
  );
  const { data: logos, isLoading: isLoadingLogos } = useCollection<Logo>(logosQuery);

  const currentLogo = logos?.[currentLogoIndex];

  const handleGenerateTaglines = useCallback(async () => {
    if (!brand || !user) return;
    setIsGeneratingTaglines(true);

    try {
      const suggestionResult = await getTaglineSuggestions(
        brand.latestName,
        brand.latestElevatorPitch,
        brand.latestAudience,
        brand.latestDesirableCues,
        brand.latestUndesirableCues
      );

      if (suggestionResult.success && suggestionResult.data) {
        const taglinesCollection = collection(firestore, `users/${user.uid}/brands/${brandId}/taglineGenerations`);
        suggestionResult.data.forEach(tagline => {
          addDocumentNonBlocking(taglinesCollection, {
            brandId,
            userId: user.uid,
            tagline,
            createdAt: serverTimestamp(),
            status: 'generated',
          });
        });
        toast({
            title: 'New taglines generated!',
            description: 'They have been added to your list.',
        });
      } else {
        throw new Error(suggestionResult.error || 'Failed to get tagline suggestions.');
      }
    } catch (error) {
      console.error('Error generating taglines:', error);
      toast({
        variant: 'destructive',
        title: 'Tagline Generation Failed',
        description: (error instanceof Error) ? error.message : 'Could not generate new taglines.',
      });
    } finally {
      setIsGeneratingTaglines(false);
    }
  }, [brand, user, brandId, firestore, toast]);

    // Automatically generate taglines if there are none.
  useEffect(() => {
    if (
      !isLoadingTaglines &&
      allTaglines &&
      allTaglines.length === 0 &&
      brand &&
      user &&
      !isGeneratingTaglines
    ) {
      handleGenerateTaglines();
    }
  }, [isLoadingTaglines, allTaglines, brand, user, handleGenerateTaglines, isGeneratingTaglines]);


  const handleGenerateLogo = useCallback(async () => {
    if (!brand || !user || !firestore) return;
    setIsGeneratingLogo(true);
    try {
      const result = await getLogoSuggestion(
        brand.latestName,
        brand.latestElevatorPitch,
        brand.latestAudience,
        brand.latestDesirableCues,
        brand.latestUndesirableCues,
        user.uid
      );
      if (result.success && result.data) {
        const logoData = {
          brandId,
          userId: user.uid,
          logoUrl: result.data,
          createdAt: serverTimestamp(),
        };
        const logosCollection = collection(firestore, `users/${user.uid}/brands/${brandId}/logoGenerations`);
        await addDoc(logosCollection, logoData);
        
        toast({
          title: "New logo generated!",
          description: "Your new brand logo has been saved.",
        });
      } else {
        throw new Error(result.error || "Failed to generate and save logo.");
      }
    } catch (error) {
        console.error('Error generating logo:', error);
        toast({
            variant: 'destructive',
            title: 'Logo Generation Failed',
            description: (error instanceof Error) ? error.message : 'Could not generate a new logo.',
        });
    } finally {
        setIsGeneratingLogo(false);
    }
  }, [brand, user, brandId, firestore, toast]);

  // Automatically generate a logo if there are none.
  useEffect(() => {
    if (
      !isLoadingLogos &&
      logos &&
      logos.length === 0 &&
      brand &&
      user &&
      !isGeneratingLogo
    ) {
      handleGenerateLogo();
    }
  }, [isLoadingLogos, logos, brand, user, handleGenerateLogo, isGeneratingLogo]);

  const handleColorizeLogo = useCallback(async () => {
    if (!currentLogo || !user || !firestore || !brand) return;
    setIsColorizing(true);
    try {
      // First, convert the storage URL to a data URI
      const dataUriResult = await convertUrlToDataUri(currentLogo.logoUrl);
      if (!dataUriResult.success || !dataUriResult.data) {
        throw new Error(dataUriResult.error || "Failed to prepare image for colorization.");
      }

      const result = await getColorizedLogo({
        logoUrl: dataUriResult.data, // Pass the data URI to the AI
        name: brand.latestName,
        elevatorPitch: brand.latestElevatorPitch,
        audience: brand.latestAudience,
        desirableCues: brand.latestDesirableCues,
        undesirableCues: brand.latestUndesirableCues,
      }, user.uid);

      if (result.success && result.data) {
        const logoRef = doc(firestore, `users/${user.uid}/brands/${brandId}/logoGenerations`, currentLogo.id);
        await updateDoc(logoRef, {
            colorLogoUrl: result.data.colorLogoUrl,
            palette: result.data.palette
        });
        setDisplayedPalette(result.data.palette);
        setShowColorLogo(true);
        toast({
            title: "Logo colorized!",
            description: "A color version of your logo has been generated.",
        });
      } else {
        throw new Error(result.error || "Failed to colorize logo.");
      }
    } catch (error) {
        console.error('Error colorizing logo:', error);
        toast({
            variant: 'destructive',
            title: 'Colorization Failed',
            description: (error instanceof Error) ? error.message : 'Could not colorize the logo.',
        });
    } finally {
        setIsColorizing(false);
    }
  }, [currentLogo, user, brand, firestore, toast, brandId]);


  const handleTaglineStatusUpdate = useCallback(async (taglineId: string, status: 'liked' | 'disliked') => {
    if (!user) return;
    const taglineRef = doc(firestore, `users/${user.uid}/brands/${brandId}/taglineGenerations`, taglineId);
    try {
        await updateDoc(taglineRef, { status });
    } catch (error) {
        console.error(`Error updating tagline ${taglineId} status:`, error);
        toast({
            variant: 'destructive',
            title: 'Update Failed',
            description: 'Could not update the tagline status.',
        });
    }
  }, [user, firestore, brandId, toast]);
  
  const visibleTaglines = useMemo(() => {
    return allTaglines?.filter(t => t.status !== 'disliked') ?? [];
  }, [allTaglines]);
  
  const likedTagline = useMemo(() => {
    return visibleTaglines.find(t => t.status === 'liked');
  }, [visibleTaglines]);

  const primaryTagline = useMemo(() => {
    const liked = likedTagline;
    if (liked) return liked.tagline;
    if (visibleTaglines.length > 0) return visibleTaglines[0].tagline;
    return 'Your tagline will appear here.';
  }, [visibleTaglines, likedTagline]);

  // When logos load or a new one is added, set index to the newest one (the last one).
  useEffect(() => {
    if (logos && logos.length > 0) {
      setCurrentLogoIndex(logos.length - 1);
    }
  }, [logos?.length]); // Depend on the count of logos
  
  useEffect(() => {
    if (currentLogo?.palette) {
        setHueShift(0); // Reset slider on logo change
        handleHueChange([0]); // Update palette display
    } else {
        setDisplayedPalette(undefined);
    }
  }, [currentLogo, currentLogo?.palette]);
  
  const handleHueChange = (value: number[]) => {
    const newHue = value[0];
    setHueShift(newHue);
    if (currentLogo?.palette) {
        const newPalette = currentLogo.palette.map(color => shiftHue(color, newHue));
        setDisplayedPalette(newPalette);
    }
  };

  // Effect to update the brand's primary logoUrl when the paginated logo changes
  useEffect(() => {
    if (logos && logos.length > 0 && brandRef && currentLogo) {
        const logoToDisplay = (showColorLogo && currentLogo.colorLogoUrl) ? currentLogo.colorLogoUrl : currentLogo.logoUrl;
        if (logoToDisplay !== brand?.logoUrl) {
            updateDoc(brandRef, { logoUrl: logoToDisplay });
        }
    }
  }, [logos, currentLogoIndex, brandRef, brand?.logoUrl, currentLogo, showColorLogo]);
  
  const isLoading = isLoadingBrand || (isLoadingTaglines && !allTaglines);

  const displayLogoUrl = currentLogo ? (showColorLogo && currentLogo.colorLogoUrl) ? currentLogo.colorLogoUrl : currentLogo.logoUrl : null;

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-8">
      <header className="max-w-4xl mx-auto mb-8">
        <Button variant="ghost" asChild>
            <Link href="/dashboard"><ArrowLeft className="mr-2" /> Back to Dashboard</Link>
        </Button>
      </header>
      
      <main className="max-w-4xl mx-auto">
        {isLoading && (
             <div className="text-center">
                <Loader2 className="mx-auto w-8 h-8 animate-spin text-primary" />
                <p className="text-muted-foreground mt-2">Loading brand details...</p>
            </div>
        )}

        {!isLoading && !brand && (
            <Card className="text-center p-8">
                <CardTitle>Brand Not Found</CardTitle>
                <CardDescription className="mt-2">We couldn't find the brand you're looking for.</CardDescription>
            </Card>
        )}

        {brand && (
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-3xl font-bold">{brand.latestName}</CardTitle>
                <CardDescription>
                  {brand.latestElevatorPitch}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm"><strong>Target Audience:</strong> {brand.latestAudience}</p>
                {brand.latestDesirableCues && <p className="text-sm"><strong>Desirable Cues:</strong> {brand.latestDesirableCues}</p>}
                {brand.latestUndesirableCues && <p className="text-sm"><strong>Undesirable Cues:</strong> {brand.latestUndesirableCues}</p>}
              </CardContent>
            </Card>
            
            <Card>
                <CardHeader className="flex flex-row items-start justify-between">
                    <div className="space-y-1">
                        <CardTitle className="flex items-center gap-2"><Wand2 className="text-primary" /> AI Generated Brand Identity</CardTitle>
                        <CardDescription>Your brand logo and primary tagline.</CardDescription>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={handleColorizeLogo} disabled={isColorizing || !currentLogo || isGeneratingLogo}>
                            {isColorizing ? <><Loader2 className="mr-2 animate-spin"/> Colorizing...</> : <><Palette className="mr-2" /> Colorise</>}
                        </Button>
                        <Button onClick={handleGenerateLogo} disabled={isGeneratingLogo}>
                          {isGeneratingLogo ? <><Loader2 className="mr-2 animate-spin"/> Generating...</> : 'Another Logo'}
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center text-center space-y-6">
                    
                    <div className="flex flex-col md:flex-row items-center justify-center w-full gap-8">
                        {isLoadingLogos && !logos ? (
                            <div className="flex flex-col items-center justify-center h-40 w-40">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                <p className="mt-2 text-muted-foreground">Loading logos...</p>
                            </div>
                        ) : isGeneratingLogo && !currentLogo ? (
                            <div className="flex flex-col items-center justify-center h-40 w-40">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                <p className="mt-2 text-muted-foreground">Generating your logo...</p>
                            </div>
                        ) : displayLogoUrl ? (
                            <div className="aspect-square rounded-lg flex items-center justify-center p-4 w-40 h-40">
                                <Image 
                                  src={displayLogoUrl} 
                                  alt="Generated brand logo" 
                                  width={160} 
                                  height={160} 
                                  className="object-contain" 
                                  unoptimized={displayLogoUrl.startsWith('data:')}
                                  style={{ filter: showColorLogo && currentLogo?.colorLogoUrl ? `hue-rotate(${hueShift}deg)` : 'none' }}
                                />
                            </div>
                        ) : (
                             !isGeneratingLogo && (
                                <div className="text-center flex items-center justify-center h-40 w-40 border-2 border-dashed rounded-lg">
                                    <p className="text-muted-foreground">Click the button to generate a logo.</p>
                                </div>
                            )
                        )}
                        
                        <div className="flex flex-col gap-2 text-center md:text-left">
                           <h3 className="text-4xl font-bold">{brand.latestName}</h3>
                            {isLoadingTaglines ? (
                                <Skeleton className="h-6 w-3/4 mx-auto md:mx-0" />
                            ): (
                                <p className="text-lg text-muted-foreground">
                                    {primaryTagline}
                                </p>
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
                                {showColorLogo && displayedPalette && (
                                    <>
                                        <Slider
                                            defaultValue={[0]}
                                            max={360}
                                            step={1}
                                            className="w-full"
                                            onValueChange={handleHueChange}
                                            value={[hueShift]}
                                        />
                                        <div className="flex items-center gap-4">
                                            {displayedPalette.map((color, index) => (
                                                <div key={index} className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-full border" style={{ backgroundColor: color }} />
                                                    <span className="text-sm font-mono text-muted-foreground">{color}</span>
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
                                    <Button variant="outline" size="icon" onClick={() => setCurrentLogoIndex(prev => Math.max(0, prev - 1))} disabled={currentLogoIndex === 0}>
                                        <ChevronLeft />
                                    </Button>
                                    <Button variant="outline" size="icon" onClick={() => setCurrentLogoIndex(prev => Math.min(logos.length - 1, prev + 1))} disabled={currentLogoIndex === logos.length - 1}>
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


            <Card>
              <CardHeader className="flex flex-row items-start justify-between">
                <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2"><Sparkles className="text-primary" /> AI Generated Taglines</CardTitle>
                    <CardDescription>More catchy taglines for your brand.</CardDescription>
                </div>
                <Button onClick={handleGenerateTaglines} disabled={isGeneratingTaglines} size="sm">
                    {isGeneratingTaglines ? <><Loader2 className="mr-2 animate-spin"/> Generating...</> : <><Plus className="mr-2"/>New Tagline</>}
                </Button>
              </CardHeader>
              <CardContent>
                {isLoadingTaglines && visibleTaglines.length === 0 ? (
                    <div className="flex items-center justify-center h-40">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : visibleTaglines.length > 0 ? (
                    <ul className="space-y-4">
                        {visibleTaglines.map((item) => (
                            <li key={item.id} className="group flex items-center justify-between p-4 bg-muted/50 rounded-lg border">
                                <span>{item.tagline}</span>
                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button size="icon" variant="ghost" onClick={() => handleTaglineStatusUpdate(item.id, 'liked')}>
                                        <Star className={cn("h-5 w-5", item.status === 'liked' ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground')} />
                                    </Button>
                                     <Button size="icon" variant="ghost" onClick={() => handleTaglineStatusUpdate(item.id, 'disliked')}>
                                        <Trash2 className="h-5 w-5 text-muted-foreground hover:text-destructive" />
                                    </Button>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="text-center py-10 border-2 border-dashed rounded-lg">
                        <p className="text-muted-foreground">No taglines generated yet. Click the button to start.</p>
                    </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
