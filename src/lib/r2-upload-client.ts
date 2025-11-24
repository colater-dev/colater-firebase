'use client';

/**
 * Client-side wrapper for uploading data URIs to R2.
 * This calls a server action to perform the upload.
 */
export async function uploadDataUriToR2Client(
  dataUri: string,
  userId: string,
  folder: string = 'logos'
): Promise<string> {
  const { uploadDataUriToR2 } = await import('@/lib/r2-upload');
  return uploadDataUriToR2(dataUri, userId, folder);
}

