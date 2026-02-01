'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error, {
      tags: { page: 'dashboard' },
    });
  }, [error]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 min-h-[60vh] text-center gap-4">
      <div className="rounded-full bg-destructive/10 p-3">
        <AlertCircle className="w-6 h-6 text-destructive" />
      </div>
      <div>
        <h2 className="font-semibold text-lg">Failed to load dashboard</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {error.message || 'Could not load your brands. Please try again.'}
        </p>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => reset()}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
        >
          Try again
        </button>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
