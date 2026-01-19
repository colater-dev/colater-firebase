/**
 * Brand Settings Page
 * Manages brand settings including API keys and sharing
 */

'use client';

import { use } from 'react';
import { useRequireAuth } from '@/features/auth/hooks';
import { useFirestore, useMemoFirebase, useDoc } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BrandAPIKeysTab } from '@/features/brands/components/brand-api-keys-tab';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface BrandSettingsPageProps {
  params: Promise<{ brandId: string }>;
}

export default function BrandSettingsPage({ params }: BrandSettingsPageProps) {
  const { brandId } = use(params);
  const { user, isLoading: isAuthLoading } = useRequireAuth();
  const firestore = useFirestore();

  // Get brand document reference
  const brandDocRef = useMemoFirebase(
    () =>
      user ? doc(firestore, `users/${user.uid}/brands/${brandId}`) : null,
    [firestore, user, brandId]
  );

  // Listen to brand data
  const {
    data: brand,
    isLoading: isBrandLoading,
    error: brandError,
  } = useDoc(brandDocRef);

  if (isAuthLoading || isBrandLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  if (brandError || !brand) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600">Error loading brand settings</p>
          <Link href="/dashboard">
            <Button variant="outline" className="mt-4">
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            href={`/brands/${brandId}`}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Brand
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">
            {brand.latestName} Settings
          </h1>
          <p className="text-gray-600 mt-1">
            Manage API keys and team access
          </p>
        </div>

        {/* Settings Tabs */}
        <Card className="p-6">
          <Tabs defaultValue="share" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="share">Share & API Keys</TabsTrigger>
              <TabsTrigger value="general">General</TabsTrigger>
            </TabsList>

            <TabsContent value="share" className="mt-6">
              <BrandAPIKeysTab
                brandId={brandId}
                brandName={brand.latestName}
                userId={user!.uid}
              />
            </TabsContent>

            <TabsContent value="general" className="mt-6">
              <div className="text-center text-gray-500 py-12">
                General settings coming soon...
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
