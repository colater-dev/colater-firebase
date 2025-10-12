'use server';

import { initializeApp, getApps } from "firebase/app";
import { getStorage, ref, uploadString, getDownloadURL } from "firebase/storage";
import { v4 as uuidv4 } from 'uuid';
import { firebaseConfig } from "@/firebase/config";

function initializeAppIfNeeded() {
    if (!getApps().length) {
        initializeApp(firebaseConfig);
    }
}

/**
 * Uploads a data URI to Firebase Cloud Storage.
 * @param dataUri The data URI (e.g., from an AI-generated image).
 * @param userId The ID of the user uploading the file.
 * @returns The public download URL of the uploaded file.
 */
export async function uploadDataUriToStorage(dataUri: string, userId: string): Promise<string> {
  initializeAppIfNeeded();
  const storage = getStorage();
  const fileExtension = dataUri.substring(dataUri.indexOf('/') + 1, dataUri.indexOf(';'));
  const uniqueId = uuidv4();
  const filePath = `logos/${userId}/${uniqueId}.${fileExtension}`;
  const storageRef = ref(storage, filePath);

  // The actual data is after the comma
  const base64Data = dataUri.split(',')[1];
  
  await uploadString(storageRef, base64Data, 'base64');
  
  const downloadUrl = await getDownloadURL(storageRef);
  
  return downloadUrl;
}
