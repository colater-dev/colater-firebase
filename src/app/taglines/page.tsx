import { Metadata } from 'next';
import { Suspense } from 'react';
import { TaglinesClient } from './taglines-client';
import { ContentCard } from '@/components/layout';
import { Loader2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Generate Taglines',
  description: 'Generate and manage taglines for your brands',
};

export default function TaglinesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen pt-[72px] p-4 md:p-8">
        <ContentCard>
          <div className="text-center py-8">
            <Loader2 className="mx-auto w-8 h-8 animate-spin text-primary" />
            <p className="text-muted-foreground mt-2">Loading...</p>
          </div>
        </ContentCard>
      </div>
    }>
      <TaglinesClient />
    </Suspense>
  );
}

