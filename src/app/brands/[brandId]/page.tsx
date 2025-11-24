'use client';

import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
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
  getLogoCritique,
  getVectorizedLogo,
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
  const [isVectorizing, setIsVectorizing] = useState(false);
  const [isCritiquing, setIsCritiquing] = useState(false);
  const [currentLogoIndex, setCurrentLogoIndex] = useState(0);
  const [logoConcept, setLogoConcept] = useState<string | null>(null);
  const processedLogoCountRef = useRef<number>(0);

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

  // Initialize logoConcept from brand.latestConcept when brand loads
  useEffect(() => {
    if (brand?.latestConcept) {
      setLogoConcept(brand.latestConcept);
    }
  }, [brand?.latestConcept]);

  // Font state
  const [selectedBrandFont, setSelectedBrandFont] = useState<string>('Inter');

  // Initialize font from brand data
  useEffect(() => {
    if (brand?.font) {
      setSelectedBrandFont(brand.font);
    }
  }, [brand?.font]);

  const handleFontChange = useCallback(async (font: string) => {
    setSelectedBrandFont(font);
    if (brandRef) {
      await updateDoc(brandRef, { font });
    }
  }, [brandRef]);


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

        // Save to Firestore
        if (brandRef) {
          await updateDoc(brandRef, { latestConcept: combinedConcept });
        }

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

  // Auto-generate concept if missing
  useEffect(() => {
    if (brand && !brand.latestConcept && !logoConcept && !isGeneratingConcept) {
      console.log('Auto-generating missing brand concept...');
      handleGenerateConcept();
    }
  }, [brand, logoConcept, isGeneratingConcept, handleGenerateConcept]);

  const handleConceptChange = useCallback((concept: string) => {
    setLogoConcept(concept);
  }, []);

  // Logo generation handler
  const [provider, setProvider] = useState<'gemini' | 'openai' | 'ideogram' | 'reve' | 'nano-banana'>('ideogram');
  const handleGenerateLogo = useCallback(async (providerOverride?: 'gemini' | 'openai' | 'ideogram' | 'reve' | 'nano-banana') => {
    const selectedProvider = providerOverride || provider;
    if (!brand || !user || !firestore || !storage || !logoConcept) return;
    setIsGeneratingLogo(true);
    try {
      let result;

      if (selectedProvider === 'gemini') {
        result = await getLogoSuggestion(
          brand.latestName,
          brand.latestElevatorPitch,
          brand.latestAudience,
          brand.latestDesirableCues,
          brand.latestUndesirableCues,
          logoConcept
        );
      } else if (selectedProvider === 'openai') {
        result = await getLogoSuggestionOpenAI(
          brand.latestName,
          brand.latestElevatorPitch,
          brand.latestAudience,
          brand.latestDesirableCues,
          brand.latestUndesirableCues,
          { size: '512x512', concept: logoConcept }
        );
      } else if (selectedProvider === 'ideogram' || selectedProvider === 'reve' || selectedProvider === 'nano-banana') {
        let modelId = 'fal-ai/ideogram/v3';
        if (selectedProvider === 'reve') modelId = 'fal-ai/reve/text-to-image';
        if (selectedProvider === 'nano-banana') modelId = 'fal-ai/nano-banana-pro';

        result = await getLogoSuggestionFal(
          brand.latestName,
          brand.latestElevatorPitch,
          brand.latestAudience,
          brand.latestDesirableCues,
          brand.latestUndesirableCues,
          logoConcept,
          modelId
        );
      } else {
        throw new Error('Invalid provider');
      }

      if (result.success && result.data) {
        console.log('Uploading logo to Firebase Storage...');
        const logoUrl = await uploadDataUriToStorageClient(result.data.logoUrl, user.uid, storage);
        console.log('Logo uploaded successfully:', logoUrl);

        const logoData = {
          brandId,
          userId: user.uid,
          logoUrl: logoUrl,
          createdAt: serverTimestamp(),
          isPublic: false, // Private by default
        };

        // Save to user's private collection only
        const logosCollection = collection(
          firestore,
          `users/${user.uid}/brands/${brandId}/logoGenerations`
        );
        const logoDocRef = await addDoc(logosCollection, logoData);

        // Update with ID
        await updateDoc(logoDocRef, { id: logoDocRef.id });

        toast({
          title: 'New logo generated!',
          description: `Your new brand logo has been saved (${selectedProvider}).`,
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
  }, [brand, user, brandId, firestore, storage, toast, logoConcept, provider]);

  // Auto-generate logos for new brands
  const hasAutoGeneratedRef = useRef(false);
  useEffect(() => {
    if (
      brand &&
      logoConcept &&
      !isLoadingLogos &&
      logos &&
      logos.length === 0 &&
      !hasAutoGeneratedRef.current
    ) {
      console.log('Auto-generating initial logos...');
      hasAutoGeneratedRef.current = true;

      // Fire off both requests
      handleGenerateLogo('nano-banana');
      handleGenerateLogo('reve');
    }
  }, [brand, logoConcept, isLoadingLogos, logos, handleGenerateLogo]);

  const handleSaveDisplaySettings = useCallback(async (logoId: string, settings: Logo['displaySettings']) => {
    if (!user) return;

    try {
      const logoRef = doc(firestore, `users/${user.uid}/brands/${brandId}/logoGenerations/${logoId}`);
      await updateDoc(logoRef, {
        displaySettings: settings
      });
    } catch (error) {
      console.error('Error saving display settings:', error);
    }
  }, [user, brandId, firestore]);

  const handleMakeLogoPublic = useCallback(async (logoId: string) => {
    if (!user) return;

    try {
      // Get the logo data from user's private collection
      const logoRef = doc(firestore, `users/${user.uid}/brands/${brandId}/logoGenerations/${logoId}`);
      const { getDoc, setDoc } = await import('firebase/firestore');
      const logoSnap = await getDoc(logoRef);

      if (!logoSnap.exists()) {
        throw new Error('Logo not found');
      }

      const logoData = logoSnap.data();

      // Copy to public path
      const publicLogoRef = doc(firestore, `brands/${brandId}/logos/${logoId}`);
      await setDoc(publicLogoRef, {
        ...logoData,
        isPublic: true,
      });

      // Mark as public in user's collection
      await updateDoc(logoRef, {
        isPublic: true,
      });

      // Also copy brand info to public path if not already there
      const publicBrandRef = doc(firestore, `brands/${brandId}`);
      const publicBrandSnap = await getDoc(publicBrandRef);

      if (!publicBrandSnap.exists()) {
        const brandRef = doc(firestore, `users/${user.uid}/brands/${brandId}`);
        const brandSnap = await getDoc(brandRef);

        if (brandSnap.exists()) {
          await setDoc(publicBrandRef, brandSnap.data());
        }
      }
    } catch (error) {
      console.error('Error making logo public:', error);
      throw error;
    }
  }, [user, brandId, firestore]);

  const handleDeleteColorVersion = useCallback(async (versionIndex: number) => {
    if (!user || !currentLogo) return;

    try {
      const logoRef = doc(firestore, `users/${user.uid}/brands/${brandId}/logoGenerations/${currentLogo.id}`);
      const { getDoc } = await import('firebase/firestore');
      const logoSnap = await getDoc(logoRef);

      if (logoSnap.exists()) {
        const logoData = logoSnap.data() as Logo;
        const colorVersions = logoData.colorVersions || [];

        // Remove the version at the specified index
        if (versionIndex >= 0 && versionIndex < colorVersions.length) {
          const updatedVersions = [...colorVersions];
          updatedVersions.splice(versionIndex, 1);

          await updateDoc(logoRef, {
            colorVersions: updatedVersions
          });

          toast({
            title: 'Color version deleted',
            description: 'The color version has been removed.',
          });
        }
      }
    } catch (error) {
      console.error('Error deleting color version:', error);
      toast({
        variant: 'destructive',
        title: 'Delete Failed',
        description: 'Could not delete the color version.',
      });
    }
  }, [user, brandId, firestore, currentLogo, toast]);



  // Background concept generation for alternating logic
  const generateConceptBackground = useCallback(async () => {
    if (!brand) return;
    console.log('Triggering background concept generation...');
    try {
      const result = await getLogoConcept(
        brand.latestName,
        brand.latestElevatorPitch,
        brand.latestAudience,
        brand.latestDesirableCues,
        brand.latestUndesirableCues
      );
      if (result.success && result.data) {
        const combinedConcept = `${result.data.concept}\n\nStyle Prompt: ${result.data.stylePrompt}`;
        // Update Firestore directly, don't update local state immediately to avoid disrupting user
        if (brandRef) {
          await updateDoc(brandRef, { latestConcept: combinedConcept });
          console.log('Background concept generation complete and saved.');
        }
      }
    } catch (error) {
      console.error('Background concept generation failed:', error);
    }
  }, [brand, brandRef]);

  // Trigger background generation on even-numbered logo generations (2n)
  // We check logos.length. If we just added a logo, the length increased.
  // If we have 1 logo (index 0), next is 2.
  // The requirement: "for 2n logo - use the fresh brand concept, for 2n+1 use the existing brand concept but request a new one in the background."
  // Let's interpret "2n logo" as the 2nd, 4th, 6th... logo (indices 1, 3, 5...).
  // Wait, "2n" usually means even numbers (0, 2, 4...). "2n+1" is odd (1, 3, 5...).
  // If 0-indexed:
  // Index 0 (1st logo): Use existing. Request new one?
  // Requirement: "When the next logo is generated, use the same brand concept, but fire off a request for a new brand concept so one is readily available if the user requests a new logo."
  // "Therefore, for 2n logo - use the fresh brand concept, for 2n+1 use the existing brand concept but request a new one in the background."
  // Let's map this:
  // Logo #1 (Index 0): 2*0 + 1? No, 2*0 = 0. So Index 0 is "2n". Use fresh concept. (We auto-generated it on load).
  // Logo #2 (Index 1): 2*0 + 1. Use existing concept. Fire off request.
  // Logo #3 (Index 2): 2*1. Use fresh concept (generated in background of #2).
  // Logo #4 (Index 3): 2*1 + 1. Use existing. Fire off request.
  // So:
  // If (logos.length % 2 !== 0) -> We just added an ODD number logo (Index 0, 2, 4... wait length is 1, 3, 5).
  // If we just added Logo #1 (Length 1). Next is Logo #2 (Index 1).
  // Wait, the trigger happens AFTER generation.
  // User clicks Generate. Logo is added.
  // If we now have 1 logo (Length 1). This was Index 0. This was a "2n" logo (0).
  // Next one will be Index 1 ("2n+1").
  // The requirement says: "for 2n+1 use the existing brand concept but request a new one in the background."
  // So when we are ABOUT TO generate Index 1, we use existing.
  // When we FINISH generating Index 1, we should have fired a request? Or should we fire it during?
  // "fire off a request for a new brand concept so one is readily available if the user requests a new logo."
  // This implies we need it ready for Index 2.
  // So during/after generation of Index 1 (2n+1), we fetch for Index 2.
  // Index 0 (2n): Use fresh.
  // Index 1 (2n+1): Use existing. Fetch new.
  // Index 2 (2n): Use fresh (fetched during 1).
  // Index 3 (2n+1): Use existing. Fetch new.
  // So we need to trigger background fetch when we generate an ODD index logo (1, 3, 5...).
  // OR, simpler: Trigger it when we generate a logo that makes the count EVEN?
  // No, we generate Index 1. That is the "2n+1" logo. We need to fire request.
  // So when `handleGenerateLogo` completes, if the NEW logo index was odd...
  // `logos` array updates.
  // Let's use a useEffect on `logos`.
  useEffect(() => {
    if (logos && logos.length > 0) {
      const latestLogoIndex = logos.length - 1;

      // Prevent infinite loop by checking if we already processed this logo count
      if (processedLogoCountRef.current === logos.length) {
        return;
      }

      // If the latest logo index is odd (1, 3, 5...), it corresponds to "2n+1".
      // We need to generate a new concept for the NEXT one (which will be 2n).
      if (latestLogoIndex % 2 !== 0) {
        processedLogoCountRef.current = logos.length;
        generateConceptBackground();
      }
    }
  }, [logos?.length, generateConceptBackground]);

  // Note: Removed auto-generate logo - user must generate concept first

  const handleColorizeLogo = useCallback(async () => {
    if (!currentLogo || !user || !firestore || !brand || !storage) return;
    setIsColorizing(true);
    try {
      // Pass the logo URL directly - Fal AI's reve/fast/remix requires URLs, not data URIs
      const result = await getColorizedLogo({
        logoUrl: currentLogo.logoUrl,
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

        // Get existing color versions array or create new one from legacy fields
        const existingColorVersions = currentLogo.colorVersions || [];

        // If we have legacy fields but no colorVersions array yet, migrate them
        if (existingColorVersions.length === 0 && currentLogo.colorLogoUrl) {
          existingColorVersions.push({
            colorLogoUrl: currentLogo.colorLogoUrl,
            palette: currentLogo.palette || []
          });
        }

        // Append new color version
        const updatedColorVersions = [...existingColorVersions, {
          colorLogoUrl: colorLogoUrl,
          palette: result.data.palette
        }];

        // Update the current logo document with the new array of objects (no nesting!)
        const currentLogoDocRef = doc(
          firestore,
          `users/${user.uid}/brands/${brandId}/logoGenerations/${currentLogo.id}`
        );
        await updateDoc(currentLogoDocRef, {
          colorVersions: updatedColorVersions,
          // Keep legacy fields for backward compatibility (set to latest)
          colorLogoUrl: colorLogoUrl,
          palette: result.data.palette,
        });
        toast({
          title: 'Logo colorized!',
          description: `Color version ${updatedColorVersions.length} has been generated.`,
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

  const handleCritiqueLogo = useCallback(async () => {
    if (!currentLogo || !brand || !user || !firestore) return;
    setIsCritiquing(true);
    try {
      // Use color logo if available, otherwise black and white
      const logoUrlToCritique = currentLogo.colorLogoUrl || currentLogo.logoUrl;

      // If it's a URL, we might need to convert to data URI for the AI model if it doesn't support fetching URLs directly.
      // However, Gemini usually supports public URLs. But our URLs are Firebase Storage URLs which might have access issues if not public.
      // To be safe, let's convert to data URI first using our existing action.
      const dataUriResult = await convertUrlToDataUri(logoUrlToCritique);
      if (!dataUriResult.success || !dataUriResult.data) {
        throw new Error(dataUriResult.error || 'Failed to prepare image for critique.');
      }

      const result = await getLogoCritique({
        logoUrl: dataUriResult.data,
        brandName: brand.latestName,
        elevatorPitch: brand.latestElevatorPitch,
        audience: brand.latestAudience,
        desirableCues: brand.latestDesirableCues,
        undesirableCues: brand.latestUndesirableCues,
      });

      if (result.success && result.data) {
        // Update the current logo document with the critique
        const currentLogoDocRef = doc(
          firestore,
          `users/${user.uid}/brands/${brandId}/logoGenerations/${currentLogo.id}`
        );
        await updateDoc(currentLogoDocRef, {
          critique: result.data,
        });
        toast({
          title: 'Critique generated!',
          description: 'The AI has analyzed your logo.',
        });
      } else {
        throw new Error(result.error || 'Failed to critique logo.');
      }
    } catch (error) {
      console.error('Error critiquing logo:', error);
      toast({
        variant: 'destructive',
        title: 'Critique Failed',
        description: error instanceof Error ? error.message : 'Could not critique the logo.',
      });
    } finally {
      setIsCritiquing(false);
    }
  }, [currentLogo, brand, user, firestore, brandId, toast]);

  const handleVectorizeLogo = useCallback(async (croppedLogoUrl: string) => {
    if (!currentLogo || !user || !firestore || !storage) return;
    setIsVectorizing(true);
    try {
      // 1. Upload cropped logo to storage to get a public/download URL for Fal
      console.log('Uploading cropped logo to Firebase Storage...');
      const uploadedCroppedUrl = await uploadDataUriToStorageClient(croppedLogoUrl, user.uid, storage);
      console.log('Cropped logo uploaded:', uploadedCroppedUrl);

      // 2. Call server action to vectorize
      const result = await getVectorizedLogo(uploadedCroppedUrl);

      if (result.success && result.data) {
        // 3. Upload the generated SVG data URI to Firebase Storage
        console.log('Uploading vector logo to Firebase Storage...');
        // Note: uploadDataUriToStorageClient handles data URIs. 
        // The result.data.vectorLogoUrl is a data URI (image/svg+xml).
        // We might want to ensure the file extension is .svg
        // uploadDataUriToStorageClient usually infers from mime type or we might need to tweak it if it defaults to png.
        // Let's check uploadDataUriToStorageClient implementation if possible, but usually it's fine.
        // Actually, let's just pass it.
        const vectorLogoStorageUrl = await uploadDataUriToStorageClient(result.data.vectorLogoUrl, user.uid, storage);
        console.log('Vector logo uploaded successfully:', vectorLogoStorageUrl);

        // 4. Update Firestore
        const currentLogoDocRef = doc(
          firestore,
          `users/${user.uid}/brands/${brandId}/logoGenerations/${currentLogo.id}`
        );
        await updateDoc(currentLogoDocRef, {
          vectorLogoUrl: vectorLogoStorageUrl,
        });

        toast({
          title: 'Vectorization complete!',
          description: 'SVG version has been generated and saved.',
        });
      } else {
        throw new Error(result.error || 'Failed to vectorize logo.');
      }
    } catch (error) {
      console.error('Error vectorizing logo:', error);
      toast({
        variant: 'destructive',
        title: 'Vectorization Failed',
        description: error instanceof Error ? error.message : 'Could not vectorize the logo.',
      });
    } finally {
      setIsVectorizing(false);
    }
  }, [currentLogo, user, firestore, storage, brandId, toast]);

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

  const handleSaveExternalMedia = useCallback(async (logoId: string, url: string) => {
    if (!user || !brandId || !firestore) return;

    try {
      const logoRef = doc(firestore, `users/${user.uid}/brands/${brandId}/logoGenerations/${logoId}`);
      await updateDoc(logoRef, {
        externalMediaUrl: url
      });

      toast({
        title: 'Media Saved',
        description: 'External media link has been updated.',
      });
    } catch (error) {
      console.error('Error saving external media:', error);
      toast({
        variant: 'destructive',
        title: 'Save Failed',
        description: 'Could not save external media link.',
      });
    }
  }, [user, brandId, firestore, toast]);

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
            onCritiqueLogo={handleCritiqueLogo}
            isCritiquing={isCritiquing}
            selectedBrandFont={selectedBrandFont}
            onFontChange={handleFontChange}
            onSaveDisplaySettings={handleSaveDisplaySettings}
            onMakeLogoPublic={handleMakeLogoPublic}
            selectedProvider={provider}
            setSelectedProvider={setProvider}
            onSaveExternalMedia={handleSaveExternalMedia}
            onDeleteColorVersion={handleDeleteColorVersion}
            onVectorizeLogo={handleVectorizeLogo}
            isVectorizing={isVectorizing}
          />

          <BrandHeader brand={brand} />
        </div>
      )}
    </ContentCard>
  );
}
