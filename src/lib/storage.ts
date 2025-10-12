
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
  console.log("uploadDataUriToStorage: Initializing Firebase and Storage.");
  try {
    const firebaseApp = initializeFirebaseApp();
    const storage = getStorage(firebaseApp);
    
    const fileExtension = dataUri.substring(dataUri.indexOf('/') + 1, dataUri.indexOf(';'));
    const uniqueId = uuidv4();
    const filePath = `logos/${userId}/${uniqueId}.${fileExtension}`;
    const storageRef = ref(storage, filePath);
    console.log(`uploadDataUriToStorage: Determined file path: ${filePath}`);

    // The actual data is after the comma
    const base64Data = dataUri.split(',')[1];
    
    console.log("uploadDataUriToStorage: Attempting to call uploadString...");
    await uploadString(storageRef, base64Data, 'base64');
    console.log("uploadDataUriToStorage: uploadString completed successfully.");
    
    const downloadUrl = await getDownloadURL(storageRef);
    console.log(`uploadDataUriToStorage: Got download URL: ${downloadUrl}`);
    
    return downloadUrl;
  } catch(error) {
    console.error("uploadDataUriToStorage: An error occurred during the upload process.", error);
    // Re-throw the error so the calling action can handle it.
    throw error;
  }
}
