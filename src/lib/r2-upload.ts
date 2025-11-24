'use server';

import { PutObjectCommand } from "@aws-sdk/client-s3";
import { r2, R2_BUCKET_NAME, R2_PUBLIC_URL } from "@/lib/r2";
import { v4 as uuidv4 } from "uuid";

/**
 * Uploads a data URI to Cloudflare R2.
 * This is the new preferred method for image storage.
 * @param dataUri The data URI (e.g., from an AI-generated image).
 * @param userId The ID of the user uploading the file.
 * @param folder Optional folder path (default: 'logos')
 * @returns The public download URL of the uploaded file.
 */
export async function uploadDataUriToR2(
  dataUri: string,
  userId: string,
  folder: string = 'logos'
): Promise<string> {
  try {
    if (!R2_BUCKET_NAME) {
      throw new Error('R2 bucket name is not configured.');
    }

    if (!R2_PUBLIC_URL) {
      throw new Error('R2 public URL is not configured.');
    }

    // Extract MIME type and file extension
    const mimeMatch = dataUri.match(/data:([^;]+);/);
    const mimeType = mimeMatch ? mimeMatch[1] : 'image/png';
    
    let fileExtension = 'png';
    if (mimeType.includes('svg')) {
      fileExtension = 'svg';
    } else if (mimeType.includes('jpeg') || mimeType.includes('jpg')) {
      fileExtension = 'jpg';
    } else if (mimeType.includes('webp')) {
      fileExtension = 'webp';
    }

    // Extract base64 data
    const base64Data = dataUri.split(',')[1];
    if (!base64Data) {
      throw new Error('Invalid data URI format');
    }

    // Convert base64 to buffer
    const buffer = Buffer.from(base64Data, 'base64');

    // Generate unique file name
    const uniqueId = uuidv4();
    const key = `${folder}/${userId}/${uniqueId}.${fileExtension}`;

    // Upload to R2
    const command = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
    });

    await r2.send(command);

    // Return public URL
    const publicUrl = `${R2_PUBLIC_URL}/${key}`;
    return publicUrl;
  } catch (error) {
    console.error('Error uploading data URI to R2:', error);
    throw new Error(
      `Failed to upload to R2: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}


