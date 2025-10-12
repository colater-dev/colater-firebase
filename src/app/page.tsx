'use client';

import BrandCanvas from '@/components/brand-canvas';
import { useAuth, useUser, initiateAnonymousSignIn } from '@/firebase';
import { useEffect } from 'react';

export default function Home() {
  const auth = useAuth();
  const { user, isUserLoading } = useUser();

  useEffect(() => {
    if (!user && !isUserLoading) {
      initiateAnonymousSignIn(auth);
    }
  }, [user, isUserLoading, auth]);

  if (isUserLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <main>
      <BrandCanvas />
    </main>
  );
}
