
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
 * Initializes Firebase, creating a new app if one doesn't already exist.
 * This function ensures Firebase is initialized correctly in any environment (client or server).
 * @returns The initialized FirebaseApp instance.
 */
export function initializeFirebaseApp(): FirebaseApp {
  if (getApps().length > 0) {
    return getApp();
  }
  return initializeApp(firebaseConfig);
}
