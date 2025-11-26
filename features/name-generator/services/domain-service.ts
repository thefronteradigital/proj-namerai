/**
 * Domain Availability Checker Service
 * Uses RDAP (Registration Data Access Protocol) - free, unlimited, no API key required
 *
 * Security Features:
 * - Request timeout protection
 * - Input validation and sanitization
 * - Batch size limits to prevent abuse
 * - Rate limiting with exponential backoff
 * - Error handling without exposing sensitive data
 */

import {
  checkDomain as rdapCheckDomain,
  type DomainCheckResult as RdapCheckResult,
} from "@/lib/rdap";
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

// Security & Configuration
const CONFIG = {
  // Request timeout (10 seconds for RDAP, faster than external APIs)
  REQUEST_TIMEOUT: 10000,
  // Delay between requests to avoid overwhelming RDAP servers
  REQUEST_DELAY_MS: 300,
  // Maximum domains per batch to prevent abuse
  MAX_DOMAINS_PER_BATCH: 10,
  // API base URL (RDAP is distributed)
  API_TYPE: "RDAP - Registration Data Access Protocol (Free, No API Key)",
};

// Rate limiter: 60 requests per minute (generous for RDAP)
const rateLimiter = createSlidingWindowLimiter("domain-checker", {
  maxRequests: 60,
  windowMs: 60 * 1000,
});

// Service state
let requestCount = 0;
let lastError: DomainCheckError | null = null;

/**
 * Validate and sanitize domain name
 * @param domain - Domain name to validate
 * @returns True if domain format is valid
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
 * Reset counter (for testing)
 */
export function resetCounter(): void {
  requestCount = 0;
  lastError = null;
  rateLimiter.reset();
}

/**
 * Convert RDAP result to domain result format
 */
function convertRdapResult(rdapResult: RdapCheckResult): DomainResult {
  return {
    url: rdapResult.domain,
    status: rdapResult.status as DomainStatus,
  };
}

/**
 * Check single domain with RDAP
 * No API key required - uses public RDAP endpoints
 *
 * @param domain - Domain name to check
 * @returns Domain availability result
 * @throws Error if validation fails or rate limit exceeded
 */
async function checkWithRDAP(domain: string): Promise<DomainResult> {
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

  try {
    // 3. Query RDAP endpoint
    const rdapResult = await rdapCheckDomain(domain);

    // 4. Record request for rate limiting
    recordRequest();

    // 5. Convert and return result
    return convertRdapResult(rdapResult);
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));

    // Re-throw rate limit errors
    if (err.message?.includes("limit") || err.message?.includes("rate")) {
      throw err;
    }

    console.error("RDAP check failed:", err);

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
 *
 * @param domain - Domain name to check
 * @returns Domain availability result with error handling
 */
export async function checkDomain(domain: string): Promise<DomainResult> {
  const cleanDomain = domain.toLowerCase().trim();

  try {
    console.log(`Checking domain: ${cleanDomain}`);
    const result = await checkWithRDAP(cleanDomain);
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
 *
 * @param domains - Array of domain names to check
 * @returns Array of domain availability results
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

      // 3. Request delay: wait between requests to avoid overwhelming RDAP servers
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

