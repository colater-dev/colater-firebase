"use server";

import { generateTaglines } from "@/ai/flows/generate-tagline";

export async function getTaglineSuggestions(
  name: string,
  elevatorPitch: string,
  audience: string
): Promise<{ success: boolean; data?: string[]; error?: string }> {
  try {
    if (!name || !elevatorPitch || !audience) {
      return { success: false, error: "Brand details are required." };
    }
    const result = await generateTaglines({ name, elevatorPitch, audience });
    return { success: true, data: result.taglines };
  } catch (error) {
    console.error("Error generating tagline suggestion:", error);
    return {
      success: false,
      error: "An unexpected error occurred while generating a tagline.",
    };
  }
}
