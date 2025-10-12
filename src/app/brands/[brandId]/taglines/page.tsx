'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  doc,
  collection,
  serverTimestamp,
  query,
  orderBy
} from 'firebase/firestore';
import { useUser, useFirestore, useDoc, useCollection, addDocumentNonBlocking, useMemoFirebase } from '@/firebase';
import { getTaglineSuggestions } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, ArrowLeft, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Brand, Tagline } from '@/lib/types';
import Link from 'next/link';

export default function TaglinesPage() {
  const { brandId } = useParams();
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);

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

  const handleGenerate = async () => {
    if (!brand) return;
    setIsGenerating(true);

    try {
      const suggestionResult = await getTaglineSuggestions(
        brand.latestName,
        brand.latestElevatorPitch,
        brand.latestAudience
      );

      if (suggestionResult.success && suggestionResult.data) {
        const taglinesCollection = collection(firestore, `users/${user.uid}/brands/${brandId}/taglineGenerations`);
        for (const tagline of suggestionResult.data) {
          addDocumentNonBlocking(taglinesCollection, {
            brandId: brandId,
            userId: user.uid,
            tagline: tagline,
            createdAt: serverTimestamp(),
          });
        }
        toast({
            title: 'New taglines generated!',
            description: 'They have been added to your list.',
        });
      } else {
        throw new Error(suggestionResult.error || 'Failed to get suggestions.');
      }
    } catch (error) {
      console.error('Error generating taglines:', error);
      toast({
        variant: 'destructive',
        title: 'Generation Failed',
        description: (error instanceof Error) ? error.message : 'Could not generate new taglines.',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Effect to generate initial taglines if none exist
  useEffect(() => {
    if (brand && taglines?.length === 0 && !isLoadingTaglines) {
        handleGenerate();
    }
  }, [brand, taglines, isLoadingTaglines]);

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
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2"><Sparkles className="text-primary" /> AI Generated Taglines</CardTitle>
                    <CardDescription>Here are some catchy taglines for your brand.</CardDescription>
                </div>
                <Button onClick={handleGenerate} disabled={isGenerating}>
                    {isGenerating ? <><Loader2 className="mr-2 animate-spin"/> Generating...</> : 'Generate More'}
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
