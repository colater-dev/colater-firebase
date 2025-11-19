
"use server";

import { generateTaglines } from "@/ai/flows/generate-tagline";
import { generateLogo } from "@/ai/flows/generate-logo";
import { generateBrandDetails } from "@/ai/flows/generate-brand-details";
import { colorizeLogo, ColorizeLogoInput } from "@/ai/flows/colorize-logo";
import { uploadDataUriToStorage } from "@/lib/storage";
import { generateLogoOpenAI } from "@/ai/flows/generate-logo-openai";
import { generateLogoFal } from "@/ai/flows/generate-logo-fal";
import { completeBrandDetails } from "@/ai/flows/complete-brand-details";
import { generateLogoConcept } from "@/ai/flows/generate-logo-concept";

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
): Promise<{ success: boolean; data?: string; error?: string }> {
  console.log("getLogoSuggestion: Starting...");
  try {
    if (!name || !elevatorPitch || !audience) {
      console.error("getLogoSuggestion: Missing brand details.");
      return { success: false, error: "Brand details are required." };
    }
    console.log("getLogoSuggestion: Brand details are present.");

    const result = await generateLogoFal({ name, elevatorPitch, audience, desirableCues, undesirableCues });
    console.log("getLogoSuggestion: AI generation complete.");

    if (!result || !result.logoUrl) {
      console.error("getLogoSuggestion: AI did not return a logoUrl.");
      throw new Error("AI image generation failed to return a result.");
    }
    // Log the beginning of the data URI to confirm it's what we expect
    console.log("getLogoSuggestion: Received data URI from AI:", result.logoUrl.substring(0, 100));

    // Return the data URI directly - upload will happen on client side
    return { success: true, data: result.logoUrl };
  } catch (error) {
    console.error("Error in getLogoSuggestion action:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    return {
      success: false,
      error: `An unexpected error occurred while generating a logo: ${errorMessage}`,
    };
  }
}

export async function getLogoSuggestionOpenAI(
  name: string,
  elevatorPitch: string,
  audience: string,
  desirableCues: string,
  undesirableCues: string,
  options?: { size?: '512x512' | '768x768' | '1024x1024'; concept?: string }
): Promise<{ success: boolean; data?: string; error?: string }> {
  try {
    if (!name || !elevatorPitch || !audience) {
      return { success: false, error: "Brand details are required." };
    }
    const result = await generateLogoOpenAI({
      name,
      elevatorPitch,
      audience,
      desirableCues,
      undesirableCues,
      size: options?.size,
      concept: options?.concept,
    });
    if (!result || !result.logoUrl) {
      throw new Error("OpenAI image generation failed to return a result.");
    }
    return { success: true, data: result.logoUrl };
  } catch (error) {
    console.error("Error in getLogoSuggestionOpenAI action:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    return { success: false, error: `An unexpected error occurred while generating a logo (OpenAI): ${errorMessage}` };
  }
}

export async function getLogoSuggestionFal(
  name: string,
  elevatorPitch: string,
  audience: string,
  desirableCues: string,
  undesirableCues: string,
  concept?: string,
): Promise<{ success: boolean; data?: string; error?: string }> {
  try {
    if (!name || !elevatorPitch || !audience) {
      return { success: false, error: "Brand details are required." };
    }
    const result = await generateLogoFal({
      name,
      elevatorPitch,
      audience,
      desirableCues,
      undesirableCues,
      concept,
    });
    if (!result || !result.logoUrl) {
      throw new Error("Fal image generation failed to return a result.");
    }
    return { success: true, data: result.logoUrl };
  } catch (error) {
    console.error("Error in getLogoSuggestionFal action:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    return { success: false, error: `An unexpected error occurred while generating a logo (Fal): ${errorMessage}` };
  }
}


export async function getBrandCompletion(
  name: string,
  elevatorPitch: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    if (!name || !elevatorPitch) {
      return { success: false, error: "Name and elevator pitch are required." };
    }
    const result = await completeBrandDetails({ name, elevatorPitch });
    return { success: true, data: result };
  } catch (error) {
    console.error("Error completing brand details:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    return {
      success: false,
      error: `An unexpected error occurred while completing brand details: ${errorMessage}`,
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
): Promise<{ success: boolean; data?: { colorLogoUrl: string; palette: string[] }; error?: string }> {
  try {
    if (!input.logoUrl || !input.name || !input.elevatorPitch || !input.audience) {
      return { success: false, error: "A logo and brand details are required to generate a color logo." };
    }

    const result = await colorizeLogo(input);

    // Return the data URI directly - upload will happen on client side
    return { success: true, data: result };
  } catch (error) {
    console.error("Error colorizing logo:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    return {
      success: false,
      error: `An unexpected error occurred while colorizing the logo: ${errorMessage}`,
    };
  }
}

export async function getLogoConcept(
  name: string,
  elevatorPitch: string,
  audience: string,
  desirableCues: string,
  undesirableCues: string,
): Promise<{ success: boolean; data?: { concept: string; stylePrompt: string }; error?: string }> {
  try {
    if (!name || !elevatorPitch || !audience) {
      return { success: false, error: "Brand details are required." };
    }
    const result = await generateLogoConcept({ name, elevatorPitch, audience, desirableCues, undesirableCues });
    return { success: true, data: result };
  } catch (error) {
    console.error("Error generating logo concept:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    return {
      success: false,
      error: `An unexpected error occurred while generating logo concept: ${errorMessage}`,
    };
  }
}
