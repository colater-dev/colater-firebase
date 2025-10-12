"use server";

import { generateTaglines } from "@/ai/flows/generate-tagline";
import { generateLogo } from "@/ai/flows/generate-logo";
import { getAdminApp, getAdminStorage } from "@/firebase/server";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

export async function getTaglineSuggestions(
  name: string,
  elevatorPitch: string,
  audience: string,
  desirableCues: string,
  undesirableCues: string
): Promise<{ success: boolean; data?: string[]; error?: string }> {
  try {
    if (!name || !elevatorPitch || !audience) {
      return { success: false, error: "Brand details are required." };
    }
    const result = await generateTaglines({ name, elevatorPitch, audience, desirableCues, undesirableCues });
    return { success: true, data: result.taglines };
  } catch (error) {
    console.error("Error generating tagline suggestion:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    return {
      success: false,
      error: `An unexpected error occurred while generating a tagline: ${errorMessage}`,
    };
  }
}

export async function getLogoSuggestion(
  name: string,
  elevatorPitch: string,
  audience: string,
  desirableCues: string,
  undesirableCues: string
): Promise<{ success: boolean; data?: string; error?: string }> {
  try {
    if (!name || !elevatorPitch || !audience) {
      return { success: false, error: "Brand details are required." };
    }
    const result = await generateLogo({ name, elevatorPitch, audience, desirableCues, undesirableCues });
    return { success: true, data: result.logoUrl };
  } catch (error) {
    console.error("Error generating logo suggestion:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    return {
      success: false,
      error: `An unexpected error occurred while generating a logo: ${errorMessage}`,
    };
  }
}

export async function generateAndSaveLogo(
  brandId: string,
  userId: string,
  brandName: string,
  brandElevatorPitch: string,
  brandAudience: string,
  brandDesirableCues: string,
  brandUndesirableCues: string
): Promise<{ success: boolean; data?: { logoUrl: string }; error?: string }> {
  try {
    const app = getAdminApp();
    const storage = getAdminStorage(app);
    const firestore = getFirestore(app);

    // 1. Generate the logo data URI using the Genkit flow
    const logoResult = await generateLogo({
      name: brandName,
      elevatorPitch: brandElevatorPitch,
      audience: brandAudience,
      desirableCues: brandDesirableCues,
      undesirableCues: brandUndesirableCues,
    });

    if (!logoResult.logoUrl) {
      throw new Error("Logo generation failed to return a data URI.");
    }
    const dataUri = logoResult.logoUrl;

    // 2. Convert data URI to a buffer
    const base64Data = dataUri.split(",")[1];
    if (!base64Data) {
      throw new Error("Invalid data URI format.");
    }
    const imageBuffer = Buffer.from(base64Data, "base64");

    // 3. Upload to Firebase Storage
    const bucket = storage.bucket();
    const fileName = `logos/${userId}/${brandId}/${Date.now()}.png`;
    const file = bucket.file(fileName);

    await file.save(imageBuffer, {
      metadata: {
        contentType: "image/png",
      },
    });

    // 4. Make the file public and construct the URL
    await file.makePublic();
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;


    // 5. Save the public URL and other data to Firestore
    const logoGenerationRef = firestore.collection(`users/${userId}/brands/${brandId}/logoGenerations`).doc();
    const brandRef = firestore.collection(`users/${userId}/brands`).doc(brandId);
    
    const logoData = {
      brandId,
      userId,
      logoUrl: publicUrl,
      createdAt: new Date(),
    };

    const batch = firestore.batch();
    batch.set(logoGenerationRef, logoData);
    batch.update(brandRef, { logoUrl: publicUrl });
    await batch.commit();

    return { success: true, data: { logoUrl: publicUrl } };
  } catch (error) {
    console.error("Error generating and saving logo:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred.";
    return {
      success: false,
      error: `An unexpected error occurred: ${errorMessage}`,
    };
  }
}
