
"use server";

import { generateTaglines } from "@/ai/flows/generate-tagline";
import { generateLogo } from "@/ai/flows/generate-logo";
import { generateBrandDetails } from "@/ai/flows/generate-brand-details";
import { colorizeLogo, ColorizeLogoInput } from "@/ai/flows/colorize-logo";
import { uploadDataUriToStorage } from "@/lib/storage";

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
  undesirableCues: string,
  userId: string,
): Promise<{ success: boolean; data?: string; error?: string }> {
  try {
    if (!name || !elevatorPitch || !audience) {
      return { success: false, error: "Brand details are required." };
    }
    if (!userId) {
      return { success: false, error: "User ID is required for storage." };
    }

    const result = await generateLogo({ name, elevatorPitch, audience, desirableCues, undesirableCues });
    const logoUrl = await uploadDataUriToStorage(result.logoUrl, userId);

    return { success: true, data: logoUrl };
  } catch (error) {
    console.error("Error generating logo suggestion:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    return {
      success: false,
      error: `An unexpected error occurred while generating a logo: ${errorMessage}`,
    };
  }
}

export async function getBrandSuggestions(topic: string): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    if (!topic) {
      return { success: false, error: "Topic is required." };
    }
    const result = await generateBrandDetails({ topic });
    return { success: true, data: result };
  } catch (error) {
    console.error("Error generating brand suggestions:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    return {
      success: false,
      error: `An unexpected error occurred while generating brand details: ${errorMessage}`,
    };
  }
}

export async function convertUrlToDataUri(url: string): Promise<{ success: boolean; data?: string; error?: string }> {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch image: ${response.statusText}`);
        }
        // Firebase Storage URLs often return 'application/octet-stream'.
        // We know our logos are PNGs, so we'll explicitly set the MIME type.
        const contentType = 'image/png';
        const buffer = await response.arrayBuffer();
        const base64 = Buffer.from(buffer).toString('base64');
        const dataUri = `data:${contentType};base64,${base64}`;
        return { success: true, data: dataUri };
    } catch (error) {
        console.error("Error converting URL to data URI:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        return {
            success: false,
            error: `Could not process image for colorization: ${errorMessage}`,
        };
    }
}


export async function getColorizedLogo(
  input: ColorizeLogoInput,
  userId: string,
): Promise<{ success: boolean; data?: { colorLogoUrl: string; palette: string[] }; error?: string }> {
  try {
     if (!input.logoUrl || !input.name || !input.elevatorPitch || !input.audience) {
      return { success: false, error: "A logo and brand details are required to generate a color logo." };
    }
    if (!userId) {
      return { success: false, error: "User ID is required for storage." };
    }

    const result = await colorizeLogo(input);
    const colorLogoUrl = await uploadDataUriToStorage(result.colorLogoUrl, userId);

    return { success: true, data: { ...result, colorLogoUrl } };
  } catch (error) {
    console.error("Error colorizing logo:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    return {
      success: false,
      error: `An unexpected error occurred while colorizing the logo: ${errorMessage}`,
    };
  }
}
