/**
 * Domain Availability Checker Service
 * Using WhoisXMLAPI only (100 free queries/month)
 */

type DomainStatus = 'Available' | 'Taken' | 'Premium' | 'Error';
type DomainCheckErrorType = 'rate_limit' | 'api_error' | 'network_error';

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
    domainAvailability: 'AVAILABLE' | 'UNAVAILABLE';
    domainName: string;
  };
}

interface WhoisXMLAPIErrorResponse {
  messages?: string;
  code?: number;
}

export class DomainService {
  private whoisApiKey: string | undefined;
  private requestCount: number = 0;
  private monthlyLimit: number = 100;
  private lastError: DomainCheckError | null = null;

  constructor() {
    this.whoisApiKey = process.env.WHOISXML_API_KEY;
  }

  /**
   * Get the last error that occurred
   */
  getLastError(): DomainCheckError | null {
    return this.lastError;
  }

  /**
   * Get current request count
   */
  getRequestCount(): number {
    return this.requestCount;
  }

  /**
   * Check if rate limit is reached
   */
  isRateLimitReached(): boolean {
    return this.requestCount >= this.monthlyLimit;
  }

  /**
   * Check domain availability using WhoisXMLAPI
   */
  private async checkWithWhoisXML(domain: string): Promise<DomainResult> {
    if (!this.whoisApiKey) {
      this.lastError = {
        type: 'api_error',
        message: 'WhoisXML API key not configured. Please add WHOISXML_API_KEY to your .env.local file.'
      };
      throw new Error(this.lastError.message);
    }

    if (this.isRateLimitReached()) {
      this.lastError = {
        type: 'rate_limit',
        message: `Monthly limit of ${this.monthlyLimit} domain checks reached. Please try again next month or upgrade your WhoisXML API plan.`
      };
      throw new Error(this.lastError.message);
    }

    try {
      const url = `https://domain-availability.whoisxmlapi.com/api/v1?apiKey=${this.whoisApiKey}&domainName=${domain}`;
      const response = await fetch(url);
      
      this.requestCount++;

      if (!response.ok) {
        const errorData: WhoisXMLAPIErrorResponse = await response.json().catch(() => ({}));
        
        // Check for rate limit error
        if (response.status === 429 || errorData.messages?.includes('limit')) {
          this.lastError = {
            type: 'rate_limit',
            message: `API rate limit reached. You've used ${this.requestCount} out of ${this.monthlyLimit} monthly queries.`
          };
          throw new Error(this.lastError.message);
        }

        // Check for invalid API key
        if (response.status === 401 || response.status === 403) {
          this.lastError = {
            type: 'api_error',
            message: 'Invalid WhoisXML API key. Please check your credentials.'
          };
          throw new Error(this.lastError.message);
        }

        this.lastError = {
          type: 'api_error',
          message: `WhoisXML API error: ${response.status} - ${errorData.messages || 'Unknown error'}`
        };
        throw new Error(this.lastError.message);
      }

      const data: WhoisXMLAPIResponse = await response.json();
      const isAvailable = data.DomainInfo.domainAvailability === 'AVAILABLE';

      return {
        url: domain,
        status: isAvailable ? 'Available' : 'Taken'
      };
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      if (err.message?.includes('limit') || err.message?.includes('rate')) {
        throw err; // Re-throw rate limit errors
      }

      console.error('WhoisXML check failed:', err);
      
      if (err.name === 'TypeError' || err.message?.includes('fetch')) {
        this.lastError = {
          type: 'network_error',
          message: 'Network error. Please check your internet connection and try again.'
        };
      } else if (!this.lastError) {
        this.lastError = {
          type: 'api_error',
          message: err.message || 'Domain check failed. Please try again.'
        };
      }
      
      throw err;
    }
  }

  /**
   * Main method to check domain availability
   */
  async checkDomain(domain: string): Promise<DomainResult> {
    // Clean domain name
    const cleanDomain = domain.toLowerCase().trim();

    try {
      console.log(`[${this.requestCount + 1}/${this.monthlyLimit}] Checking domain: ${cleanDomain}`);
      const result = await this.checkWithWhoisXML(cleanDomain);
      console.log(`✓ Domain ${cleanDomain} is ${result.status}`);
      return result;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error(`✗ Domain check failed for ${cleanDomain}:`, err.message);
      
      // Return error status instead of throwing
      return {
        url: cleanDomain,
        status: 'Error'
      };
    }
  }

  /**
   * Batch check multiple domains (with rate limiting protection)
   */
  async checkDomains(domains: string[]): Promise<DomainResult[]> {
    const results: DomainResult[] = [];
    
    // Check if we have enough quota
    const remainingQuota = this.monthlyLimit - this.requestCount;
    if (domains.length > remainingQuota) {
      console.warn(`⚠ Only ${remainingQuota} checks remaining. Limiting to available quota.`);
    }

    for (let i = 0; i < domains.length; i++) {
      // Stop if rate limit reached
      if (this.isRateLimitReached()) {
        console.warn('⚠ Rate limit reached. Stopping domain checks.');
        // Mark remaining domains as Error
        for (let j = i; j < domains.length; j++) {
          results.push({ url: domains[j], status: 'Error' });
        }
        break;
      }

      try {
        const result = await this.checkDomain(domains[i]);
        results.push(result);
        
        // Rate limiting: wait 200ms between requests to avoid hitting API limits
        if (i < domains.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      } catch (error) {
        console.error(`Failed to check ${domains[i]}:`, error);
        results.push({ url: domains[i], status: 'Error' });
      }
    }
    
    return results;
  }

  /**
   * Reset request counter (for testing)
   */
  resetCounter(): void {
    this.requestCount = 0;
    this.lastError = null;
  }
}

// Export singleton instance
export const domainService = new DomainService();
