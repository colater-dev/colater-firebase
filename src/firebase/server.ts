// IMPORTANT: This file is meant for server-side use only.
// It imports the 'firebase-admin' package and should not be used in client-side code.

import { initializeApp, getApp, App, cert } from "firebase-admin/app";
import { getStorage, Storage } from "firebase-admin/storage";
import { firebaseConfig } from "@/firebase/config";
import "server-only";

// Helper function to initialize the Firebase Admin app
function initializeAdminApp(): App {
  try {
    // Check if the app is already initialized
    return getApp();
  } catch {
    // If not initialized, try to initialize with Application Default Credentials
    try {
      return initializeApp({
        storageBucket: `${firebaseConfig.projectId}.appspot.com`,
      });
    } catch (e: any) {
        if (e.code === 'app/invalid-credential' && process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
            // Fallback for environments where ADC is not set up but a service account key is provided
            console.log("Initializing Firebase Admin with service account key...");
            const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
            return initializeApp({
              credential: cert(serviceAccount),
              storageBucket: `${serviceAccount.project_id}.appspot.com`,
            });
        }
      console.error("Firebase Admin SDK initialization failed:", e);
      throw new Error("Could not initialize Firebase Admin SDK. Ensure Application Default Credentials or a service account key are set up correctly.");
    }
  }
}

let adminApp: App;
let adminStorage: Storage;

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
