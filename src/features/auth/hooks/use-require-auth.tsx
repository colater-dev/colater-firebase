'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import type { User } from 'firebase/auth';

interface UseRequireAuthResult {
  user: User | null;
  isLoading: boolean;
}

/**
 * Hook that ensures a user is authenticated.
 * Automatically redirects to home page if user is not logged in.
 *
 * @returns Object containing user and loading state
 *
 * @example
 * ```tsx
 * function ProtectedPage() {
 *   const { user, isLoading } = useRequireAuth();
 *
 *   if (isLoading) return <LoadingSpinner />;
 *
 *   return <div>Hello {user?.displayName}</div>;
 * }
 * ```
 */
export function useRequireAuth(): UseRequireAuthResult {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/');
    }
  }, [user, isUserLoading, router]);

  return {
    user,
    isLoading: isUserLoading
  };
}
