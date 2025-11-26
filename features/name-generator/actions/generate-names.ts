'use server';

import { generateNames, type FormState, type GeneratedName } from '../services/groq-service';
import { domainService } from '../services/domain-service';

interface GenerateNamesResult {
  results: GeneratedName[];
  error: string | null;
  rateLimitWarning: string | null;
}

export async function generateNamesAction(
  formState: FormState
): Promise<GenerateNamesResult> {
  let results: GeneratedName[] = [];
  let error: string | null = null;
  let rateLimitWarning: string | null = null;

  try {
    results = await generateNames(formState);

    // Check for rate limit warnings
    if (formState.checkDomains) {
      const lastError = domainService.getLastError();
      if (lastError?.type === 'rate_limit') {
        rateLimitWarning = lastError.message;
      }
    }
  } catch (err) {
    const errorObj = err instanceof Error ? err : new Error(String(err));
    console.error('Generate Names Action Error:', errorObj);
    
    // Check if it's a domain check error
    const lastError = domainService.getLastError();
    if (lastError) {
      error = lastError.message;
    } else {
      error = errorObj.message || "Something went wrong. Please try again.";
    }
  }

  return {
    results,
    error,
    rateLimitWarning,
  };
}
