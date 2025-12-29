/**
 * Groq AI Library Wrapper
 * 
 * This is a low-level library wrapper only - contains direct API calls to Groq
 * Business logic and service orchestration is in @/features/name-generator/services
 * 
 * For name generation service, see: @/features/name-generator/services/name-generator.ts
 */

import Groq from "groq-sdk";

/**
 * Groq API Configuration
 */
const GROQ_CONFIG = {
  model: "llama-3.1-8b-instant",
  temperature: 0.9,
  topP: 0.95,
  maxTokens: 2048,
};

/**
 * Generate content using Groq LLM
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
  const apiKey = process.env.GROQ_API_KEY || process.env.API_KEY;

  if (!apiKey) {
    throw new Error(
      "API Key is missing. Please set GROQ_API_KEY in your .env.local file."
    );
  }

  try {
    const groq = new Groq({ apiKey });

    const result = await groq.chat.completions.create({
      model: GROQ_CONFIG.model,
      messages: [
        {
          role: "system",
          content: systemInstruction,
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
      temperature: GROQ_CONFIG.temperature,
      top_p: GROQ_CONFIG.topP,
      max_tokens: GROQ_CONFIG.maxTokens,
    });

    const text = result.choices[0]?.message?.content;
    if (!text) {
      throw new Error("No response generated from API");
    }

    return text;
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error("Groq API Error:", err);
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
    cleanedText = cleanedText
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "");
  } else if (cleanedText.startsWith("```")) {
    cleanedText = cleanedText.replace(/```\n?/g, "");
  }
  const jsonStart = cleanedText.indexOf("{");
  const jsonEnd = cleanedText.lastIndexOf("}");
  if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
    cleanedText = cleanedText.slice(jsonStart, jsonEnd + 1);
  }
  return sanitizeJsonString(cleanedText);
}

function sanitizeJsonString(input: string): string {
  let result = "";
  let inString = false;
  let escaped = false;

  for (let i = 0; i < input.length; i += 1) {
    const char = input[i];

    if (inString) {
      if (escaped) {
        escaped = false;
        result += char;
        continue;
      }

      if (char === "\\") {
        escaped = true;
        result += char;
        continue;
      }

      if (char === "\"") {
        inString = false;
        result += char;
        continue;
      }

      if (char === "\n") {
        result += "\\n";
        continue;
      }

      if (char === "\r") {
        result += "\\r";
        continue;
      }

      if (char === "\t") {
        result += "\\t";
        continue;
      }

      result += char;
      continue;
    }

    if (char === "\"") {
      inString = true;
    }

    result += char === "“" || char === "”" ? "\"" : char;
  }

  return result;
}
