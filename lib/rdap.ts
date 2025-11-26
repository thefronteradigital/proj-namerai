/**
 * RDAP Domain Availability Checker Library
 * Uses Registration Data Access Protocol (RDAP) - the official WHOIS replacement
 * Free, unlimited queries - no API key required
 *
 * This is a library wrapper only - contains low-level RDAP API calls
 * Business logic and service orchestration is in @/features/name-generator/services
 *
 * RDAP Endpoints:
 * - .com/.net: https://rdap.verisign.com/com/v1/domain/
 * - .org: https://rdap.publicinterestregistry.net/rdap/org/domain/
 * - Generic TLDs: https://rdap.iana.org/
 */

export interface DomainCheckResult {
  domain: string;
  available: boolean;
  status: "Available" | "Taken" | "Error";
  registrar?: string;
  registrationDate?: string;
  expirationDate?: string;
  error?: string;
}

interface RdapResponse {
  objectClassName?: string;
  handle?: string;
  ldhName?: string;
  registrar?: {
    objectClassName: string;
  };
  status?: string[];
  events?: Array<{
    eventAction: string;
    eventDate: string;
  }>;
}

/**
 * Configuration for RDAP endpoints by TLD
 */
const RDAP_ENDPOINTS: Record<string, string> = {
  com: "https://rdap.verisign.com/com/v1/domain/",
  net: "https://rdap.verisign.com/net/v1/domain/",
  org: "https://rdap.publicinterestregistry.net/rdap/org/domain/",
  edu: "https://rdap.educause.edu/rdap/domain/",
  gov: "https://rdap.dotgov.gov/rdap/domain/",
  info: "https://rdap.afilias.info/rdap/domain/",
  biz: "https://rdap.neulevel.biz/rdap/domain/",
  mobi: "https://rdap.dotmobi.mobi/rdap/domain/",
  asia: "https://rdap.iana.org/rdap/domain/",
  coop: "https://rdap.iana.org/rdap/domain/",
  name: "https://rdap.iana.org/rdap/domain/",
  museum: "https://rdap.iana.org/rdap/domain/",
  pro: "https://rdap.iana.org/rdap/domain/",
  tel: "https://rdap.iana.org/rdap/domain/",
  travel: "https://rdap.iana.org/rdap/domain/",
  xxx: "https://rdap.iana.org/rdap/domain/",
  my: "https://rdap.mynic.my/rdap/domain/",
  jp: "https://rdap.nic.ad.jp/rdap/domain/",
  in: "https://rdap.registry.in/rdap/domain/",
};

/**
 * Extract TLD from domain
 */
function getTLD(domain: string): string {
  const parts = domain.toLowerCase().split(".");
  return parts[parts.length - 1];
}

/**
 * Get RDAP endpoint for domain TLD
 */
function getRDAPEndpoint(domain: string): string {
  const tld = getTLD(domain);
  return RDAP_ENDPOINTS[tld] || RDAP_ENDPOINTS.com; // Fallback to com endpoint
}

/**
 * Check domain availability using RDAP with timeout protection
 * Low-level library function - used by domain service
 */
export async function checkDomain(domain: string): Promise<DomainCheckResult> {
  const cleanDomain = domain.toLowerCase().trim();

  try {
    const endpoint = getRDAPEndpoint(cleanDomain);
    const url = `${endpoint}${cleanDomain}`;

    // RDAP request with timeout (10 seconds, faster than WhoisXML)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          "User-Agent": "Namer-AI/1.0 (+https://namer.ai)",
          Accept: "application/rdap+json",
        },
      });

      clearTimeout(timeoutId);

      // 404 = Available, 200 = Taken, 403/429 = Error
      if (response.status === 404) {
        return {
          domain: cleanDomain,
          available: true,
          status: "Available",
        };
      }

      if (response.status === 200) {
        const data: RdapResponse = await response.json().catch(() => ({}));
        const registrationDate = data.events?.find(
          (e) => e.eventAction === "registration"
        )?.eventDate;
        const expirationDate = data.events?.find(
          (e) => e.eventAction === "expiration"
        )?.eventDate;

        return {
          domain: cleanDomain,
          available: false,
          status: "Taken",
          registrar: data.registrar?.objectClassName,
          registrationDate,
          expirationDate,
        };
      }

      // Rate limit or other error
      if (response.status === 429) {
        return {
          domain: cleanDomain,
          available: false,
          status: "Error",
          error: "Rate limited by RDAP server. Please try again later.",
        };
      }

      if (response.status === 403) {
        return {
          domain: cleanDomain,
          available: false,
          status: "Error",
          error: "Access denied by RDAP server.",
        };
      }

      // Server errors
      if (response.status >= 500) {
        return {
          domain: cleanDomain,
          available: false,
          status: "Error",
          error: `RDAP server error (${response.status}). Please try again later.`,
        };
      }

      // Unexpected status
      return {
        domain: cleanDomain,
        available: false,
        status: "Error",
        error: `Unexpected response status: ${response.status}`,
      };
    } catch (fetchError) {
      clearTimeout(timeoutId);

      // Network or timeout error
      if (fetchError instanceof Error) {
        if (fetchError.name === "AbortError") {
          return {
            domain: cleanDomain,
            available: false,
            status: "Error",
            error: "Request timeout. RDAP server not responding.",
          };
        }

        if (fetchError.message.includes("fetch")) {
          return {
            domain: cleanDomain,
            available: false,
            status: "Error",
            error: "Network error. Please check your internet connection.",
          };
        }
      }

      return {
        domain: cleanDomain,
        available: false,
        status: "Error",
        error: "Failed to check domain availability.",
      };
    }
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error(`RDAP check failed for ${domain}:`, err.message);

    return {
      domain: domain.toLowerCase().trim(),
      available: false,
      status: "Error",
      error: err.message || "Domain check failed.",
    };
  }
}

/**
 * Get RDAP endpoint information for a domain
 * Useful for debugging
 */
export function getEndpointInfo(domain: string): {
  domain: string;
  tld: string;
  endpoint: string;
} {
  return {
    domain: domain.toLowerCase().trim(),
    tld: getTLD(domain),
    endpoint: getRDAPEndpoint(domain),
  };
}

/**
 * Format domain check result for display
 */
export function formatDomainResult(result: DomainCheckResult): string {
  if (result.status === "Available") {
    return `✓ ${result.domain} is Available`;
  }

  if (result.status === "Taken") {
    let message = `✗ ${result.domain} is Taken`;
    if (result.registrationDate) {
      message += ` (Registered: ${new Date(
        result.registrationDate
      ).toLocaleDateString()})`;
    }
    return message;
  }

  return `⚠ ${result.domain}: ${result.error || "Check failed"}`;
}
