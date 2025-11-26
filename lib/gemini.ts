/**
 * Google Gemini AI Library Wrapper
 *
 * This is a low-level library wrapper only - contains direct API calls to Google Gemini
 * Business logic and service orchestration is in @/features/name-generator/services
 *
 * For name generation service, see: @/features/name-generator/services/name-generator.ts
 */

import { GoogleGenAI } from "@google/genai";

/**
 * Gemini API Configuration
 */
const GEMINI_CONFIG = {
  model: "gemini-2.0-flash-exp",
  temperature: 0.9,
  topP: 0.95,
  topK: 40,
};

/**
 * Generate content using Google Gemini
 * Low-level library function - used by name generator service
 *
 * @param systemInstruction - System prompt for AI behavior
 * @param userPrompt - User's input prompt
 * @returns Generated text response
 */
export async function generateContent(
  systemInstruction: string,
  userPrompt: string
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;

  if (!apiKey) {
    throw new Error(
      "API Key is missing. Please set GEMINI_API_KEY in your .env.local file."
    );
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    const result = await ai.models.generateContent({
      model: GEMINI_CONFIG.model,
      contents: systemInstruction + "\n\n" + userPrompt,
      config: {
        temperature: GEMINI_CONFIG.temperature,
        topP: GEMINI_CONFIG.topP,
        topK: GEMINI_CONFIG.topK,
      },
    });

    const text = result.text;
    if (!text) {
      throw new Error("No response generated from API");
    }

    return text;
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error("Gemini API Error:", err);
    throw err;
  }
}

/**
 * Clean JSON response from API (removes markdown formatting)
 *
 * @param text - Raw text response from API
 * @returns Cleaned JSON string
 */
export function cleanJsonResponse(text: string): string {
  let cleanedText = text.trim();
  if (cleanedText.startsWith("```json")) {
    cleanedText = cleanedText.replace(/```json\n?/g, "").replace(/```\n?/g, "");
  } else if (cleanedText.startsWith("```")) {
    cleanedText = cleanedText.replace(/```\n?/g, "");
  }
  return cleanedText;
}
