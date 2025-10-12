"use server";

import { generateTargetAudienceDemographics } from "@/ai/flows/generate-target-audience-demographics";

export async function getAudienceSuggestions(
  elevatorPitch: string
): Promise<{ success: boolean; data?: string[]; error?: string }> {
  try {
    if (!elevatorPitch.trim()) {
      return { success: false, error: "Elevator pitch cannot be empty." };
    }
    const result = await generateTargetAudienceDemographics({ elevatorPitch });
    return { success: true, data: result.suggestedDemographics };
  } catch (error) {
    console.error("Error generating audience suggestions:", error);
    return {
      success: false,
      error: "An unexpected error occurred while generating suggestions.",
    };
  }
}
