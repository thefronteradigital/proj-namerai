"use client";

import { useRouter } from "next/navigation";
import { ResultsList } from "./results-list";
import { ResultsHeader } from "./results-header";
import { EmptyState } from "@/components/empty-state";
import { ErrorState } from "@/components/error-state";
import type { GeneratedName } from "@/features/name-generator/services/name-generator";
import { AlertTriangle } from "lucide-react";

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
    router.push("/");
  };

  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 pb-16 sm:pb-24">
      <ResultsHeader
        keywords={keywords}
        style={style}
        length={length}
        onBack={handleBack}
      />

      {/* Rate Limit Warning */}
      {rateLimitWarning && (
        <div className="w-full mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3 text-amber-800 animate-in slide-in-from-top-4">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-semibold text-sm mb-1">
              Domain Check Limit Warning
            </h4>
            <p className="text-sm text-amber-700">{rateLimitWarning}</p>
          </div>
        </div>
      )}

      {/* Guard: Error State - Early return pattern */}
      {error && (
        <ErrorState message={error} onRetry={handleRetry} onBack={handleBack} />
      )}

      {/* Guard: Empty State */}
      {!error && results.length === 0 && <EmptyState />}

      {/* Happy path: Results */}
      {!error && results.length > 0 && <ResultsList results={results} />}
    </div>
  );
}
