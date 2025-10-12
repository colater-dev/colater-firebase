// IMPORTANT: This file is meant for server-side use only.
// It imports the 'firebase-admin' package and should not be used in client-side code.

import { initializeApp, getApp, App, cert } from "firebase-admin/app";
import { getStorage, Storage } from "firebase-admin/storage";
import { firebaseConfig } from "@/firebase/config";
import "server-only";

let adminApp: App;
let adminStorage: Storage;

function getInitOptions() {
  const options: { credential?: any; storageBucket: string } = {
    storageBucket: `${firebaseConfig.projectId}.appspot.com`,
  };

  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    try {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
      options.credential = cert(serviceAccount);
      // Ensure storageBucket is derived from service account if project_id is different
      if (serviceAccount.project_id) {
          options.storageBucket = `${serviceAccount.project_id}.appspot.com`;
      }
    } catch (e) {
      console.error("Firebase Admin SDK: Error parsing service account key, falling back to ADC.", e);
    }
  }
  return options;
}

function initializeAdminApp(): App {
  try {
    // getApp() throws if no app is initialized, which is the control flow we want.
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
