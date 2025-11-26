/**
 * Tests for Name Generator Service
 * Tests business logic for generating names and orchestrating API calls
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { generateNamesWithGroq, generateNamesWithGemini } from '@/features/name-generator/services/name-generator';
import type { FormState } from '@/features/name-generator/services/name-generator';

// Mock the library wrappers
vi.mock('@/lib/gemini', () => ({
  generateContent: vi.fn(),
  cleanJsonResponse: vi.fn((text) => text),
}));

vi.mock('@/lib/groq', () => ({
  generateContent: vi.fn(),
  cleanJsonResponse: vi.fn((text) => text),
}));

// Mock the domain service
vi.mock('@/features/name-generator/services/domain-service', () => ({
  domainService: {
    resetCounter: vi.fn(),
    checkDomains: vi.fn(),
    isRateLimitReached: vi.fn(() => false),
    getLastError: vi.fn(() => null),
  },
}));

const mockFormState: FormState = {
  language: 'English',
  style: 'Techy',
  length: 'Short',
  keywords: 'tech startup',
  checkDomains: false,
};

const mockNamesResponse = {
  names: [
    {
      name: 'TechFlow',
      meaning: 'A blend of tech and flow',
      languageOrigin: 'English',
      suggestedDomains: ['techflow.com', 'techflow.io', 'techflow.ai'],
    },
    {
      name: 'QuantumAI',
      meaning: 'Advanced AI technology',
      languageOrigin: 'English',
      suggestedDomains: ['quantumai.com', 'quantumai.ai', 'quantumai.my'],
    },
  ],
};

describe('Name Generator Service - generateNamesWithGroq', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('successfully generates names without domain checking', async () => {
    const { generateContent } = await import('@/lib/groq');
    (generateContent as any).mockResolvedValue(JSON.stringify(mockNamesResponse));

    const result = await generateNamesWithGroq(mockFormState);

    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('TechFlow');
    expect(result[0].domains).toEqual([]);
  });

  it('generates names with domain checking enabled', async () => {
    const { generateContent } = await import('@/lib/groq');
    (generateContent as any).mockResolvedValue(JSON.stringify(mockNamesResponse));

    const { domainService } = await import('@/features/name-generator/services/domain-service');
    (domainService.checkDomains as any).mockResolvedValue([
      { url: 'techflow.com', status: 'Taken' },
      { url: 'techflow.ai', status: 'Available' },
    ]);

    const formState: FormState = { ...mockFormState, checkDomains: true };
    const result = await generateNamesWithGroq(formState);

    expect(result).toHaveLength(2);
    expect(result[0].domains).toBeDefined();
  });

  it('throws error for invalid JSON response', async () => {
    const { generateContent } = await import('@/lib/groq');
    (generateContent as any).mockResolvedValue('invalid json');

    await expect(generateNamesWithGroq(mockFormState)).rejects.toThrow();
  });

  it('throws error when response has no names array', async () => {
    const { generateContent } = await import('@/lib/groq');
    (generateContent as any).mockResolvedValue(JSON.stringify({ invalid: 'response' }));

    await expect(generateNamesWithGroq(mockFormState)).rejects.toThrow(
      'Invalid response format from API'
    );
  });

  it('resets domain service counter before generating', async () => {
    const { generateContent } = await import('@/lib/groq');
    (generateContent as any).mockResolvedValue(JSON.stringify(mockNamesResponse));

    const { domainService } = await import('@/features/name-generator/services/domain-service');

    await generateNamesWithGroq(mockFormState);

    expect(domainService.resetCounter).toHaveBeenCalled();
  });

  it('includes domain results when checking is enabled', async () => {
    const { generateContent } = await import('@/lib/groq');
    (generateContent as any).mockResolvedValue(JSON.stringify(mockNamesResponse));

    const { domainService } = await import('@/features/name-generator/services/domain-service');
    const mockDomainResults = [
      { url: 'techflow.com', status: 'Taken' },
    ];
    (domainService.checkDomains as any).mockResolvedValue(mockDomainResults);

    const formState: FormState = { ...mockFormState, checkDomains: true };
    const result = await generateNamesWithGroq(formState);

    expect(result[0].domains).toBe(mockDomainResults);
  });
});

describe('Name Generator Service - generateNamesWithGemini', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('successfully generates names without domain checking', async () => {
    const { generateContent } = await import('@/lib/gemini');
    (generateContent as any).mockResolvedValue(JSON.stringify(mockNamesResponse));

    const result = await generateNamesWithGemini(mockFormState);

    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('TechFlow');
    expect(result[0].domains).toEqual([]);
  });

  it('generates names with domain checking enabled', async () => {
    const { generateContent } = await import('@/lib/gemini');
    (generateContent as any).mockResolvedValue(JSON.stringify(mockNamesResponse));

    const { domainService } = await import('@/features/name-generator/services/domain-service');
    (domainService.checkDomains as any).mockResolvedValue([
      { url: 'techflow.com', status: 'Taken' },
    ]);

    const formState: FormState = { ...mockFormState, checkDomains: true };
    const result = await generateNamesWithGemini(formState);

    expect(result).toHaveLength(2);
    expect(result[0].domains).toBeDefined();
  });

  it('throws error for invalid JSON response', async () => {
    const { generateContent } = await import('@/lib/gemini');
    (generateContent as any).mockResolvedValue('invalid json');

    await expect(generateNamesWithGemini(mockFormState)).rejects.toThrow();
  });

  it('resets domain service counter before generating', async () => {
    const { generateContent } = await import('@/lib/gemini');
    (generateContent as any).mockResolvedValue(JSON.stringify(mockNamesResponse));

    const { domainService } = await import('@/features/name-generator/services/domain-service');

    await generateNamesWithGemini(mockFormState);

    expect(domainService.resetCounter).toHaveBeenCalled();
  });
});

describe('Name Generator Service - Error Handling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('handles API key errors appropriately', async () => {
    const { generateContent } = await import('@/lib/groq');
    (generateContent as any).mockRejectedValue(
      new Error('API key is invalid')
    );

    await expect(generateNamesWithGroq(mockFormState)).rejects.toThrow(
      'Invalid API Key'
    );
  });

  it('handles network errors', async () => {
    const { generateContent } = await import('@/lib/groq');
    (generateContent as any).mockRejectedValue(
      new Error('network fetch error')
    );

    await expect(generateNamesWithGroq(mockFormState)).rejects.toThrow(
      'Network error'
    );
  });

  it('handles quota errors', async () => {
    const { generateContent } = await import('@/lib/groq');
    (generateContent as any).mockRejectedValue(
      new Error('quota exceeded 429')
    );

    await expect(generateNamesWithGroq(mockFormState)).rejects.toThrow(
      'quota exceeded'
    );
  });

  it('handles domain check errors without stopping generation', async () => {
    const { generateContent } = await import('@/lib/groq');
    (generateContent as any).mockResolvedValue(JSON.stringify(mockNamesResponse));

    const { domainService } = await import('@/features/name-generator/services/domain-service');
    (domainService.checkDomains as any).mockRejectedValue(
      new Error('Domain check failed')
    );

    const formState: FormState = { ...mockFormState, checkDomains: true };
    const result = await generateNamesWithGroq(formState);

    // Should still return names even if domain check fails
    expect(result).toHaveLength(2);
    expect(result[0].domains).toBeDefined();
  });
});

describe('Name Generator Service - Form State', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('generates appropriate prompt for different languages', async () => {
    const { generateContent } = await import('@/lib/groq');
    (generateContent as any).mockResolvedValue(JSON.stringify(mockNamesResponse));

    const formStateJapanese: FormState = {
      ...mockFormState,
      language: 'Japanese',
    };

    await generateNamesWithGroq(formStateJapanese);

    const callArgs = (generateContent as any).mock.calls[0];
    expect(callArgs[0]).toContain('Japanese');
  });

  it('generates appropriate prompt for different styles', async () => {
    const { generateContent } = await import('@/lib/groq');
    (generateContent as any).mockResolvedValue(JSON.stringify(mockNamesResponse));

    const formStateMinimal: FormState = {
      ...mockFormState,
      style: 'Minimal',
    };

    await generateNamesWithGroq(formStateMinimal);

    const callArgs = (generateContent as any).mock.calls[0];
    expect(callArgs[0]).toContain('Minimal');
  });

  it('includes keywords in prompt when provided', async () => {
    const { generateContent } = await import('@/lib/groq');
    (generateContent as any).mockResolvedValue(JSON.stringify(mockNamesResponse));

    const formStateWithKeywords: FormState = {
      ...mockFormState,
      keywords: 'innovation,speed,cloud',
    };

    await generateNamesWithGroq(formStateWithKeywords);

    const callArgs = (generateContent as any).mock.calls[0];
    expect(callArgs[1]).toContain('innovation,speed,cloud');
  });
});

