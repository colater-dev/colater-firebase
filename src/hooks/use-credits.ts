'use client';

import { useMemo, useEffect } from 'react';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { createCreditsService } from '@/services/credits.service';
import type { UserCredits } from '@/lib/credits';

/**
 * Hook that provides the current user's credit balance in real-time.
 * Initializes credits for new users automatically.
 */
export function useCredits() {
  const { user } = useUser();
  const firestore = useFirestore();

  const creditsService = useMemo(
    () => createCreditsService(firestore),
    [firestore]
  );

  const profileRef = useMemoFirebase(
    () => (user ? creditsService.getProfileDoc(user.uid) : null),
    [user, creditsService]
  );

  const { data: profile, isLoading } = useDoc<UserCredits>(profileRef);

  // Auto-initialize credits for new users
  useEffect(() => {
    if (user && !isLoading && !profile) {
      creditsService.initializeCredits(user.uid).catch(console.error);
    }
  }, [user, isLoading, profile, creditsService]);

  return {
    balance: profile?.balance ?? 0,
    isLoading,
    creditsService,
  };
}
