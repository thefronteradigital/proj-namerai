"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart, ArrowLeft } from "lucide-react";
import type { GeneratedName } from "@/features/name-generator/services/name-generator";
import { ResultsList } from "@/features/name-generator/components/results-list";
import { EmptyState } from "@/components/empty-state";
import { getSavedNames } from "@/lib/saved-names";

export function SavedPage() {
  const [savedNames, setSavedNames] = useState<GeneratedName[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setSavedNames(getSavedNames());
    setIsReady(true);
  }, []);

  const countLabel = savedNames.length === 1 ? "saved name" : "saved names";

  return (
    <div className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-12 pb-12 sm:pb-24">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between mb-8 sm:mb-10">
        <div className="space-y-3">
          <Link
            href="/"
            className="group inline-flex items-center gap-2 text-slate-600 hover:text-blue-600 transition-colors text-sm font-semibold self-start"
          >
            <div className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-blue-50 flex items-center justify-center transition-all group-hover:scale-110">
              <ArrowLeft className="w-4 h-4" />
            </div>
            <span className="uppercase tracking-wide">Back to Generator</span>
          </Link>
          <div>
            <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-rose-600 bg-rose-50 border border-rose-100 rounded-full px-3 py-1">
              <Heart className="w-3.5 h-3.5" />
              Saved Library
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-slate-900 mt-3">
              Your saved names
            </h1>
            <p className="text-slate-600 text-sm sm:text-base mt-2 max-w-2xl">
              Keep your favorites here. Names are stored locally on this device.
            </p>
          </div>
        </div>
        <Link
          href="/"
          className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-blue-600 text-white text-sm font-semibold shadow-sm hover:bg-blue-700 transition-colors"
        >
          Generate new names
        </Link>
      </div>

      {!isReady ? (
        <div className="text-sm text-slate-500">Loading saved names...</div>
      ) : savedNames.length === 0 ? (
        <EmptyState message="No saved names yet. Tap the heart on any result to keep it here." />
      ) : (
        <ResultsList
          results={savedNames}
          countLabel={countLabel}
          savedNames={savedNames}
          onSavedNamesChange={setSavedNames}
        />
      )}
    </div>
  );
}
