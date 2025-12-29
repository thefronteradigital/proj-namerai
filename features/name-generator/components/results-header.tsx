"use client";

import { ArrowLeft, Sparkles } from "lucide-react";

interface ResultsHeaderProps {
  keywords: string;
  style: string;
  length: string;
  onBack: () => void;
}

export function ResultsHeader({
  keywords,
  style,
  length,
  onBack,
}: ResultsHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10 sm:mb-14">
      <button
        onClick={onBack}
        className="group inline-flex items-center gap-3 text-slate-500 hover:text-slate-900 transition-colors pr-4 py-2"
        aria-label="Go back to generator"
      >
        <div className="w-10 h-10 rounded-full bg-white border border-slate-200 shadow-sm group-hover:shadow-md group-hover:border-slate-300 group-hover:scale-105 flex items-center justify-center transition-all duration-300">
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
        </div>
        <div className="flex flex-col items-start">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 group-hover:text-blue-600 transition-colors">
            Back
          </span>
          <span className="font-semibold text-sm">To Generator</span>
        </div>
      </button>

      {/* Search Info */}
      <div className="flex items-center gap-3 animate-in fade-in slide-in-from-right-4 duration-700 delay-100">
        <div className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full bg-blue-50 text-blue-600">
          <Sparkles className="w-5 h-5" />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {keywords && (
            <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm text-slate-900 text-sm font-medium">
              {keywords}
            </span>
          )}
          <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-slate-100/80 border border-transparent text-slate-600 text-sm font-medium">
            {style}
          </span>
          <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-slate-100/80 border border-transparent text-slate-600 text-sm font-medium">
            {length}
          </span>
        </div>
      </div>
    </div>
  );
}
