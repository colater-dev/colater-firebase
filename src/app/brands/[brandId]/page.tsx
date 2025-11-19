'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  collection,
  serverTimestamp,
  query,
  orderBy,
  updateDoc,
  addDoc,
  doc,
  writeBatch,
  getDocs,
} from 'firebase/firestore';
import { useUser, useFirestore, useDoc, useCollection, useMemoFirebase, useFirebase } from '@/firebase';
import {
  getTaglineSuggestions,
  getLogoSuggestion,
  getLogoSuggestionOpenAI,
  getColorizedLogo,
  convertUrlToDataUri,
} from '@/app/actions';
import { uploadDataUriToStorageClient } from '@/lib/client-storage';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { createBrandService } from '@/services';
import { BrandHeader, BrandIdentityCard, TaglinesList } from '@/features/brands/components';
import { ContentCard } from '@/components/layout';
import type { Brand, Tagline, Logo } from '@/lib/types';

export default function BrandPage() {
  const { brandId } = useParams();
  const { user } = useUser();
  const firestore = useFirestore();
  const { storage } = useFirebase();
  const { toast } = useToast();
  const [isGeneratingTaglines, setIsGeneratingTaglines] = useState(false);
  const [isGeneratingLogo, setIsGeneratingLogo] = useState(false);
  const [isGeneratingLogoOpenAI, setIsGeneratingLogoOpenAI] = useState(false);
  const [isColorizing, setIsColorizing] = useState(false);
  const [currentLogoIndex, setCurrentLogoIndex] = useState(0);

  // Initialize service
  const brandService = useMemo(() => createBrandService(firestore), [firestore]);

  // Fetch brand data
  const brandRef = useMemoFirebase(
    () =>
      user
        ? brandService.getBrandDoc(user.uid, brandId as string)
        : null,
    [user, brandService, brandId]
  );
  const { data: brand, isLoading: isLoadingBrand } = useDoc<Brand>(brandRef);

  // Fetch taglines
  const taglinesQuery = useMemoFirebase(
    () =>
      user
        ? query(
          collection(
            firestore,
            `users/${user.uid}/brands/${brandId}/taglineGenerations`
          ),
          orderBy('createdAt', 'desc')
        )
        : null,
    [user, firestore, brandId]
  );
  const { data: allTaglines, isLoading: isLoadingTaglines } =
    useCollection<Tagline>(taglinesQuery);

  // Fetch logos
  const logosQuery = useMemoFirebase(
    () =>
      user
        ? query(
          collection(firestore, `users/${user.uid}/brands/${brandId}/logoGenerations`),
          orderBy('createdAt', 'asc')
        )
        : null,
    [user, firestore, brandId]
  );
  const { data: logos, isLoading: isLoadingLogos } = useCollection<Logo>(logosQuery);

  const currentLogo = logos?.[currentLogoIndex];

  // Tagline handlers
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
        const taglinesCollection = collection(
          firestore,
          `users/${user.uid}/brands/${brandId}/taglineGenerations`
        );
        suggestionResult.data.forEach((tagline) => {
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
        description:
          error instanceof Error ? error.message : 'Could not generate new taglines.',
      });
    } finally {
      setIsGeneratingTaglines(false);
    }
  }, [brand, user, brandId, firestore, toast]);

  // Auto-generate taglines if there are none
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

  // Logo handlers
  const handleGenerateLogo = useCallback(async () => {
    if (!brand || !user || !firestore || !storage) return;
    setIsGeneratingLogo(true);
    try {
      // Get the data URI from the server action
      const result = await getLogoSuggestion(
        brand.latestName,
        brand.latestElevatorPitch,
        brand.latestAudience,
        brand.latestDesirableCues,
        brand.latestUndesirableCues
      );
      if (result.success && result.data) {
        // Upload the data URI to Firebase Storage from client side
        console.log('Uploading logo to Firebase Storage...');
        const logoUrl = await uploadDataUriToStorageClient(result.data, user.uid, storage);
        console.log('Logo uploaded successfully:', logoUrl);

        // Save the public URL to Firestore
        const logoData = {
          brandId,
          userId: user.uid,
          logoUrl: logoUrl,
          createdAt: serverTimestamp(),
        };
        const logosCollection = collection(
          firestore,
          `users/${user.uid}/brands/${brandId}/logoGenerations`
        );
        await addDoc(logosCollection, logoData);

        toast({
          title: 'New logo generated!',
          description: 'Your new brand logo has been saved.',
        });
      } else {
        throw new Error(result.error || 'Failed to generate and save logo.');
      }
    } catch (error) {
      console.error('Error generating logo:', error);
      toast({
        variant: 'destructive',
        title: 'Logo Generation Failed',
        description: error instanceof Error ? error.message : 'Could not generate a new logo.',
      });
    } finally {
      setIsGeneratingLogo(false);
    }
  }, [brand, user, brandId, firestore, storage, toast]);

  const handleGenerateLogoOpenAI = useCallback(async () => {
    if (!brand || !user || !firestore || !storage) return;
    setIsGeneratingLogoOpenAI(true);
    try {
      const result = await getLogoSuggestionOpenAI(
        brand.latestName,
        brand.latestElevatorPitch,
        brand.latestAudience,
        brand.latestDesirableCues,
        brand.latestUndesirableCues,
        { size: '512x512' }
      );
      if (result.success && result.data) {
        console.log('Uploading OpenAI logo to Firebase Storage...');
        const logoUrl = await uploadDataUriToStorageClient(result.data, user.uid, storage);
        console.log('OpenAI logo uploaded successfully:', logoUrl);

        const logoData = {
          brandId,
          userId: user.uid,
          logoUrl: logoUrl,
          createdAt: serverTimestamp(),
        };
        const logosCollection = collection(
          firestore,
          `users/${user.uid}/brands/${brandId}/logoGenerations`
        );
        await addDoc(logosCollection, logoData);

        toast({
          title: 'New logo generated (OpenAI)!',
          description: 'Your new brand logo has been saved.',
        });
      } else {
        throw new Error(result.error || 'Failed to generate and save logo (OpenAI).');
      }
    } catch (error) {
      console.error('Error generating OpenAI logo:', error);
      toast({
        variant: 'destructive',
        title: 'Logo Generation Failed',
        description: error instanceof Error ? error.message : 'Could not generate a new logo.',
      });
    } finally {
      setIsGeneratingLogoOpenAI(false);
    }
  }, [brand, user, brandId, firestore, storage, toast]);

  // Auto-generate logo if there are none
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
    if (!currentLogo || !user || !firestore || !brand || !storage) return;
    setIsColorizing(true);
    try {
      const dataUriResult = await convertUrlToDataUri(currentLogo.logoUrl);
      if (!dataUriResult.success || !dataUriResult.data) {
        throw new Error(dataUriResult.error || 'Failed to prepare image for colorization.');
      }

      const result = await getColorizedLogo({
        logoUrl: dataUriResult.data,
        name: brand.latestName,
        elevatorPitch: brand.latestElevatorPitch,
        audience: brand.latestAudience,
        desirableCues: brand.latestDesirableCues,
        undesirableCues: brand.latestUndesirableCues,
      });

      if (result.success && result.data) {
        // Upload the colorized logo to Firebase Storage from client side
        console.log('Uploading colorized logo to Firebase Storage...');
        const colorLogoUrl = await uploadDataUriToStorageClient(result.data.colorLogoUrl, user.uid, storage);
        console.log('Colorized logo uploaded successfully:', colorLogoUrl);

        // Update the current logo document with the colorized URL and palette so UI can display it
        const currentLogoDocRef = doc(
          firestore,
          `users/${user.uid}/brands/${brandId}/logoGenerations/${currentLogo.id}`
        );
        await updateDoc(currentLogoDocRef, {
          colorLogoUrl: colorLogoUrl,
          palette: result.data.palette,
        });
        toast({
          title: 'Logo colorized!',
          description: 'A color version of your logo has been generated.',
        });
      } else {
        throw new Error(result.error || 'Failed to colorize logo.');
      }
    } catch (error) {
      console.error('Error colorizing logo:', error);
      toast({
        variant: 'destructive',
        title: 'Colorization Failed',
        description: error instanceof Error ? error.message : 'Could not colorize the logo.',
      });
    } finally {
      setIsColorizing(false);
    }
  }, [currentLogo, user, brand, firestore, storage, toast, brandId, brandService]);

  const handleTaglineStatusUpdate = useCallback(
    async (taglineId: string, status: 'liked' | 'disliked') => {
      if (!user) return;
      try {
        // If liking one, un-like others in a batch to enforce single selection
        if (status === 'liked') {
          const taglinesCollection = collection(
            firestore,
            `users/${user.uid}/brands/${brandId}/taglineGenerations`
          );
          const snapshot = await getDocs(taglinesCollection);
          const batch = writeBatch(firestore);
          snapshot.forEach((docSnap) => {
            const ref = doc(
              firestore,
              `users/${user.uid}/brands/${brandId}/taglineGenerations/${docSnap.id}`
            );
            if (docSnap.id === taglineId) {
              batch.update(ref, { status: 'liked' });
            } else if ((docSnap.data() as any).status === 'liked') {
              batch.update(ref, { status: 'generated' });
            }
          });
          await batch.commit();
        } else {
          const taglineRef = doc(
            firestore,
            `users/${user.uid}/brands/${brandId}/taglineGenerations/${taglineId}`
          );
          await updateDoc(taglineRef, { status });
        }
      } catch (error) {
        console.error(`Error updating tagline ${taglineId} status:`, error);
        toast({
          variant: 'destructive',
          title: 'Update Failed',
          description: 'Could not update the tagline status.',
        });
      }
    },
    [user, brandId, toast, firestore]
  );

  const handleTaglineEdit = useCallback(
    async (taglineId: string, text: string) => {
      if (!user) return;
      try {
        const taglineRef = doc(
          firestore,
          `users/${user.uid}/brands/${brandId}/taglineGenerations/${taglineId}`
        );
        await updateDoc(taglineRef, { tagline: text });
      } catch (error) {
        console.error(`Error editing tagline ${taglineId}:`, error);
        toast({
          variant: 'destructive',
          title: 'Save Failed',
          description: 'Could not save your edits.',
        });
      }
    },
    [user, brandId, firestore, toast]
  );

  // Computed values
  const visibleTaglines = useMemo(() => {
    return allTaglines?.filter((t) => t.status !== 'disliked') ?? [];
  }, [allTaglines]);

  const likedTagline = useMemo(() => {
    return visibleTaglines.find((t) => t.status === 'liked');
  }, [visibleTaglines]);

  const primaryTagline = useMemo(() => {
    const liked = likedTagline;
    if (liked) return liked.tagline;
    if (visibleTaglines.length > 0) return visibleTaglines[0].tagline;
    return 'Your tagline will appear here.';
  }, [visibleTaglines, likedTagline]);

  // Set index to newest logo when logos change
  useEffect(() => {
    if (logos && logos.length > 0) {
      setCurrentLogoIndex(logos.length - 1);
    }
  }, [logos?.length]);

  // Update brand's primary logoUrl when the paginated logo changes
  useEffect(() => {
    if (logos && logos.length > 0 && brandRef && currentLogo) {
      const logoToDisplay = currentLogo.colorLogoUrl || currentLogo.logoUrl;
      if (logoToDisplay !== brand?.logoUrl) {
        updateDoc(brandRef, { logoUrl: logoToDisplay });
      }
    }
  }, [logos, currentLogoIndex, brandRef, brand?.logoUrl, currentLogo]);

  const isLoading = isLoadingBrand || (isLoadingTaglines && !allTaglines);

  return (
    <ContentCard>
      {isLoading && (
        <div className="text-center">
          <Loader2 className="mx-auto w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground mt-2">Loading brand details...</p>
        </div>
      )}

      {!isLoading && !brand && (
        <div className="text-center p-8">
          <h2 className="text-xl font-bold">Brand Not Found</h2>
          <p className="text-muted-foreground mt-2">
            We couldn't find the brand you're looking for.
          </p>
        </div>
      )}

      {brand && (
        <div className="space-y-8">
          <BrandHeader brand={brand} />

          <BrandIdentityCard
            brandName={brand.latestName}
            primaryTagline={primaryTagline}
            logos={logos}
            currentLogoIndex={currentLogoIndex}
            isLoadingLogos={isLoadingLogos}
            isGeneratingLogo={isGeneratingLogo}
            isGeneratingLogoOpenAI={isGeneratingLogoOpenAI}
            isColorizing={isColorizing}
            isLoadingTaglines={isLoadingTaglines}
            onGenerateLogo={handleGenerateLogo}
            onGenerateLogoOpenAI={handleGenerateLogoOpenAI}
            onColorizeLogo={handleColorizeLogo}
            onLogoIndexChange={setCurrentLogoIndex}
          />

          <TaglinesList
            taglines={visibleTaglines}
            isLoading={isLoadingTaglines}
            isGenerating={isGeneratingTaglines}
            onGenerate={handleGenerateTaglines}
            onStatusUpdate={handleTaglineStatusUpdate}
            onEdit={handleTaglineEdit}
          />
        </div>
      )}
    </ContentCard>
  );
}
