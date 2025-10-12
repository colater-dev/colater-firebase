// IMPORTANT: This file is meant for server-side use only.
// It imports the 'firebase-admin' package and should not be used in client-side code.

import { initializeApp, getApp, App, cert } from "firebase-admin/app";
import { getStorage, Storage } from "firebase-admin/storage";
import { firebaseConfig } from "@/firebase/config";
import "server-only";

let adminApp: App;
let adminStorage: Storage;

// Helper function to get the initialization options
function getInitOptions() {
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      try {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
        return {
          credential: cert(serviceAccount),
          storageBucket: `${serviceAccount.project_id}.appspot.com`,
        };
      } catch (e) {
         console.error("Firebase Admin SDK: Error parsing service account key:", e);
      }
    }
    // Fallback to Application Default Credentials and config for storage bucket
    return {
      storageBucket: `${firebaseConfig.projectId}.appspot.com`,
    };
}


// Helper function to initialize the Firebase Admin app
function initializeAdminApp(): App {
  try {
    // If the app is already initialized, just return it.
    return getApp();
  } catch {
    // Otherwise, initialize it with the correct options.
    try {
        return initializeApp(getInitOptions());
    } catch (e) {
      console.error("Firebase Admin SDK initialization failed:", e);
      throw new Error("Could not initialize Firebase Admin SDK. Ensure Application Default Credentials or a service account key are set up correctly.");
    }
  }
}

// Export a function to get the singleton app instance
export function getAdminApp(): App {
  if (!adminApp) {
    adminApp = initializeAdminApp();
  }
  return adminApp;
}

// Export a function to get the singleton Storage instance
export function getAdminStorage(app: App): Storage {
  if (!adminStorage) {
    adminStorage = getStorage(app);
  }
  return adminStorage;
}
