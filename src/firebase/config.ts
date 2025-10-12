
import { initializeApp, getApps, FirebaseApp, getApp } from "firebase/app";

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
 * Initializes and/or returns the singleton FirebaseApp instance.
 * Ensures Firebase is initialized correctly in any environment (client or server).
 * This function is idempotent.
 * @returns The initialized FirebaseApp instance.
 */
export function initializeFirebaseApp(): FirebaseApp {
  // If apps are already initialized, return the default app.
  // This is safe for both client and server environments.
  if (getApps().length) {
    return getApp();
  }

  // Initialize the app with the provided config.
  // The automaticDataCollectionEnabled: false prevents Firebase from attempting
  // to auto-fetch config from /__/firebase/init.json
  return initializeApp(firebaseConfig, {
    automaticDataCollectionEnabled: false,
  });
}
