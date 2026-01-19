import { Suspense } from 'react';
import PublicPresentationClient from './public-presentation-client';

export default function PublicPresentationPage({ params }: { params: { shareToken: string } }) {
    return (
        <Suspense fallback={<div className="h-screen w-full flex items-center justify-center bg-background text-muted-foreground font-mono">Loading Presentation...</div>}>
            <PublicPresentationClient shareToken={params.shareToken} />
        </Suspense>
    );
}
