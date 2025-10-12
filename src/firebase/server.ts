
// IMPORTANT: This file is meant for server-side use only.
// It imports the 'firebase-admin' package and should not be used in client-side code.

import { initializeApp, getApp, App, cert, AppOptions } from "firebase-admin/app";
import { getStorage, Storage } from "firebase-admin/storage";
import { firebaseConfig } from "@/firebase/config";
import "server-only";

// This variable will hold the single, initialized Firebase Admin App instance.
let adminApp: App | null = null;

function initializeAdminApp(): App {
  // If the app is already initialized, return it.
  if (adminApp) {
    return adminApp;
  }

  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  if (!serviceAccountKey) {
    throw new Error(
      "Firebase Admin SDK: FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set. " +
      "This is required for server-side operations like saving generated images to Firebase Storage."
    );
  }

  try {
    const serviceAccount = JSON.parse(serviceAccountKey);
    const projectId = serviceAccount.project_id || firebaseConfig.projectId;

    if (!projectId) {
        throw new Error("Could not determine project ID from service account or firebaseConfig.");
    }
    
    const appOptions: AppOptions = {
      credential: cert(serviceAccount),
      storageBucket: `${projectId}.appspot.com`,
    };

    // Check if the app is already initialized by name before trying to create it.
    try {
        adminApp = getApp();
    } catch (e) {
        adminApp = initializeApp(appOptions);
    }
    
    return adminApp;

  } catch (parseError: any) {
    throw new Error(
        "Firebase Admin SDK: Error parsing FIREBASE_SERVICE_ACCOUNT_KEY. " +
        `Make sure it's a valid JSON string. Details: ${parseError.message}`
    );
  }
}

/**
 * Returns the singleton instance of the Firebase Admin App.
 * This ensures the app is initialized only once with the correct configuration.
 */
export function getAdminApp(): App {
  return initializeAdminApp();
}

/**
 * Returns the Firebase Admin Storage service.
 */
export function getAdminStorage(app: App): Storage {
  return getStorage(app);
}
