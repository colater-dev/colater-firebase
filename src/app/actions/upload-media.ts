"use server";

import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { r2, R2_BUCKET_NAME, R2_PUBLIC_URL } from "@/lib/r2";
import { v4 as uuidv4 } from "uuid";

export async function getPresignedUploadUrl(
    contentType: string,
    fileName: string
): Promise<{ success: boolean; url?: string; publicUrl?: string; error?: string }> {
    try {
        if (!R2_BUCKET_NAME) {
            return { success: false, error: "R2 bucket name is not configured." };
        }

        const fileExtension = fileName.split(".").pop();
        const uniqueFileName = `${uuidv4()}.${fileExtension}`;
        const key = `uploads/${uniqueFileName}`;

        const command = new PutObjectCommand({
            Bucket: R2_BUCKET_NAME,
            Key: key,
            ContentType: contentType,
        });

        const url = await getSignedUrl(r2, command, { expiresIn: 3600 });

        // If R2_PUBLIC_URL is set, use it. Otherwise fallback to R2.dev URL if possible (but usually custom domain is needed)
        // If R2_PUBLIC_URL is not set, we can try to construct one if we knew the subdomain, but it's safer to rely on env var.
        const publicUrl = R2_PUBLIC_URL
            ? `${R2_PUBLIC_URL}/${key}`
            : url.split("?")[0]; // Fallback to the signed URL without query params (might not work if private bucket)

        return { success: true, url, publicUrl };
    } catch (error) {
        console.error("Error generating presigned URL:", error);
        return { success: false, error: "Failed to generate upload URL." };
    }
}
