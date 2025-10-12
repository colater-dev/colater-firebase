// IMPORTANT: This file is meant for server-side use only.
// It imports the 'firebase-admin' package and should not be used in client-side code.

import { initializeApp, getApp, App, cert } from "firebase-admin/app";
import { getStorage, Storage } from "firebase-admin/storage";
import { firebaseConfig } from "@/firebase/config";
import "server-only";

let adminApp: App;
let adminStorage: Storage;

function getInitOptions() {
  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  if (!serviceAccountKey) {
    console.error(
      "Firebase Admin SDK: FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set. " +
      "Falling back to Application Default Credentials (ADC). This might cause issues if ADC is not configured."
    );
    // Proceed with ADC, which might be the source of the error if not configured.
    return {
      storageBucket: `${firebaseConfig.projectId}.appspot.com`,
    };
  }

  try {
    const serviceAccount = JSON.parse(serviceAccountKey);
    const projectId = serviceAccount.project_id || firebaseConfig.projectId;
    return {
      credential: cert(serviceAccount),
      storageBucket: `${projectId}.appspot.com`,
    };
  } catch (e) {
    console.error("Firebase Admin SDK: Error parsing FIREBASE_SERVICE_ACCOUNT_KEY. Make sure it's a valid JSON string.", e);
    // Fallback to ADC if parsing fails
    return {
      storageBucket: `${firebaseConfig.projectId}.appspot.com`,
    };
  }
}

function initializeAdminApp(): App {
  try {
    // getApp() throws if no app is initialized, which is our control flow.
    return getApp();
  } catch {
    // If it throws, initialize the app with the correct options.
    return initializeApp(getInitOptions());
  }
}

export function getAdminApp(): App {
  if (!adminApp) {
    adminApp = initializeAdminApp();
  }
  return adminApp;
}

export function getAdminStorage(app: App): Storage {
  if (!adminStorage) {
    adminStorage = getStorage(app);
  }
  return adminStorage;
}
