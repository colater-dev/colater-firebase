'use client';
import {
  Auth, // Import Auth type for type hinting
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult,
  // Assume getAuth and app are initialized elsewhere
} from 'firebase/auth';

/** Initiate anonymous sign-in (non-blocking). */
export function initiateAnonymousSignIn(authInstance: Auth): void {
  // CRITICAL: Call signInAnonymously directly. Do NOT use 'await signInAnonymously(...)'.
  signInAnonymously(authInstance);
  // Code continues immediately. Auth state change is handled by onAuthStateChanged listener.
}

/** Initiate email/password sign-up (non-blocking). */
export function initiateEmailSignUp(authInstance: Auth, email: string, password: string): void {
  // CRITICAL: Call createUserWithEmailAndPassword directly. Do NOT use 'await createUserWithEmailAndPassword(...)'.
  createUserWithEmailAndPassword(authInstance, email, password);
  // Code continues immediately. Auth state change is handled by onAuthStateChanged listener.
}

/** Initiate email/password sign-in (non-blocking). */
export function initiateEmailSignIn(authInstance: Auth, email: string, password: string): void {
  // CRITICAL: Call signInWithEmailAndPassword directly. Do NOT use 'await signInWithEmailAndPassword(...)'.
  signInWithEmailAndPassword(authInstance, email, password);
  // Code continues immediately. Auth state change is handled by onAuthStateChanged listener.
}

/** Initiate Google sign-in (non-blocking). */
export function initiateGoogleSignIn(authInstance: Auth): void {
  const provider = new GoogleAuthProvider();
  // CRITICAL: Call signInWithRedirect directly. Do NOT use 'await signInWithRedirect(...)'.
  signInWithRedirect(authInstance, provider);
  // The page will be redirected, and the result is handled by the onAuthStateChanged listener or getRedirectResult.
}

/**
 * Checks for a redirect result after a user returns to the app.
 * This should be called on the page where the user lands after sign-in.
 */
export async function handleRedirectResult(authInstance: Auth) {
  try {
    // This promise resolves with the user credential on a successful sign-in redirect.
    // It resolves with `null` if the user just visited the page without a redirect.
    const result = await getRedirectResult(authInstance);
    // You can handle the user from the result here if needed,
    // but onAuthStateChanged will also fire, which is often sufficient.
    return result;
  } catch (error) {
    // Handle errors here, such as `auth/account-exists-with-different-credential`.
    console.error("Error handling redirect result:", error);
  }
}
