/**
 * Domain Availability Checker Service
 * Using WhoisXMLAPI with security best practices and rate limiting
 *
 * Security Features:
 * - Rate limiting (per-request and per-batch)
 * - Request timeout protection
 * - API key validation
 * - Input validation and sanitization
 * - Error handling without exposing sensitive data
 */

import {
  createSlidingWindowLimiter,
  formatRateLimitError,
  waitForNextRequest,
} from "@/lib/rate-limit";

/**
 * Domain status enumeration
 */
type DomainStatus = "Available" | "Taken" | "Premium" | "Error";

/**
 * Domain check error type enumeration
 */
type DomainCheckErrorType = "rate_limit" | "api_error" | "network_error";

/**
 * Result of a domain availability check
 */
export interface DomainResult {
  url: string;
  status: DomainStatus;
}

/**
 * Domain check error details
 */
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

// Security & Configuration
const CONFIG = {
  // Request timeout (30 seconds)
  REQUEST_TIMEOUT: 30000,
  // Delay between requests to avoid overwhelming the API
  REQUEST_DELAY_MS: 500,
  // Maximum domains per batch to prevent abuse
  MAX_DOMAINS_PER_BATCH: 10,
  // API base URL
  API_BASE_URL: "https://domain-availability.whoisxmlapi.com/api/v1",
};

// Rate limiter: 60 requests per minute
const rateLimiter = createSlidingWindowLimiter("domain-checker", {
  maxRequests: 60,
  windowMs: 60 * 1000,
});

// Service state
let requestCount = 0;
let lastError: DomainCheckError | null = null;

/**
 * Validate and sanitize domain name
 */
function validateDomain(domain: string): boolean {
  // Domain regex: allows alphanumeric, hyphens, and dots
  // Length: 1-253 characters (RFC 1035)
  const domainRegex =
    /^([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
  return domainRegex.test(domain) && domain.length <= 253;
}

/**
 * Record request for rate limiting
 */
function recordRequest(): void {
  const result = rateLimiter.isAllowed();
  if (result.allowed) {
    requestCount++;
  }
}

/**
 * Get API key from environment with validation
 */
function getApiKey(): string | undefined {
  const apiKey = process.env.WHOISXML_API_KEY;

  // Validate API key format (should be a non-empty string)
  if (apiKey && typeof apiKey === "string" && apiKey.length > 0) {
    return apiKey;
  }

  return undefined;
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
  const status = rateLimiter.getStatus();
  return !status.allowed;
}

/**
 * Fetch with timeout protection
 */
async function fetchWithTimeout(
  url: string,
  timeout: number = CONFIG.REQUEST_TIMEOUT
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Namer-AI/1.0",
      },
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
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
 * Includes security checks and rate limiting
 */
async function checkWithWhoisXML(domain: string): Promise<DomainResult> {
  // 1. Validate domain format
  if (!validateDomain(domain)) {
    lastError = {
      type: "api_error",
      message: "Invalid domain format.",
    };
    throw new Error(lastError.message);
  }

  // 2. Check rate limit
  const rateLimitStatus = rateLimiter.getStatus();
  if (!rateLimitStatus.allowed) {
    const errorMsg = formatRateLimitError(rateLimitStatus);
    lastError = {
      type: "rate_limit",
      message: errorMsg,
    };
    throw new Error(lastError.message);
  }

  // 3. Get and validate API key
  const apiKey = getApiKey();
  if (!apiKey) {
    lastError = {
      type: "api_error",
      message:
        "API key not configured. Please set WHOISXML_API_KEY in your .env file.",
    };
    throw new Error(lastError.message);
  }

  try {
    // 4. Build secure URL using URLSearchParams (prevents injection)
    const params = new URLSearchParams({
      apiKey,
      domainName: domain,
    });
    const url = `${CONFIG.API_BASE_URL}?${params.toString()}`;

    // 5. Make request with timeout protection
    const response = await fetchWithTimeout(url);

    // 6. Record successful request for rate limiting
    recordRequest();

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
 * Check multiple domains with security validation
 * - Limits batch size to prevent abuse
 * - Implements request delays between API calls
 * - Handles rate limiting gracefully
 */
export async function checkDomains(domains: string[]): Promise<DomainResult[]> {
  const results: DomainResult[] = [];

  // 1. Validate input
  if (!Array.isArray(domains) || domains.length === 0) {
    console.warn("⚠ Invalid domains input.");
    return results;
  }

  // 2. Enforce maximum batch size to prevent abuse
  if (domains.length > CONFIG.MAX_DOMAINS_PER_BATCH) {
    console.warn(
      `⚠ Batch size limited to ${CONFIG.MAX_DOMAINS_PER_BATCH}. Processing first ${CONFIG.MAX_DOMAINS_PER_BATCH} domains only.`
    );
  }

  const domainsToCheck = domains.slice(0, CONFIG.MAX_DOMAINS_PER_BATCH);

  for (let i = 0; i < domainsToCheck.length; i++) {
    // Check rate limit before each request
    if (isRateLimitReached()) {
      console.warn(
        "⚠ Rate limit reached. Stopping domain checks to avoid abuse."
      );

      // Mark remaining domains as Error
      for (let j = i; j < domainsToCheck.length; j++) {
        results.push({ url: domainsToCheck[j], status: "Error" });
      }
      break;
    }

    try {
      const result = await checkDomain(domainsToCheck[i]);
      results.push(result);

      // 3. Request delay: wait between requests to avoid overwhelming the API
      if (i < domainsToCheck.length - 1) {
        await waitForNextRequest(CONFIG.REQUEST_DELAY_MS);
      }
    } catch (error) {
      console.error(`Failed to check ${domainsToCheck[i]}:`, error);
      results.push({ url: domainsToCheck[i], status: "Error" });
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
