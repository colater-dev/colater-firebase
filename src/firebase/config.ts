
import { initializeApp, getApps, FirebaseApp } from "firebase/app";

// This is a public configuration and can be safely exposed.
// Security is enforced by Firestore and Storage security rules.
export const firebaseConfig = {
  "projectId": "studio-6830756272-ca1a2",
  "appId": "1:251098089151:web:7dfc5b869ff6e11af6e80a",
  "apiKey": "AIzaSyCVNej025Wh4yX0SP_Vl0ODl6Bq259CCFY",
  "authDomain": "studio-6830756272-ca1a2.firebaseapp.com",
  "storageBucket": "studio-6830756272-ca1a2.firebasestorage.app",
  "measurementId": "",
  "messagingSenderId": "251098089151"
};


/**
 * Initializes Firebase, handling both client-side (with App Hosting auto-config)
 * and server-side environments.
 * @returns The initialized FirebaseApp instance.
 */
export function initializeFirebaseApp(): FirebaseApp {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  // In a Firebase App Hosting environment, the config is automatically provided.
  // The `try...catch` block handles environments where auto-config is not available.
  try {
    return initializeApp();
  } catch (e) {
    if (process.env.NODE_ENV === "production") {
        console.warn('Automatic Firebase initialization failed, falling back to local config. This is normal for local development but may indicate an issue in production if not using App Hosting.', e);
    }
    return initializeApp(firebaseConfig);
  }
}
