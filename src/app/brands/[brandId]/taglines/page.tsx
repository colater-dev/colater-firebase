'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import {
  doc,
  collection,
  serverTimestamp,
  query,
  orderBy,
  updateDoc,
} from 'firebase/firestore';
import { useUser, useFirestore, useDoc, useCollection, addDocumentNonBlocking, useMemoFirebase } from '@/firebase';
import { getTaglineSuggestions, getLogoSuggestion } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, ArrowLeft, Sparkles, Wand2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Brand, Tagline } from '@/lib/types';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';

export default function TaglinesPage() {
  const { brandId } = useParams();
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isGeneratingTaglines, setIsGeneratingTaglines] = useState(false);
  const [isGeneratingLogo, setIsGeneratingLogo] = useState(false);

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
  const { data: taglines, isLoading: isLoadingTaglines } = useCollection<Tagline>(taglinesQuery);

  const handleGenerateTaglines = useCallback(async () => {
    if (!brand || !user) return;
    setIsGeneratingTaglines(true);

    try {
      const suggestionResult = await getTaglineSuggestions(
        brand.latestName,
        brand.latestElevatorPitch,
        brand.latestAudience
      );

      if (suggestionResult.success && suggestionResult.data) {
        const taglinesCollection = collection(firestore, `users/${user.uid}/brands/${brandId}/taglineGenerations`);
        suggestionResult.data.forEach(tagline => {
          addDocumentNonBlocking(taglinesCollection, {
            brandId,
            userId: user.uid,
            tagline,
            createdAt: serverTimestamp(),
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

  const handleGenerateLogo = useCallback(async () => {
    if (!brand || !user) return;
    setIsGeneratingLogo(true);
    try {
      const result = await getLogoSuggestion(brand.latestName, brand.latestElevatorPitch, brand.latestAudience);
      if (result.success && result.data && brandRef) {
        await updateDoc(brandRef, { logoUrl: result.data });
        toast({
          title: 'New logo generated!',
          description: 'Your new brand logo has been saved.',
        });
      } else {
        throw new Error(result.error || 'Failed to get logo suggestion.');
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
  }, [brand, user, brandRef, toast]);


  const handleGenerateAll = () => {
    handleGenerateTaglines();
    if (!brand?.logoUrl) {
      handleGenerateLogo();
    }
  }

  // Effect to generate initial content if it doesn't exist
  useEffect(() => {
    if (brand && !isLoadingTaglines && taglines?.length === 0) {
        handleGenerateTaglines();
    }
  }, [brand, taglines, isLoadingTaglines, handleGenerateTaglines]);

  const isLoading = isLoadingBrand || (isLoadingTaglines && !taglines);

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
              <CardContent>
                <p className="text-sm"><strong>Target Audience:</strong> {brand.latestAudience}</p>
              </CardContent>
            </Card>
            
            <Card>
                <CardHeader className="flex flex-row items-start justify-between">
                    <div className="space-y-1">
                        <CardTitle className="flex items-center gap-2"><Wand2 className="text-primary" /> AI Generated Brand Identity</CardTitle>
                        <CardDescription>Your brand logo and primary tagline.</CardDescription>
                    </div>
                    <Button onClick={handleGenerateLogo} disabled={isGeneratingLogo} size="sm">
                      {isGeneratingLogo ? <><Loader2 className="mr-2 animate-spin"/> ...</> : brand?.logoUrl ? 'Regenerate Logo' : 'Generate Logo'}
                  </Button>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center text-center space-y-4">
                    {isGeneratingLogo && !brand.logoUrl ? (
                        <div className="flex flex-col items-center justify-center h-64 w-64">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <p className="mt-2 text-muted-foreground">Generating your logo...</p>
                        </div>
                    ) : brand.logoUrl ? (
                        <div className="aspect-square bg-muted/50 rounded-lg flex items-center justify-center p-4 w-64 h-64">
                            <Image src={brand.logoUrl} alt="Generated brand logo" width={256} height={256} className="object-contain" />
                        </div>
                    ) : (
                        <div className="text-center flex items-center justify-center h-64 w-64 border-2 border-dashed rounded-lg">
                            <p className="text-muted-foreground">Click the button to generate a logo.</p>
                        </div>
                    )}
                    <h3 className="text-2xl font-bold pt-4">{brand.latestName}</h3>
                    {isLoadingTaglines ? (
                        <Skeleton className="h-6 w-3/4" />
                    ): (
                        <p className="text-lg text-muted-foreground">
                            {taglines && taglines.length > 0 ? taglines[0].tagline : 'Your tagline will appear here.'}
                        </p>
                    )}
                </CardContent>
              </Card>


            <Card>
              <CardHeader className="flex flex-row items-start justify-between">
                <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2"><Sparkles className="text-primary" /> AI Generated Taglines</CardTitle>
                    <CardDescription>More catchy taglines for your brand.</CardDescription>
                </div>
                <Button onClick={handleGenerateTaglines} disabled={isGeneratingTaglines} size="sm">
                    {isGeneratingTaglines ? <><Loader2 className="mr-2 animate-spin"/> ...</> : 'Regenerate'}
                </Button>
              </CardHeader>
              <CardContent>
                {isLoadingTaglines && taglines === null ? (
                    <div className="flex items-center justify-center h-40">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : taglines && taglines.length > 0 ? (
                    <ul className="space-y-4">
                        {taglines.map((item) => (
                            <li key={item.id} className="p-4 bg-muted/50 rounded-lg border">
                                {item.tagline}
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
