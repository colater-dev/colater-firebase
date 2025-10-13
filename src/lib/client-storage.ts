'use client';

import { getStorage, ref, uploadString, getDownloadURL } from "firebase/storage";
import { v4 as uuidv4 } from 'uuid';

/**
 * Uploads a data URI to Firebase Cloud Storage from the client side.
 * This ensures proper authentication context is available.
 * @param dataUri The data URI (e.g., from an AI-generated image).
 * @param userId The ID of the user uploading the file.
 * @param storage The Firebase Storage instance.
 * @returns The public download URL of the uploaded file.
 */
export async function uploadDataUriToStorageClient(
  dataUri: string, 
  userId: string, 
  storage: any
): Promise<string> {
  console.log("uploadDataUriToStorageClient: Starting upload...");
  try {
    const fileExtension = dataUri.substring(dataUri.indexOf('/') + 1, dataUri.indexOf(';'));
    const uniqueId = uuidv4();
    const filePath = `logos/${userId}/${uniqueId}.${fileExtension}`;
    const storageRef = ref(storage, filePath);
    console.log(`uploadDataUriToStorageClient: Determined file path: ${filePath}`);

    // The actual data is after the comma
    const base64Data = dataUri.split(',')[1];
    
    console.log("uploadDataUriToStorageClient: Attempting to call uploadString...");
    await uploadString(storageRef, base64Data, 'base64');
    console.log("uploadDataUriToStorageClient: uploadString completed successfully.");
    
    const downloadUrl = await getDownloadURL(storageRef);
    console.log(`uploadDataUriToStorageClient: Got download URL: ${downloadUrl}`);
    
    return downloadUrl;
  } catch(error: any) {
    console.error("uploadDataUriToStorageClient: An error occurred during the upload process.", error);
    console.error("Error code:", error?.code);
    console.error("Error message:", error?.message);
    console.error("Error details:", error?.details);
    
    // Provide more specific error messages based on the error type
    if (error?.code === 'storage/unauthorized') {
      throw new Error('Firebase Storage: Unauthorized access. Please check your authentication and storage rules.');
    } else if (error?.code === 'storage/unknown') {
      throw new Error('Firebase Storage: An unknown error occurred, please check the error payload for server response. (storage/unknown)');
    } else if (error?.code === 'storage/invalid-format') {
      throw new Error('Firebase Storage: Invalid data format provided for upload.');
    } else if (error?.code === 'storage/quota-exceeded') {
      throw new Error('Firebase Storage: Storage quota exceeded.');
    } else if (error?.code === 'storage/unauthenticated') {
      throw new Error('Firebase Storage: User must be authenticated to upload files.');
    }
    
    // Re-throw the original error with more context
    throw new Error(`Firebase Storage Error (${error?.code || 'unknown'}): ${error?.message || 'An unknown error occurred during upload.'}`);
  }
}
