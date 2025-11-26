/**
 * Rate Limiting Utility Library
 * Provides secure rate limiting and request throttling functionality
 * Simple, functional approach - no classes
 * Can be used across the entire application
 */

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number; // Time window in milliseconds
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
}

/**
 * State management for rate limiters
 */
interface RateLimiterState {
  timestamps: number[];
  lastRefillTime: number;
  tokens: number;
  retryCount: number;
  lastRequestTime: number;
}

// Global state storage for limiters
const limitersState = new Map<string, RateLimiterState>();

/**
 * Initialize or get limiter state
 */
function getOrCreateLimiterState(
  limiterId: string,
  config: RateLimitConfig
): RateLimiterState {
  if (!limitersState.has(limiterId)) {
    limitersState.set(limiterId, {
      timestamps: [],
      lastRefillTime: Date.now(),
      tokens: config.maxRequests,
      retryCount: 0,
      lastRequestTime: 0,
    });
  }
  return limitersState.get(limiterId)!;
}

/**
 * Sliding window rate limiter
 * Stores request timestamps and checks against configured limits
 */
export function createSlidingWindowLimiter(
  limiterId: string,
  config: RateLimitConfig
) {
  return {
    /**
     * Check if request is allowed and update rate limit state
     */
    isAllowed(): RateLimitResult {
      const state = getOrCreateLimiterState(limiterId, config);
      const now = Date.now();
      const windowStart = now - config.windowMs;

      // Remove expired timestamps outside the window
      state.timestamps = state.timestamps.filter((ts) => ts > windowStart);

      // Check if limit exceeded
      if (state.timestamps.length >= config.maxRequests) {
        const oldestTimestamp = state.timestamps[0];
        const resetTime = oldestTimestamp + config.windowMs;
        const retryAfter = Math.ceil((resetTime - now) / 1000); // In seconds

        return {
          allowed: false,
          remaining: 0,
          resetTime,
          retryAfter,
        };
      }

      // Record this request
      state.timestamps.push(now);
      const remaining = config.maxRequests - state.timestamps.length;
      const resetTime = now + config.windowMs;

      return {
        allowed: true,
        remaining: Math.max(0, remaining),
        resetTime,
      };
    },

    /**
     * Get current state without recording a request
     */
    getStatus(): RateLimitResult {
      const state = getOrCreateLimiterState(limiterId, config);
      const now = Date.now();
      const windowStart = now - config.windowMs;

      // Count valid timestamps
      const validTimestamps = state.timestamps.filter((ts) => ts > windowStart);

      if (validTimestamps.length >= config.maxRequests) {
        const oldestTimestamp = validTimestamps[0];
        const resetTime = oldestTimestamp + config.windowMs;
        const retryAfter = Math.ceil((resetTime - now) / 1000);

        return {
          allowed: false,
          remaining: 0,
          resetTime,
          retryAfter,
        };
      }

      const remaining = config.maxRequests - validTimestamps.length;
      const resetTime = now + config.windowMs;

      return {
        allowed: true,
        remaining,
        resetTime,
      };
    },

    /**
     * Reset the rate limiter
     */
    reset(): void {
      const state = getOrCreateLimiterState(limiterId, config);
      state.timestamps = [];
    },

    /**
     * Get request count in current window
     */
    getRequestCount(): number {
      const state = getOrCreateLimiterState(limiterId, config);
      const now = Date.now();
      const windowStart = now - config.windowMs;
      return state.timestamps.filter((ts) => ts > windowStart).length;
    },
  };
}

/**
 * Token bucket rate limiter
 * More sophisticated than sliding window - allows burst traffic up to bucket capacity
 */
export function createTokenBucketLimiter(
  limiterId: string,
  config: RateLimitConfig
) {
  const refillRate = config.maxRequests / config.windowMs;

  return {
    /**
     * Refill tokens based on elapsed time
     */
    refillTokens(): void {
      const state = getOrCreateLimiterState(limiterId, config);
      const now = Date.now();
      const timePassed = now - state.lastRefillTime;
      const tokensToAdd = timePassed * refillRate;

      state.tokens = Math.min(config.maxRequests, state.tokens + tokensToAdd);
      state.lastRefillTime = now;
    },

    /**
     * Check if request is allowed and consume token
     */
    isAllowed(): RateLimitResult {
      const state = getOrCreateLimiterState(limiterId, config);
      this.refillTokens();

      const now = Date.now();
      const resetTime = state.lastRefillTime + config.windowMs;

      if (state.tokens < 1) {
        const retryAfter = Math.ceil((resetTime - now) / 1000);
        return {
          allowed: false,
          remaining: 0,
          resetTime,
          retryAfter,
        };
      }

      state.tokens -= 1;
      return {
        allowed: true,
        remaining: Math.floor(state.tokens),
        resetTime,
      };
    },

    /**
     * Get current state without consuming token
     */
    getStatus(): RateLimitResult {
      const state = getOrCreateLimiterState(limiterId, config);
      this.refillTokens();

      const now = Date.now();
      const resetTime = state.lastRefillTime + config.windowMs;

      return {
        allowed: state.tokens >= 1,
        remaining: Math.floor(state.tokens),
        resetTime,
        retryAfter:
          state.tokens < 1 ? Math.ceil((resetTime - now) / 1000) : undefined,
      };
    },

    /**
     * Reset the limiter
     */
    reset(): void {
      const state = getOrCreateLimiterState(limiterId, config);
      state.tokens = config.maxRequests;
      state.lastRefillTime = Date.now();
    },
  };
}

/**
 * Request throttler with exponential backoff for retry logic
 */
export function createThrottleWithBackoff(
  limiterId: string,
  minDelayMs: number = 100,
  maxDelayMs: number = 10000
) {
  return {
    /**
     * Calculate delay for next request with exponential backoff
     */
    getDelayMs(): number {
      const state = getOrCreateLimiterState(limiterId, {
        maxRequests: 1,
        windowMs: 1,
      });
      const now = Date.now();
      const timeSinceLastRequest = now - state.lastRequestTime;

      if (timeSinceLastRequest < minDelayMs) {
        const baseDelay = minDelayMs - timeSinceLastRequest;
        const exponentialDelay = baseDelay * Math.pow(2, state.retryCount);
        return Math.min(exponentialDelay, maxDelayMs);
      }

      return 0;
    },

    /**
     * Record a request and update throttle state
     */
    recordRequest(): void {
      const state = getOrCreateLimiterState(limiterId, {
        maxRequests: 1,
        windowMs: 1,
      });
      state.lastRequestTime = Date.now();
      state.retryCount = 0;
    },

    /**
     * Increment retry counter (called on failure)
     */
    recordFailure(): void {
      const state = getOrCreateLimiterState(limiterId, {
        maxRequests: 1,
        windowMs: 1,
      });
      state.retryCount++;
    },

    /**
     * Reset throttle state
     */
    reset(): void {
      const state = getOrCreateLimiterState(limiterId, {
        maxRequests: 1,
        windowMs: 1,
      });
      state.lastRequestTime = 0;
      state.retryCount = 0;
    },
  };
}

/**
 * Utility function to wait before making next request
 */
export async function waitForNextRequest(delayMs: number): Promise<void> {
  if (delayMs > 0) {
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }
}

/**
 * Utility function to format rate limit error message
 */
export function formatRateLimitError(result: RateLimitResult): string {
  const retryAfterSeconds = result.retryAfter || 0;
  const minutes = Math.floor(retryAfterSeconds / 60);
  const seconds = retryAfterSeconds % 60;

  if (minutes > 0) {
    return `Rate limit exceeded. Try again in ${minutes}m ${seconds}s`;
  }
  return `Rate limit exceeded. Try again in ${seconds}s`;
}

/**
 * Export default limiter instances for common use cases
 */

// Per-minute rate limiter (60 requests per minute)
export const perMinuteLimiter = createSlidingWindowLimiter("per-minute", {
  maxRequests: 60,
  windowMs: 60 * 1000,
});

// Per-second rate limiter (10 requests per second)
export const perSecondLimiter = createSlidingWindowLimiter("per-second", {
  maxRequests: 10,
  windowMs: 1000,
});

// Per-hour rate limiter (1000 requests per hour)
export const perHourLimiter = createTokenBucketLimiter("per-hour", {
  maxRequests: 1000,
  windowMs: 60 * 60 * 1000,
});

// Throttler with exponential backoff
export const throttler = createThrottleWithBackoff("throttler", 500, 10000);
