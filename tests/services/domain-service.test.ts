/**
 * Tests for Domain Service
 * Tests domain checking logic, filtering, and rate limiting
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { checkDomains, checkDomain, resetCounter, getRequestCount, isRateLimitReached } from '@/features/name-generator/services/domain-service';

// Mock the RDAP library
vi.mock('@/lib/rdap', () => ({
  checkDomain: vi.fn(),
}));

// Mock the rate limit library
vi.mock('@/lib/rate-limit', () => ({
  createSlidingWindowLimiter: vi.fn(() => ({
    isAllowed: vi.fn(() => ({ allowed: true })),
    getStatus: vi.fn(() => ({ allowed: true })),
    reset: vi.fn(),
  })),
  formatRateLimitError: vi.fn(() => 'Rate limit exceeded'),
  waitForNextRequest: vi.fn(),
}));

describe('Domain Service - checkDomains', () => {
  beforeEach(() => {
    resetCounter();
    vi.clearAllMocks();
  });

  afterEach(() => {
    resetCounter();
  });

  it('filters domains to only .com, .my, .ai extensions', async () => {
    const domains = [
      'example.com',
      'example.io',
      'example.my',
      'example.ai',
      'example.jp',
      'example.app',
    ];

    const { checkDomain: mockCheckDomain } = await import('@/lib/rdap');
    (mockCheckDomain as any).mockResolvedValue({
      domain: 'example.com',
      status: 'Taken',
    });

    await checkDomains(domains);

    // Should only check .com, .my, .ai domains (3 calls)
    expect(mockCheckDomain).toHaveBeenCalledTimes(3);
  });

  it('handles empty domain array', async () => {
    const result = await checkDomains([]);
    expect(result).toEqual([]);
  });

  it('returns error status for invalid domain', async () => {
    const { checkDomain: mockCheckDomain } = await import('@/lib/rdap');
    (mockCheckDomain as any).mockResolvedValue({
      domain: 'invalid',
      status: 'Error',
    });

    const result = await checkDomains(['invalid']);
    expect(result).toHaveLength(0); // Filtered out due to invalid extension
  });

  it('includes only matching domain extensions', async () => {
    const domains = ['test.com', 'test.my', 'test.ai'];

    const { checkDomain: mockCheckDomain } = await import('@/lib/rdap');
    (mockCheckDomain as any).mockResolvedValue({
      status: 'Available',
    });

    const result = await checkDomains(domains);

    expect(result).toHaveLength(3);
    expect(result.every((r) => ['.com', '.my', '.ai'].some((ext) => r.url.endsWith(ext)))).toBe(true);
  });

  it('returns empty array when no domains match filters', async () => {
    const domains = ['example.io', 'example.jp', 'example.app'];
    const result = await checkDomains(domains);

    expect(result).toEqual([]);
  });

  it('case-insensitive domain filtering', async () => {
    const domains = ['TEST.COM', 'Test.My', 'tEsT.AI'];

    const { checkDomain: mockCheckDomain } = await import('@/lib/rdap');
    (mockCheckDomain as any).mockResolvedValue({
      status: 'Available',
    });

    const result = await checkDomains(domains);

    expect(result).toHaveLength(3);
  });
});

describe('Domain Service - checkDomain', () => {
  beforeEach(() => {
    resetCounter();
    vi.clearAllMocks();
  });

  afterEach(() => {
    resetCounter();
  });

  it('successfully checks domain availability', async () => {
    const { checkDomain: mockCheckDomain } = await import('@/lib/rdap');
    (mockCheckDomain as any).mockResolvedValue({
      domain: 'example.com',
      available: true,
      status: 'Available',
    });

    const result = await checkDomain('example.com');

    expect(result.url).toBe('example.com');
    expect(result.status).toBe('Available');
  });

  it('handles domain check errors gracefully', async () => {
    const { checkDomain: mockCheckDomain } = await import('@/lib/rdap');
    (mockCheckDomain as any).mockRejectedValue(new Error('Network error'));

    const result = await checkDomain('example.com');

    expect(result.status).toBe('Error');
    expect(result.url).toBe('example.com');
  });

  it('cleans domain name (lowercase and trim)', async () => {
    const { checkDomain: mockCheckDomain } = await import('@/lib/rdap');
    (mockCheckDomain as any).mockResolvedValue({
      domain: 'example.com',
      status: 'Taken',
    });

    await checkDomain('  EXAMPLE.COM  ');

    expect(mockCheckDomain).toHaveBeenCalledWith('example.com');
  });
});

describe('Domain Service - Rate Limiting', () => {
  beforeEach(() => {
    resetCounter();
    vi.clearAllMocks();
  });

  afterEach(() => {
    resetCounter();
  });

  it('tracks request count', async () => {
    const { checkDomain: mockCheckDomain } = await import('@/lib/rdap');
    (mockCheckDomain as any).mockResolvedValue({
      status: 'Available',
    });

    await checkDomain('test.com');
    const count = getRequestCount();

    expect(count).toBeGreaterThanOrEqual(0);
  });

  it('resets counter on resetCounter call', () => {
    resetCounter();
    const count = getRequestCount();
    expect(count).toBe(0);
  });

  it('reports rate limit status', () => {
    const isLimited = isRateLimitReached();
    expect(typeof isLimited).toBe('boolean');
  });
});

describe('Domain Service - Extension Filtering', () => {
  it('filters .com extension correctly', async () => {
    const domains = ['example.com'];

    const { checkDomain: mockCheckDomain } = await import('@/lib/rdap');
    (mockCheckDomain as any).mockResolvedValue({ status: 'Available' });

    const result = await checkDomains(domains);

    expect(result).toHaveLength(1);
  });

  it('filters .my extension correctly', async () => {
    const domains = ['example.my'];

    const { checkDomain: mockCheckDomain } = await import('@/lib/rdap');
    (mockCheckDomain as any).mockResolvedValue({ status: 'Available' });

    const result = await checkDomains(domains);

    expect(result).toHaveLength(1);
  });

  it('filters .ai extension correctly', async () => {
    const domains = ['example.ai'];

    const { checkDomain: mockCheckDomain } = await import('@/lib/rdap');
    (mockCheckDomain as any).mockResolvedValue({ status: 'Available' });

    const result = await checkDomains(domains);

    expect(result).toHaveLength(1);
  });

  it('excludes all other extensions', async () => {
    const domains = [
      'example.io',
      'example.app',
      'example.jp',
      'example.net',
      'example.co',
      'example.org',
    ];

    const result = await checkDomains(domains);

    expect(result).toEqual([]);
  });
});

