
import { initializeApp, getApps, FirebaseApp } from "firebase/app";

// This is a public configuration and can be safely exposed.
// Security is enforced by Firestore and Storage security rules.
export const firebaseConfig = {
  "projectId": "studio-6830756272-ca1a2",
  "appId": "1:251098089151:web:7dfc5b869ff6e11af6e80a",
  "apiKey": "AIzaSyCVNej025Wh4yX0SP_Vl0ODl6Bq259CCFY",
  "authDomain": "studio-6830756272-ca1a2.firebaseapp.com",
  "storageBucket": "studio-6830756272-ca1a2.appspot.com",
  "measurementId": "",
  "messagingSenderId": "251098089151"
};


/**
 * Initializes Firebase, creating a new app if one doesn't already exist.
 * This is a simplified function to be used where needed.
 * For client-side React components, initialization should happen once in the provider.
 * @returns The initialized FirebaseApp instance.
 */
export function initializeFirebaseApp(): FirebaseApp {
  const apps = getApps();
  if (apps.length > 0) {
    return apps[0];
  }
  // In a client-side context (like FirebaseProvider), App Hosting will auto-configure.
  // In a server-side context (like a server action), we must provide the config.
  // We check if window is defined to differentiate.
  if (typeof window !== 'undefined') {
    try {
        // This will be auto-configured by App Hosting in production.
        return initializeApp();
    } catch (e) {
        // Fallback for local dev where auto-config isn't present.
        return initializeApp(firebaseConfig);
    }
  }
  
  // If not in a browser (e.g., server action), initialize with the explicit config.
  return initializeApp(firebaseConfig);
}

