// IMPORTANT: This file is meant for server-side use only.
// It imports the 'firebase-admin' package and should not be used in client-side code.

import { initializeApp, getApp, App, cert } from "firebase-admin/app";
import { getStorage, Storage } from "firebase-admin/storage";
import { firebaseConfig } from "@/firebase/config";
import "server-only";

let adminApp: App;

function initializeAdminApp(): App {
  if (adminApp) {
    return adminApp;
  }

  try {
    // getApp() will throw an error if the app is not already initialized.
    // This is a way to check if we've already initialized it in this context.
    return getApp();
  } catch (e) {
    // If getApp() throws, it means we need to initialize.
    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

    if (!serviceAccountKey) {
      console.error(
        "Firebase Admin SDK: FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set. " +
        "Falling back to Application Default Credentials (ADC). This will likely fail if not configured."
      );
      // Initialize with ADC and bucket, which might be the source of the error.
      adminApp = initializeApp({
        storageBucket: `${firebaseConfig.projectId}.appspot.com`,
      });
      return adminApp;
    }

    try {
      const serviceAccount = JSON.parse(serviceAccountKey);
      const projectId = serviceAccount.project_id || firebaseConfig.projectId;
      adminApp = initializeApp({
        credential: cert(serviceAccount),
        storageBucket: `${projectId}.appspot.com`,
      });
      return adminApp;
    } catch (parseError) {
      console.error("Firebase Admin SDK: Error parsing FIREBASE_SERVICE_ACCOUNT_KEY. Make sure it's a valid JSON string.", parseError);
      // Fallback to ADC if parsing fails.
      adminApp = initializeApp({
        storageBucket: `${firebaseConfig.projectId}.appspot.com`,
      });
      return adminApp;
    }
  }
}

export function getAdminApp(): App {
  // This ensures that we always return an initialized app.
  return initializeAdminApp();
}

export function getAdminStorage(app: App): Storage {
  // There is no need to cache the storage instance, getStorage handles this.
  return getStorage(app);
}
