import Groq from "groq-sdk";
import {
  NAME_LENGTHS,
  type Language,
  type NamingStyle,
  type NameLength,
} from "../features/name-generator/constants/form-options";
import {
  domainService,
  type DomainResult,
} from "@/features/name-generator/services/domain-service";

export interface GeneratedName {
  name: string;
  meaning: string;
  languageOrigin: string;
  domains?: DomainResult[];
}

export interface FormState {
  language: Language;
  style: NamingStyle;
  length: NameLength;
  keywords: string;
  checkDomains: boolean;
}

/**
 * Get length guidance based on selected length
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
 * Get language guidance based on selected language
 */
const getLanguageGuidance = (language: string): string => {
  if (language === "Mix (Multilingual)") {
    return "Mix multiple languages creatively. Blend word roots from English, Malay, Japanese, and other languages. Create fusion names that sound international and unique.";
  }
  return `Use authentic word roots, phonetics, or shortened forms from ${language}.`;
};

export const generateNames = async (
  form: FormState
): Promise<GeneratedName[]> => {
  const apiKey = process.env.GROQ_API_KEY || process.env.API_KEY;

  if (!apiKey) {
    throw new Error(
      "API Key is missing. Please set GROQ_API_KEY in your .env.local file."
    );
  }

  try {
    const groq = new Groq({ apiKey });

    // Reset domain service error state
    domainService.resetCounter();

    // Construct System Instruction
    const systemInstruction = `You are a Multilingual Project Name Generator AI.
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
      "meaning": "Brief explanation of the name's meaning and origin",
      "languageOrigin": "Language(s) used",
      "suggestedDomains": ["projectname.com", "projectname.io", "projectname.ai"]
    }
  ]
}

Generate exactly 10 high-quality names. For each name, suggest 2-3 relevant domain extensions (.com, .io, .ai, .app, .my, .jp, etc.).`;

    // Construct User Prompt
    const userPrompt = `Generate project names based on:
- Language: ${form.language}
- Style: ${form.style}
- Length: ${form.length}
- Keywords: ${form.keywords || "None"}

Return ONLY valid JSON. No markdown, no explanations.`;

    // Call Groq API with Llama 3.1 8B Instant
    const result = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
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
      temperature: 0.9,
      top_p: 0.95,
      max_tokens: 1024,
    });

    // Extract and parse response
    const text = result.choices[0]?.message?.content;
    if (!text) {
      throw new Error("No response generated from API");
    }

    // Clean up response (remove markdown if present)
    let cleanedText = text.trim();
    if (cleanedText.startsWith("```json")) {
      cleanedText = cleanedText
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "");
    } else if (cleanedText.startsWith("```")) {
      cleanedText = cleanedText.replace(/```\n?/g, "");
    }

    const parsed = JSON.parse(cleanedText);

    if (!parsed.names || !Array.isArray(parsed.names)) {
      throw new Error("Invalid response format from API");
    }

    console.log(`✅ Successfully generated ${parsed.names.length} names`);

    // Process domain checking if enabled
    if (form.checkDomains) {
      console.log("🔍 Starting domain availability checks...");

      const namesWithDomains: GeneratedName[] = [];

      for (const nameItem of parsed.names) {
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
              const remainingNames = parsed.names.slice(
                namesWithDomains.length
              );
              namesWithDomains.push(
                ...remainingNames.map((n: GeneratedName) => ({
                  ...n,
                  domains: [],
                }))
              );
              break;
            }
          } catch (error) {
            const err =
              error instanceof Error ? error : new Error(String(error));
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

    // Return without domain checking
    return parsed.names.map((n: GeneratedName) => ({
      ...n,
      domains: [],
    }));
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error("Groq Service Error:", err);

    // Provide more specific error messages
    if (
      err.message?.includes("API key") ||
      err.message?.includes("api_key") ||
      err.message?.includes("authentication")
    ) {
      throw new Error(
        "Invalid API Key. Please check your GROQ_API_KEY in .env.local"
      );
    }

    if (
      err.message?.includes("quota") ||
      err.message?.includes("rate_limit") ||
      err.message?.includes("429")
    ) {
      throw new Error(
        "API quota exceeded. Please try again later or check your rate limits."
      );
    }

    if (err.message?.includes("network") || err.message?.includes("fetch")) {
      throw new Error("Network error. Please check your internet connection.");
    }

    if (err.message?.includes("JSON")) {
      throw new Error("Failed to parse AI response. Please try again.");
    }

    throw new Error(
      err.message || "Failed to generate names. Please try again."
    );
  }
};
