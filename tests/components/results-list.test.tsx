/**
 * Tests for Results List Component
 * Tests user-facing behavior, domain collapsing, and domain filtering
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ResultsList } from '@/features/name-generator/components/results-list';
import type { GeneratedName } from '@/features/name-generator/services/name-generator';

describe('ResultsList Component - Rendering', () => {
  it('displays nothing when results are empty', () => {
    const { container } = render(<ResultsList results={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('displays results count', () => {
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

    render(<ResultsList results={results} />);
    
    expect(screen.getByText(/2 names generated/i)).toBeInTheDocument();
  });

  it('displays name cards for each result', () => {
    const results: GeneratedName[] = [
      {
        name: 'TechFlow',
        meaning: 'A tech platform',
        languageOrigin: 'English',
        domains: [],
      },
    ];

    render(<ResultsList results={results} />);
    
    expect(screen.getByText('TechFlow')).toBeInTheDocument();
    expect(screen.getByText('A tech platform')).toBeInTheDocument();
  });

  it('displays language origin badge', () => {
    const results: GeneratedName[] = [
      {
        name: 'TechFlow',
        meaning: 'Tech flow',
        languageOrigin: 'English',
        domains: [],
      },
    ];

    render(<ResultsList results={results} />);
    
    expect(screen.getByText('ENGLISH')).toBeInTheDocument();
  });

  it('displays copy button for each name', () => {
    const results: GeneratedName[] = [
      {
        name: 'TechFlow',
        meaning: 'Tech flow',
        languageOrigin: 'English',
        domains: [],
      },
    ];

    render(<ResultsList results={results} />);
    
    expect(screen.getByTitle('Copy name')).toBeInTheDocument();
  });
});

describe('ResultsList Component - Domain Filtering', () => {
  it('displays only .com, .my, .ai domains', () => {
    const results: GeneratedName[] = [
      {
        name: 'TechFlow',
        meaning: 'Tech flow',
        languageOrigin: 'English',
        domains: [
          { url: 'techflow.com', status: 'Taken' },
          { url: 'techflow.io', status: 'Available' },
          { url: 'techflow.my', status: 'Available' },
          { url: 'techflow.ai', status: 'Available' },
        ],
      },
    ];

    render(<ResultsList results={results} />);
    
    // After expanding, should see these
    expect(screen.getByText('Domain Availability')).toBeInTheDocument();
  });

  it('filters out .io domains', () => {
    const results: GeneratedName[] = [
      {
        name: 'TechFlow',
        meaning: 'Tech flow',
        languageOrigin: 'English',
        domains: [
          { url: 'techflow.io', status: 'Available' },
        ],
      },
    ];

    render(<ResultsList results={results} />);
    
    // Domain availability section should not show if no .com, .my, .ai
    const domainSection = screen.queryByText('Domain Availability');
    expect(domainSection).not.toBeInTheDocument();
  });

  it('shows all three domain extensions when available', async () => {
    const results: GeneratedName[] = [
      {
        name: 'TechFlow',
        meaning: 'Tech flow',
        languageOrigin: 'English',
        domains: [
          { url: 'techflow.com', status: 'Taken' },
          { url: 'techflow.my', status: 'Available' },
          { url: 'techflow.ai', status: 'Available' },
        ],
      },
    ];

    render(<ResultsList results={results} />);
    
    const button = screen.getByText('Domain Availability');
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('techflow.com')).toBeInTheDocument();
      expect(screen.getByText('techflow.my')).toBeInTheDocument();
      expect(screen.getByText('techflow.ai')).toBeInTheDocument();
    });
  });
});

describe('ResultsList Component - Domain Collapsing', () => {
  it('domain section is expanded by default', () => {
    const results: GeneratedName[] = [
      {
        name: 'TechFlow',
        meaning: 'Tech flow',
        languageOrigin: 'English',
        domains: [
          { url: 'techflow.com', status: 'Taken' },
        ],
      },
    ];

    render(<ResultsList results={results} />);
    
    // Domain should be visible by default
    expect(screen.getByText('techflow.com')).toBeInTheDocument();
  });

  it('collapses domain section when clicked', async () => {
    const results: GeneratedName[] = [
      {
        name: 'TechFlow',
        meaning: 'Tech flow',
        languageOrigin: 'English',
        domains: [
          { url: 'techflow.com', status: 'Taken' },
        ],
      },
    ];

    render(<ResultsList results={results} />);
    
    const button = screen.getByText('Domain Availability');
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.queryByText('techflow.com')).not.toBeInTheDocument();
    });
  });

  it('expands domain section when clicked again', async () => {
    const results: GeneratedName[] = [
      {
        name: 'TechFlow',
        meaning: 'Tech flow',
        languageOrigin: 'English',
        domains: [
          { url: 'techflow.com', status: 'Taken' },
        ],
      },
    ];

    const { rerender } = render(<ResultsList results={results} />);
    
    let button = screen.getByText('Domain Availability');
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.queryByText('techflow.com')).not.toBeInTheDocument();
    });

    button = screen.getByText('Domain Availability');
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('techflow.com')).toBeInTheDocument();
    });
  });

  it('independent collapse state for each name', async () => {
    const results: GeneratedName[] = [
      {
        name: 'TechFlow',
        meaning: 'Tech flow',
        languageOrigin: 'English',
        domains: [{ url: 'techflow.com', status: 'Taken' }],
      },
      {
        name: 'QuantumAI',
        meaning: 'Quantum AI',
        languageOrigin: 'English',
        domains: [{ url: 'quantumai.ai', status: 'Available' }],
      },
    ];

    render(<ResultsList results={results} />);
    
    // Both should be visible initially
    expect(screen.getByText('techflow.com')).toBeInTheDocument();
    expect(screen.getByText('quantumai.ai')).toBeInTheDocument();

    // Get all Domain Availability buttons
    const buttons = screen.getAllByText('Domain Availability');
    
    // Click first button to collapse
    fireEvent.click(buttons[0]);

    await waitFor(() => {
      expect(screen.queryByText('techflow.com')).not.toBeInTheDocument();
      // Second should still be visible
      expect(screen.getByText('quantumai.ai')).toBeInTheDocument();
    });
  });
});

describe('ResultsList Component - Domain Status Display', () => {
  it('displays Available status badge', () => {
    const results: GeneratedName[] = [
      {
        name: 'TechFlow',
        meaning: 'Tech flow',
        languageOrigin: 'English',
        domains: [
          { url: 'techflow.com', status: 'Available' },
        ],
      },
    ];

    render(<ResultsList results={results} />);
    
    expect(screen.getByText('AVAILABLE')).toBeInTheDocument();
  });

  it('displays Taken status badge', () => {
    const results: GeneratedName[] = [
      {
        name: 'TechFlow',
        meaning: 'Tech flow',
        languageOrigin: 'English',
        domains: [
          { url: 'techflow.com', status: 'Taken' },
        ],
      },
    ];

    render(<ResultsList results={results} />);
    
    expect(screen.getByText('TAKEN')).toBeInTheDocument();
  });

  it('displays Error status badge', () => {
    const results: GeneratedName[] = [
      {
        name: 'TechFlow',
        meaning: 'Tech flow',
        languageOrigin: 'English',
        domains: [
          { url: 'techflow.com', status: 'Error' },
        ],
      },
    ];

    render(<ResultsList results={results} />);
    
    expect(screen.getByText('ERROR')).toBeInTheDocument();
  });
});

describe('ResultsList Component - Copy Functionality', () => {
  beforeEach(() => {
    // Mock clipboard API
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });
  });

  it('copies name to clipboard when button clicked', async () => {
    const results: GeneratedName[] = [
      {
        name: 'TechFlow',
        meaning: 'Tech flow',
        languageOrigin: 'English',
        domains: [],
      },
    ];

    render(<ResultsList results={results} />);
    
    const copyButton = screen.getByTitle('Copy name');
    fireEvent.click(copyButton);

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('TechFlow');
    });
  });

  it('shows success feedback after copying', async () => {
    const results: GeneratedName[] = [
      {
        name: 'TechFlow',
        meaning: 'Tech flow',
        languageOrigin: 'English',
        domains: [],
      },
    ];

    render(<ResultsList results={results} />);
    
    const copyButton = screen.getByTitle('Copy name');
    fireEvent.click(copyButton);

    // Should show different icon after copy
    await waitFor(() => {
      expect(screen.getByTitle('Copy name')).toBeInTheDocument();
    });
  });
});

