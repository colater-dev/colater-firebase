'use server';

import { getStorage, ref, uploadString, getDownloadURL } from "firebase/storage";
import { v4 as uuidv4 } from 'uuid';
import { initializeFirebaseApp } from "@/firebase/config";


/**
 * Uploads a data URI to Firebase Cloud Storage.
 * Ensures Firebase is initialized in the server-side action context.
 * @param dataUri The data URI (e.g., from an AI-generated image).
 * @param userId The ID of the user uploading the file.
 * @returns The public download URL of the uploaded file.
 */
export async function uploadDataUriToStorage(dataUri: string, userId: string): Promise<string> {
  // This now uses the robust, environment-aware initialization function.
  const firebaseApp = initializeFirebaseApp();
  const storage = getStorage(firebaseApp);
  
  const fileExtension = dataUri.substring(dataUri.indexOf('/') + 1, dataUri.indexOf(';'));
  const uniqueId = uuidv4();
  const filePath = `logos/${userId}/${uniqueId}.${fileExtension}`;
  const storageRef = ref(storage, filePath);

  // The actual data is after the comma
  const base64Data = dataUri.split(',')[1];
  
  // This upload happens from the server, where we've configured rules to allow it.
  await uploadString(storageRef, base64Data, 'base64');
  
  const downloadUrl = await getDownloadURL(storageRef);
  
  return downloadUrl;
}
