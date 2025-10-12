
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuth, useUser, initiateGoogleSignIn, handleRedirectResult } from '@/firebase';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const [isProcessingRedirect, setIsProcessingRedirect] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Handle the redirect result from Google Sign-In when the component mounts
  useEffect(() => {
    // Check if there might be a redirect result to process.
    // This is a simple check; more sophisticated checks might be needed
    // depending on the complexity of your app's entry points.
    if (auth) {
      setIsProcessingRedirect(true);
      handleRedirectResult(auth)
        .catch(error => {
          console.error("Error processing redirect result:", error);
          console.error("Error code:", error?.code);
          console.error("Error message:", error?.message);

          // Set user-friendly error message
          if (error?.code === 'auth/unauthorized-domain') {
            setAuthError('This domain is not authorized. Please add it in Firebase Console under Authentication → Settings → Authorized domains.');
          } else if (error?.code === 'auth/popup-closed-by-user') {
            setAuthError('Sign-in was cancelled. Please try again.');
          } else if (error?.code) {
            setAuthError(`Authentication failed: ${error.code}`);
          } else if (error) {
            setAuthError(`Authentication error: ${error.message || 'Unknown error'}`);
          }
        })
        .finally(() => {
          setIsProcessingRedirect(false);
        });
    }
  }, [auth]);

  useEffect(() => {
    // Only redirect if we are not in the middle of loading the user
    // or processing a sign-in redirect.
    if (!isUserLoading && !isProcessingRedirect && user) {
      router.push('/dashboard');
    }
  }, [user, isUserLoading, isProcessingRedirect, router]);


  const handleSignIn = () => {
    if (auth) {
      initiateGoogleSignIn(auth);
    }
  };

  if (isUserLoading || isProcessingRedirect || user) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading user session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-background text-foreground">
      <div className="text-center max-w-md mx-auto px-4">
        <h1 className="text-5xl font-bold mb-4 tracking-tight">Brand Canvas</h1>
        <p className="text-lg text-muted-foreground mb-8">
          Craft your brand identity. Effortlessly.
        </p>

        {authError && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg text-red-800 dark:text-red-200 text-sm">
            <p className="font-semibold mb-1">Authentication Error</p>
            <p>{authError}</p>
            <button
              onClick={() => setAuthError(null)}
              className="mt-2 text-xs underline hover:no-underline"
            >
              Dismiss
            </button>
          </div>
        )}

        <Button onClick={handleSignIn} size="lg" disabled={!auth}>
          <svg className="mr-2 h-4 w-4" viewBox="0 0 48 48" width="24px" height="24px">
            <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.658-3.356-11.303-8H6.306C9.656,39.663,16.318,44,24,44z"></path><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C43.021,36.251,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
          </svg>
          Sign in with Google
        </Button>
      </div>
    </div>
  );
}
