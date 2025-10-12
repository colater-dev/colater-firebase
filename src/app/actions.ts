"use server";

import { generateTaglines } from "@/ai/flows/generate-tagline";
import { generateLogo } from "@/ai/flows/generate-logo";
import { generateBrandDetails } from "@/ai/flows/generate-brand-details";

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
