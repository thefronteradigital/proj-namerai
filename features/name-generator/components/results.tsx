'use client';

import { useRouter } from 'next/navigation';
import { ResultsList } from './results-list';
import { EmptyState } from '@/components/empty-state';
import { ErrorState } from '@/components/error-state';
import type { GeneratedName } from '@/features/name-generator/services/gemini-service';
import { ArrowLeft, AlertTriangle } from 'lucide-react';

interface ResultsProps {
  keywords: string;
  style: string;
  length: string;
  results: GeneratedName[];
  error: string | null;
  rateLimitWarning: string | null;
}

export function Results({
  keywords,
  style,
  length,
  results,
  error,
  rateLimitWarning,
}: ResultsProps) {
  const router = useRouter();

  const handleBack = () => {
    router.push('/');
  };

  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="flex-1 w-full max-w-5xl mx-auto px-4 md:px-6 pt-12 pb-24">
      {/* Header / Nav Back */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <button 
          onClick={handleBack}
          className="group flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors text-sm font-semibold uppercase tracking-wide"
        >
          <div className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-blue-50 flex items-center justify-center transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </div>
          Back to Generator
        </button>
        
        <div className="text-right hidden md:block">
          <span className="text-slate-400 text-sm">Searching for: </span>
          <span className="font-semibold text-slate-800">
            {keywords || style} · {length}
          </span>
        </div>
      </div>

      {/* Rate Limit Warning */}
      {rateLimitWarning && (
        <div className="w-full mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3 text-amber-800 animate-in slide-in-from-top-4">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-semibold text-sm mb-1">Domain Check Limit Warning</h4>
            <p className="text-sm text-amber-700">{rateLimitWarning}</p>
          </div>
        </div>
      )}

      {/* Guard: Error State - Early return pattern */}
      {error && (
        <ErrorState 
          message={error}
          onRetry={handleRetry}
          onBack={handleBack}
        />
      )}

      {/* Guard: Empty State */}
      {!error && results.length === 0 && (
        <EmptyState />
      )}

      {/* Happy path: Results */}
      {!error && results.length > 0 && (
        <ResultsList results={results} />
      )}
    </div>
  );
}
