import { Suspense } from 'react';
import GeneratingClient from './generating-client';
import { Loader2 } from 'lucide-react';

export default function GeneratingPage() {
    return (
        <Suspense fallback={
            <div className="flex-1 flex items-center justify-center p-4 min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        }>
            <GeneratingClient />
        </Suspense>
    );
}
