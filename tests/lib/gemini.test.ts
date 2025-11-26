/**
 * Tests for Gemini Library Wrapper
 * Tests low-level API interactions and response handling
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { generateContent, cleanJsonResponse } from '@/lib/gemini';

// Mock the GoogleGenAI module
vi.mock('@google/genai', () => ({
  GoogleGenAI: vi.fn().mockImplementation(() => ({
    models: {
      generateContent: vi.fn(),
    },
  })),
}));

describe('Gemini Library - generateContent', () => {
  beforeEach(() => {
    // Clear env vars before each test
    delete process.env.GEMINI_API_KEY;
    delete process.env.API_KEY;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('throws error when API key is missing', async () => {
    await expect(
      generateContent('system prompt', 'user prompt')
    ).rejects.toThrow('API Key is missing');
  });

  it('successfully generates content with valid API key', async () => {
    process.env.GEMINI_API_KEY = 'test-key';

    const mockResponse = { text: 'Generated content' };
    const { GoogleGenAI } = await import('@google/genai');
    const mockGenerate = vi.fn().mockResolvedValue(mockResponse);
    (GoogleGenAI as any).mockImplementation(() => ({
      models: {
        generateContent: mockGenerate,
      },
    }));

    const result = await generateContent('system', 'user');
    
    expect(result).toBe('Generated content');
    expect(mockGenerate).toHaveBeenCalled();
  });

  it('throws error when API returns empty response', async () => {
    process.env.GEMINI_API_KEY = 'test-key';

    const mockResponse = { text: null };
    const { GoogleGenAI } = await import('@google/genai');
    const mockGenerate = vi.fn().mockResolvedValue(mockResponse);
    (GoogleGenAI as any).mockImplementation(() => ({
      models: {
        generateContent: mockGenerate,
      },
    }));

    await expect(
      generateContent('system', 'user')
    ).rejects.toThrow('No response generated from API');
  });

  it('falls back to API_KEY env var if GEMINI_API_KEY not set', async () => {
    process.env.API_KEY = 'fallback-key';

    const mockResponse = { text: 'content' };
    const { GoogleGenAI } = await import('@google/genai');
    const mockGenerate = vi.fn().mockResolvedValue(mockResponse);
    (GoogleGenAI as any).mockImplementation(() => ({
      models: {
        generateContent: mockGenerate,
      },
    }));

    const result = await generateContent('system', 'user');
    
    expect(result).toBe('content');
  });
});

describe('Gemini Library - cleanJsonResponse', () => {
  it('removes ```json markdown wrapper', () => {
    const input = '```json\n{"key": "value"}\n```';
    const result = cleanJsonResponse(input);
    expect(result).toBe('{"key": "value"}');
  });

  it('removes triple backticks wrapper', () => {
    const input = '```\n{"key": "value"}\n```';
    const result = cleanJsonResponse(input);
    expect(result).toBe('{"key": "value"}');
  });

  it('handles response without markdown', () => {
    const input = '{"key": "value"}';
    const result = cleanJsonResponse(input);
    expect(result).toBe('{"key": "value"}');
  });

  it('trims whitespace', () => {
    const input = '   {"key": "value"}   ';
    const result = cleanJsonResponse(input);
    expect(result).toBe('{"key": "value"}');
  });

  it('handles complex JSON with markdown', () => {
    const input = `\`\`\`json
{
  "names": [
    {"name": "test", "value": 123}
  ]
}
\`\`\``;
    const result = cleanJsonResponse(input);
    expect(result).toContain('"names"');
    expect(result).not.toContain('```');
  });
});

