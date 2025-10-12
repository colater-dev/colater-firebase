'use client';

import BrandCanvas from '@/components/brand-canvas';
import { Button } from '@/components/ui/button';
import { useAuth, useUser, initiateGoogleSignIn } from '@/firebase';

export default function Home() {
  const auth = useAuth();
  const { user, isUserLoading } = useUser();

  const handleSignIn = () => {
    initiateGoogleSignIn(auth);
  };

  if (isUserLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background text-foreground">
        <h1 className="text-4xl font-bold mb-4">Brand Canvas</h1>
        <p className="text-muted-foreground mb-8">Visualize your brand identity on an infinite canvas.</p>
        <Button onClick={handleSignIn} size="lg">
          <svg className="mr-2 h-4 w-4" viewBox="0 0 48 48" width="24px" height="24px">
            <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.658-3.356-11.303-8H6.306C9.656,39.663,16.318,44,24,44z"></path><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C43.021,36.251,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
          </svg>
          Sign in with Google
        </Button>
      </div>
    );
  }

  return (
    <main>
      <BrandCanvas />
    </main>
  );
}
