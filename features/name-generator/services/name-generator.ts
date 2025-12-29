/**
 * Name Generator Service
 * Business logic for generating brand names using AI
 *
 * This service:
 * - Orchestrates AI API calls (Gemini or Groq)
 * - Handles domain checking integration
 * - Manages error handling and validation
 * - Formats responses
 */

import {
  generateContent as generateGeminiContent,
  cleanJsonResponse as cleanGeminiJson,
} from "@/lib/gemini";
import {
  generateContent as generateGroqContent,
  cleanJsonResponse as cleanGroqJson,
} from "@/lib/groq";
import {
  NAME_LENGTHS,
  type Language,
  type NamingStyle,
  type NameLength,
} from "../constants/form-options";
import { domainService, type DomainResult } from "./domain-service";

/**
 * Generated name with optional domain results
 */
export interface GeneratedName {
  name: string;
  meaning: string;
  languageOrigin: string;
  suggestedDomains?: string[];
  domains?: DomainResult[];
}

/**
 * Form state for name generation
 */
export interface FormState {
  language: Language;
  style: NamingStyle;
  length: NameLength;
  keywords: string;
  checkDomains: boolean;
}

/**
 * Get length guidance for AI prompt
 */
const getLengthGuidance = (length: NameLength): string => {
  switch (length) {
    case NAME_LENGTHS.SHORT:
      return "Generate SHORT, single-word names (like 'Wix', 'Google', 'Uber', 'Zoom'). One word only, concise and memorable.";
    case NAME_LENGTHS.MEDIUM:
      return "Generate MEDIUM length names with 2 words or compound words (like 'Facebook', 'YouTube', 'LinkedIn', 'AirBnB'). Two words max.";
    case NAME_LENGTHS.LONG:
      return "Generate LONGER names with 3 or more words or descriptive phrases (like 'The Coffee House', 'Blue Horizon Studios'). Can be 3+ words.";
    default:
      return "Generate names of varying lengths.";
  }
};

/**
 * Get language guidance for AI prompt
 */
const getLanguageGuidance = (language: string): string => {
  if (language === "Mix (Multilingual)") {
    return "Mix multiple languages creatively. Blend word roots from English, Malay, Japanese, and other languages. Create fusion names that sound international and unique.";
  }
  return `Use authentic word roots, phonetics, or shortened forms from ${language}.`;
};

/**
 * Generate AI system instruction prompt
 */
function getSystemInstruction(form: FormState): string {
  return `You are a Multilingual Project Name Generator AI.
Your task is to generate unique, brandable project names based on the user's input.

1. LANGUAGE SELECTION
${getLanguageGuidance(form.language)}
Names may blend with English-based suffixes like -tech, -labs, -works, -nova, etc.

2. NAME STYLE
Follow the tone: ${form.style}.

3. NAME LENGTH
${getLengthGuidance(form.length)}

4. OUTPUT FORMAT
Return your response as a JSON object with this structure:
{
  "names": [
    {
      "name": "ProjectName",
      "meaning": "2-3 sentence explanation of the name's meaning, origin, and why it fits the project. No quotes or line breaks.",
      "languageOrigin": "Language(s) used",
      "suggestedDomains": ["projectname.com", "projectname.my", "projectname.com.my", "projectname.shop", "projectname.ai", "projectname.net", "projectname.org", "projectname.edu.my", "projectname.biz.my", "projectname.xyz"]
    }
  ]
}

Generate exactly 20 high-quality names. For each name, you MUST suggest exactly these 10 domain extensions in this order:
1. .com
2. .my
3. .com.my
4. .shop
5. .ai
6. .net
7. .org
8. .edu.my
9. .biz.my
10. .xyz

Always provide all 10 domains for every name.`;
}

/**
 * Generate user prompt
 */
function getUserPrompt(form: FormState): string {
  return `Generate project names based on:
- Language: ${form.language}
- Style: ${form.style}
- Length: ${form.length}
- Keywords: ${form.keywords || "None"}

Return ONLY valid JSON. No markdown, no explanations.
Use double quotes for all keys and string values.
Do not include unescaped quotes or line breaks inside strings.`;
}

/**
 * Generate names using Gemini AI
 */
export async function generateNamesWithGemini(
  form: FormState
): Promise<GeneratedName[]> {
  try {
    const systemInstruction = getSystemInstruction(form);
    const userPrompt = getUserPrompt(form);

    // Reset domain service state
    domainService.resetCounter();

    // Call Gemini API
    const text = await generateGeminiContent(systemInstruction, userPrompt);
    const cleanedText = cleanGeminiJson(text);
    const parsed = JSON.parse(cleanedText);

    if (!parsed.names || !Array.isArray(parsed.names)) {
      throw new Error("Invalid response format from API");
    }

    console.log(`✅ Successfully generated ${parsed.names.length} names`);

    // Ensure all names have required domain extensions
    const namesWithRequiredDomains = ensureRequiredDomains(parsed.names);

    // Process domain checking if enabled
    if (form.checkDomains) {
      return await processDomainChecks(namesWithRequiredDomains);
    }

    return namesWithRequiredDomains.map((n: GeneratedName) => ({
      ...n,
      domains: [],
    }));
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error("Name Generation Error (Gemini):", err);
    throw formatError(err, "Gemini");
  }
}

/**
 * Generate names using Groq AI
 */
export async function generateNamesWithGroq(
  form: FormState
): Promise<GeneratedName[]> {
  try {
    const systemInstruction = getSystemInstruction(form);
    const userPrompt = getUserPrompt(form);

    // Reset domain service state
    domainService.resetCounter();

    // Call Groq API
    const text = await generateGroqContent(systemInstruction, userPrompt);
    const cleanedText = cleanGroqJson(text);
    const parsed = JSON.parse(cleanedText);

    if (!parsed.names || !Array.isArray(parsed.names)) {
      throw new Error("Invalid response format from API");
    }

    console.log(`✅ Successfully generated ${parsed.names.length} names`);

    // Ensure all names have required domain extensions
    const namesWithRequiredDomains = ensureRequiredDomains(parsed.names);

    // Process domain checking if enabled
    if (form.checkDomains) {
      return await processDomainChecks(namesWithRequiredDomains);
    }

    return namesWithRequiredDomains.map((n: GeneratedName) => ({
      ...n,
      domains: [],
    }));
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error("Name Generation Error (Groq):", err);
    throw formatError(err, "Groq");
  }
}

/**
 * Ensure all names have the required domain suggestions
 * Fallback to generating them from the name if AI didn't provide them
 */
function ensureRequiredDomains(names: GeneratedName[]): GeneratedName[] {
  const requiredExtensions = [
    ".com",
    ".my",
    ".com.my",
    ".shop",
    ".ai",
    ".net",
    ".org",
    ".edu.my",
    ".biz.my",
    ".xyz",
  ];
  
  return names.map((nameItem) => {
    const suggestedDomains = nameItem.suggestedDomains || [];
    const nameLower = nameItem.name.toLowerCase().replace(/[^a-z0-9]/g, "");
    
    // Check which required extensions are missing
    const missingExtensions = requiredExtensions.filter(
      ext => !suggestedDomains.some(domain => domain.endsWith(ext))
    );
    
    // Add missing domains
    const additionalDomains = missingExtensions.map(ext => `${nameLower}${ext}`);
    const allDomains = [...suggestedDomains, ...additionalDomains];
    
    // Ensure we have all required extensions in the correct order
    const orderedDomains = requiredExtensions.map(
      (ext) => allDomains.find((d) => d.endsWith(ext)) || `${nameLower}${ext}`
    );
    
    return {
      ...nameItem,
      suggestedDomains: orderedDomains,
    };
  });
}

/**
 * Process domain checks for generated names
 */
async function processDomainChecks(
  names: GeneratedName[]
): Promise<GeneratedName[]> {
  console.log("🔍 Starting domain availability checks...");

  // Ensure all names have the required domain extensions
  const namesWithRequiredDomains = ensureRequiredDomains(names);

  const namesWithDomains: GeneratedName[] = [];

  for (const nameItem of namesWithRequiredDomains) {
    const suggestedDomains = nameItem.suggestedDomains || [];

    if (suggestedDomains.length > 0) {
      try {
        console.log(`Checking domains for "${nameItem.name}"...`);
        const domainResults = await domainService.checkDomains(
          suggestedDomains
        );

        namesWithDomains.push({
          ...nameItem,
          domains: domainResults,
        });

        // Check if rate limit reached
        if (domainService.isRateLimitReached()) {
          console.warn("⚠ Rate limit reached. Stopping domain checks.");
          // Add remaining names without domain checks
          const remainingNames = namesWithRequiredDomains.slice(namesWithDomains.length);
          namesWithDomains.push(
            ...remainingNames.map((n: GeneratedName) => ({
              ...n,
              domains: [],
            }))
          );
          break;
        }
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        console.error(`Domain check failed for ${nameItem.name}:`, err);
        namesWithDomains.push({
          ...nameItem,
          domains: suggestedDomains.map((d: string) => ({
            url: d,
            status: "Error" as const,
          })),
        });
      }
    } else {
      namesWithDomains.push({
        ...nameItem,
        domains: [],
      });
    }
  }

  // Show rate limit warning if reached
  const lastError = domainService.getLastError();
  if (lastError?.type === "rate_limit") {
    console.warn(`⚠ ${lastError.message}`);
  }

  return namesWithDomains;
}

/**
 * Format API errors with helpful messages
 */
function formatError(err: Error, apiName: string): Error {
  // API Key errors
  if (
    err.message?.includes("API key") ||
    err.message?.includes("API_KEY_INVALID") ||
    err.message?.includes("api_key") ||
    err.message?.includes("authentication")
  ) {
    const keyName = apiName === "Gemini" ? "GEMINI_API_KEY" : "GROQ_API_KEY";
    return new Error(
      `Invalid API Key. Please check your ${keyName} in .env.local`
    );
  }

  // Quota/Rate limit errors
  if (
    err.message?.includes("quota") ||
    err.message?.includes("RESOURCE_EXHAUSTED") ||
    err.message?.includes("rate_limit") ||
    err.message?.includes("429")
  ) {
    return new Error(
      "API quota exceeded. Please try again later or check your billing."
    );
  }

  // Network errors
  if (err.message?.includes("network") || err.message?.includes("fetch")) {
    return new Error("Network error. Please check your internet connection.");
  }

  // JSON parsing errors
  if (err.message?.includes("JSON")) {
    return new Error("Failed to parse AI response. Please try again.");
  }

  return new Error(
    err.message || "Failed to generate names. Please try again."
  );
}
