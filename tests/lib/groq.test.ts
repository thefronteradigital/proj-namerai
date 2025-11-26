/**
 * Tests for Groq Library Wrapper
 * Tests low-level API interactions and response handling
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { generateContent, cleanJsonResponse } from '@/lib/groq';

// Mock the Groq module
vi.mock('groq-sdk', () => ({
  default: vi.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: vi.fn(),
      },
    },
  })),
}));

describe('Groq Library - generateContent', () => {
  beforeEach(() => {
    // Clear env vars before each test
    delete process.env.GROQ_API_KEY;
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
    process.env.GROQ_API_KEY = 'test-key';

    const mockResponse = {
      choices: [
        {
          message: {
            content: 'Generated content',
          },
        },
      ],
    };

    const Groq = await import('groq-sdk');
    const mockCreate = vi.fn().mockResolvedValue(mockResponse);
    (Groq.default as any).mockImplementation(() => ({
      chat: {
        completions: {
          create: mockCreate,
        },
      },
    }));

    const result = await generateContent('system', 'user');
    
    expect(result).toBe('Generated content');
    expect(mockCreate).toHaveBeenCalled();
  });

  it('throws error when API returns empty response', async () => {
    process.env.GROQ_API_KEY = 'test-key';

    const mockResponse = {
      choices: [{ message: { content: null } }],
    };

    const Groq = await import('groq-sdk');
    const mockCreate = vi.fn().mockResolvedValue(mockResponse);
    (Groq.default as any).mockImplementation(() => ({
      chat: {
        completions: {
          create: mockCreate,
        },
      },
    }));

    await expect(
      generateContent('system', 'user')
    ).rejects.toThrow('No response generated from API');
  });

  it('falls back to API_KEY env var if GROQ_API_KEY not set', async () => {
    process.env.API_KEY = 'fallback-key';

    const mockResponse = {
      choices: [{ message: { content: 'content' } }],
    };

    const Groq = await import('groq-sdk');
    const mockCreate = vi.fn().mockResolvedValue(mockResponse);
    (Groq.default as any).mockImplementation(() => ({
      chat: {
        completions: {
          create: mockCreate,
        },
      },
    }));

    const result = await generateContent('system', 'user');
    
    expect(result).toBe('content');
  });

  it('passes correct parameters to Groq API', async () => {
    process.env.GROQ_API_KEY = 'test-key';

    const mockResponse = {
      choices: [{ message: { content: 'response' } }],
    };

    const Groq = await import('groq-sdk');
    const mockCreate = vi.fn().mockResolvedValue(mockResponse);
    (Groq.default as any).mockImplementation(() => ({
      chat: {
        completions: {
          create: mockCreate,
        },
      },
    }));

    await generateContent('system prompt', 'user prompt');
    
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        model: 'llama-3.1-8b-instant',
        temperature: 0.9,
        top_p: 0.95,
        max_tokens: 1024,
        messages: [
          { role: 'system', content: 'system prompt' },
          { role: 'user', content: 'user prompt' },
        ],
      })
    );
  });
});

describe('Groq Library - cleanJsonResponse', () => {
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

  it('handles multiline JSON with markdown', () => {
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

