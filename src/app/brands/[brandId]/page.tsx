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
  getLogoSuggestion,
  getLogoSuggestionOpenAI,
  getLogoSuggestionFal,
  getColorizedLogo,
  convertUrlToDataUri,
  getLogoConcept,
} from '@/app/actions';
import { uploadDataUriToStorageClient } from '@/lib/client-storage';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { createBrandService } from '@/services';
import { BrandHeader, BrandIdentityCard } from '@/features/brands/components';
import { ContentCard } from '@/components/layout';
import type { Brand, Logo } from '@/lib/types';

export default function BrandPage() {
  const { brandId } = useParams();
  const { user } = useUser();
  const firestore = useFirestore();
  const { storage } = useFirebase();
  const { toast } = useToast();
  const [isGeneratingLogo, setIsGeneratingLogo] = useState(false);
  const [isGeneratingConcept, setIsGeneratingConcept] = useState(false);
  const [isColorizing, setIsColorizing] = useState(false);
  const [currentLogoIndex, setCurrentLogoIndex] = useState(0);
  const [logoConcept, setLogoConcept] = useState<string | null>(null);

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


  // Logo concept handler
  const handleGenerateConcept = useCallback(async () => {
    if (!brand) return;
    setIsGeneratingConcept(true);
    try {
      const result = await getLogoConcept(
        brand.latestName,
        brand.latestElevatorPitch,
        brand.latestAudience,
        brand.latestDesirableCues,
        brand.latestUndesirableCues
      );
      if (result.success && result.data) {
        // Combine concept and stylePrompt for the editable textbox
        const combinedConcept = `${result.data.concept}\n\nStyle Prompt: ${result.data.stylePrompt}`;
        setLogoConcept(combinedConcept);
        toast({
          title: 'Brand concept generated!',
          description: 'You can edit the concept before generating the logo.',
        });
      } else {
        throw new Error(result.error || 'Failed to generate logo concept.');
      }
    } catch (error) {
      console.error('Error generating logo concept:', error);
      toast({
        variant: 'destructive',
        title: 'Concept Generation Failed',
        description: error instanceof Error ? error.message : 'Could not generate logo concept.',
      });
    } finally {
      setIsGeneratingConcept(false);
    }
  }, [brand, toast]);

  const handleConceptChange = useCallback((concept: string) => {
    setLogoConcept(concept);
  }, []);

  // Logo generation handler
  const handleGenerateLogo = useCallback(async (provider: 'gemini' | 'openai' | 'ideogram') => {
    if (!brand || !user || !firestore || !storage || !logoConcept) return;
    setIsGeneratingLogo(true);
    try {
      let result;
      
      if (provider === 'gemini') {
        result = await getLogoSuggestion(
          brand.latestName,
          brand.latestElevatorPitch,
          brand.latestAudience,
          brand.latestDesirableCues,
          brand.latestUndesirableCues
        );
      } else if (provider === 'openai') {
        result = await getLogoSuggestionOpenAI(
          brand.latestName,
          brand.latestElevatorPitch,
          brand.latestAudience,
          brand.latestDesirableCues,
          brand.latestUndesirableCues,
          { size: '512x512', concept: logoConcept }
        );
      } else if (provider === 'ideogram') {
        result = await getLogoSuggestionFal(
          brand.latestName,
          brand.latestElevatorPitch,
          brand.latestAudience,
          brand.latestDesirableCues,
          brand.latestUndesirableCues,
          logoConcept
        );
      } else {
        throw new Error('Invalid provider');
      }

      if (result.success && result.data) {
        console.log('Uploading logo to Firebase Storage...');
        const logoUrl = await uploadDataUriToStorageClient(result.data, user.uid, storage);
        console.log('Logo uploaded successfully:', logoUrl);

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
          description: `Your new brand logo has been saved (${provider}).`,
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
  }, [brand, user, brandId, firestore, storage, toast, logoConcept]);

  // Note: Removed auto-generate logo - user must generate concept first

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

  // Primary tagline - use brand's primary tagline or fallback
  const primaryTagline = brand?.primaryTagline || 'Your tagline will appear here.';

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

  const isLoading = isLoadingBrand;

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
            isGeneratingConcept={isGeneratingConcept}
            isColorizing={isColorizing}
            isLoadingTaglines={false}
            logoConcept={logoConcept}
            onGenerateConcept={handleGenerateConcept}
            onConceptChange={handleConceptChange}
            onGenerateLogo={handleGenerateLogo}
            onColorizeLogo={handleColorizeLogo}
            onLogoIndexChange={setCurrentLogoIndex}
          />
        </div>
      )}
    </ContentCard>
  );
}
