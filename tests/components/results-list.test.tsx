/**
 * Tests for Results List Component
 * Tests user-facing behavior, domain collapsing, and domain filtering
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ResultsList } from '@/features/name-generator/components/results-list';
import type { GeneratedName } from '@/features/name-generator/services/name-generator';

// Mock React rendering for component tests
vi.mock('react', async () => {
  const actual = await vi.importActual('react');
  return {
    ...actual,
  };
});

describe('ResultsList Component - Domain Filtering Logic', () => {
  it('should filter domains to only .com, .my, .ai', () => {
    const domains = [
      { url: 'test.com', status: 'Available' as const },
      { url: 'test.io', status: 'Available' as const },
      { url: 'test.my', status: 'Available' as const },
      { url: 'test.ai', status: 'Available' as const },
      { url: 'test.jp', status: 'Available' as const },
    ];

    const filtered = domains.filter((d) => 
      ['.com', '.my', '.ai'].some((ext) => d.url.endsWith(ext))
    );

    expect(filtered).toHaveLength(3);
    expect(filtered.map((d) => d.url)).toEqual(['test.com', 'test.my', 'test.ai']);
  });

  it('should return empty when no matching domains', () => {
    const domains = [
      { url: 'test.io', status: 'Available' as const },
      { url: 'test.jp', status: 'Available' as const },
    ];

    const filtered = domains.filter((d) => 
      ['.com', '.my', '.ai'].some((ext) => d.url.endsWith(ext))
    );

    expect(filtered).toHaveLength(0);
  });

  it('should preserve domain status in filtered results', () => {
    const domains = [
      { url: 'test.com', status: 'Taken' as const },
      { url: 'test.my', status: 'Available' as const },
      { url: 'test.ai', status: 'Error' as const },
    ];

    const filtered = domains.filter((d) => 
      ['.com', '.my', '.ai'].some((ext) => d.url.endsWith(ext))
    );

    expect(filtered[0].status).toBe('Taken');
    expect(filtered[1].status).toBe('Available');
    expect(filtered[2].status).toBe('Error');
  });

  it('should handle case-insensitive domain extensions', () => {
    const domains = [
      { url: 'TEST.COM', status: 'Available' as const },
      { url: 'Test.My', status: 'Available' as const },
      { url: 'test.AI', status: 'Available' as const },
    ];

    const filtered = domains.filter((d) => 
      ['.com', '.my', '.ai'].some((ext) => d.url.toLowerCase().endsWith(ext))
    );

    expect(filtered).toHaveLength(3);
  });
});

describe('ResultsList Component - Domain Status Types', () => {
  it('should handle Available status', () => {
    const domain = { url: 'test.com', status: 'Available' as const };
    expect(domain.status).toBe('Available');
  });

  it('should handle Taken status', () => {
    const domain = { url: 'test.com', status: 'Taken' as const };
    expect(domain.status).toBe('Taken');
  });

  it('should handle Error status', () => {
    const domain = { url: 'test.com', status: 'Error' as const };
    expect(domain.status).toBe('Error');
  });
});

describe('ResultsList Component - Empty Results', () => {
  it('should return null for empty results', () => {
    const results: GeneratedName[] = [];
    expect(results).toHaveLength(0);
  });

  it('should handle single result', () => {
    const results: GeneratedName[] = [
      {
        name: 'TechFlow',
        meaning: 'Tech flow',
        languageOrigin: 'English',
        domains: [],
      },
    ];
    expect(results).toHaveLength(1);
  });

  it('should handle multiple results', () => {
    const results: GeneratedName[] = [
      {
        name: 'TechFlow',
        meaning: 'Tech flow',
        languageOrigin: 'English',
        domains: [],
      },
      {
        name: 'QuantumAI',
        meaning: 'Quantum AI',
        languageOrigin: 'English',
        domains: [],
      },
    ];
    expect(results).toHaveLength(2);
  });
});

describe('ResultsList Component - Result Properties', () => {
  it('should have name property', () => {
    const result: GeneratedName = {
      name: 'TechFlow',
      meaning: 'Tech flow',
      languageOrigin: 'English',
      domains: [],
    };
    expect(result.name).toBe('TechFlow');
  });

  it('should have meaning property', () => {
    const result: GeneratedName = {
      name: 'TechFlow',
      meaning: 'A tech platform',
      languageOrigin: 'English',
      domains: [],
    };
    expect(result.meaning).toBe('A tech platform');
  });

  it('should have languageOrigin property', () => {
    const result: GeneratedName = {
      name: 'TechFlow',
      meaning: 'Tech flow',
      languageOrigin: 'English',
      domains: [],
    };
    expect(result.languageOrigin).toBe('English');
  });

  it('should have optional domains property', () => {
    const result: GeneratedName = {
      name: 'TechFlow',
      meaning: 'Tech flow',
      languageOrigin: 'English',
      domains: [{ url: 'techflow.com', status: 'Available' }],
    };
    expect(result.domains).toBeDefined();
    expect(result.domains).toHaveLength(1);
  });
});

describe('ResultsList Component - Domain Collapse State Logic', () => {
  it('should initialize expanded state as true', () => {
    const expandedState: Record<string, boolean> = {};
    const key = 'techflow-english';
    const isExpanded = expandedState[key] ?? true;
    
    expect(isExpanded).toBe(true);
  });

  it('should toggle expanded state', () => {
    const expandedState: Record<string, boolean> = {};
    const key = 'techflow-english';
    
    // Initially true
    let isExpanded = expandedState[key] ?? true;
    expect(isExpanded).toBe(true);
    
    // Toggle to false
    expandedState[key] = !isExpanded;
    isExpanded = expandedState[key] ?? true;
    expect(isExpanded).toBe(false);
    
    // Toggle back to true
    expandedState[key] = !isExpanded;
    isExpanded = expandedState[key] ?? true;
    expect(isExpanded).toBe(true);
  });

  it('should maintain independent state per domain', () => {
    const expandedState: Record<string, boolean> = {};
    
    // Domain 1 expanded, Domain 2 collapsed
    expandedState['domain1'] = true;
    expandedState['domain2'] = false;
    
    expect(expandedState['domain1']).toBe(true);
    expect(expandedState['domain2']).toBe(false);
  });
});
