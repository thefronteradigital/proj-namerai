/**
 * Domain Availability Checker Service
 * Using WhoisXMLAPI (100 free queries/month)
 *
 * Simple, functional approach - no classes
 */

type DomainStatus = "Available" | "Taken" | "Premium" | "Error";
type DomainCheckErrorType = "rate_limit" | "api_error" | "network_error";

export interface DomainResult {
  url: string;
  status: DomainStatus;
}

export interface DomainCheckError {
  type: DomainCheckErrorType;
  message: string;
}

interface WhoisXMLAPIResponse {
  DomainInfo: {
    domainAvailability: "AVAILABLE" | "UNAVAILABLE";
    domainName: string;
  };
}

interface WhoisXMLAPIErrorResponse {
  messages?: string;
  code?: number;
}

// Simple state management
let requestCount = 0;
let lastError: DomainCheckError | null = null;

/**
 * Get API key from environment
 */
function getApiKey(): string | undefined {
  return process.env.WHOISXML_API_KEY;
}

/**
 * Get current request count
 */
export function getRequestCount(): number {
  return requestCount;
}

/**
 * Get last error
 */
export function getLastError(): DomainCheckError | null {
  return lastError;
}

/**
 * Check if rate limit reached
 */
export function isRateLimitReached(): boolean {
  return false;
}

/**
 * Reset counter (for testing)
 */
export function resetCounter(): void {
  requestCount = 0;
  lastError = null;
}

/**
 * Check single domain with WhoisXML API
 */
async function checkWithWhoisXML(domain: string): Promise<DomainResult> {
  const apiKey = getApiKey();

  if (!apiKey) {
    lastError = {
      type: "api_error",
      message:
        "WhoisXML API key not configured. Please add WHOISXML_API_KEY to your .env.local file.",
    };
    throw new Error(lastError.message);
  }

  try {
    const url = `https://domain-availability.whoisxmlapi.com/api/v1?apiKey=${apiKey}&domainName=${domain}`;
    const response = await fetch(url);

    incrementDailyUsage();

    if (!response.ok) {
      const errorData: WhoisXMLAPIErrorResponse = await response
        .json()
        .catch(() => ({}));

      // Rate limit error
      if (response.status === 429 || errorData.messages?.includes("limit")) {
        lastError = {
          type: "rate_limit",
          message: `API rate limit reached. Please try again later.`,
        };
        throw new Error(lastError.message);
      }

      // Invalid API key
      if (response.status === 401 || response.status === 403) {
        lastError = {
          type: "api_error",
          message: "Invalid WhoisXML API key. Please check your credentials.",
        };
        throw new Error(lastError.message);
      }

      lastError = {
        type: "api_error",
        message: `WhoisXML API error: ${response.status} - ${
          errorData.messages || "Unknown error"
        }`,
      };
      throw new Error(lastError.message);
    }

    const data: WhoisXMLAPIResponse = await response.json();
    const isAvailable = data.DomainInfo.domainAvailability === "AVAILABLE";

    return {
      url: domain,
      status: isAvailable ? "Available" : "Taken",
    };
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));

    // Re-throw rate limit errors
    if (err.message?.includes("limit") || err.message?.includes("rate")) {
      throw err;
    }

    console.error("WhoisXML check failed:", err);

    // Network error
    if (err.name === "TypeError" || err.message?.includes("fetch")) {
      lastError = {
        type: "network_error",
        message:
          "Network error. Please check your internet connection and try again.",
      };
    } else if (!lastError) {
      lastError = {
        type: "api_error",
        message: err.message || "Domain check failed. Please try again.",
      };
    }

    throw err;
  }
}

/**
 * Check single domain availability
 */
export async function checkDomain(domain: string): Promise<DomainResult> {
  const cleanDomain = domain.toLowerCase().trim();

  try {
    console.log(`Checking domain: ${cleanDomain}`);
    const result = await checkWithWhoisXML(cleanDomain);
    console.log(`✓ Domain ${cleanDomain} is ${result.status}`);
    return result;
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error(`✗ Domain check failed for ${cleanDomain}:`, err.message);

    // Return error status instead of throwing
    return {
      url: cleanDomain,
      status: "Error",
    };
  }
}

/**
 * Check multiple domains (with rate limiting)
 */
export async function checkDomains(domains: string[]): Promise<DomainResult[]> {
  const results: DomainResult[] = [];

  for (let i = 0; i < domains.length; i++) {
    // Stop if rate limit reached
    if (isRateLimitReached()) {
      console.warn("⚠ Rate limit reached. Stopping domain checks.");

      // Mark remaining domains as Error
      for (let j = i; j < domains.length; j++) {
        results.push({ url: domains[j], status: "Error" });
      }
      break;
    }

    try {
      const result = await checkDomain(domains[i]);
      results.push(result);

      // Rate limiting: wait 200ms between requests
      if (i < domains.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 200));
      }
    } catch (error) {
      console.error(`Failed to check ${domains[i]}:`, error);
      results.push({ url: domains[i], status: "Error" });
    }
  }

  return results;
}

// Export object with all functions for backward compatibility
export const domainService = {
  checkDomain,
  checkDomains,
  getRequestCount,
  getLastError,
  isRateLimitReached,
  resetCounter,
};
