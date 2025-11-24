'use client';

import { ArrowLeft } from 'lucide-react';

interface ResultsHeaderProps {
  keywords: string;
  style: string;
  length: string;
  onBack: () => void;
}

export function ResultsHeader({ keywords, style, length, onBack }: ResultsHeaderProps) {
  return (
    <div className="flex flex-col gap-4 mb-8 sm:mb-10">
      <button 
        onClick={onBack}
        className="group inline-flex items-center gap-2 text-slate-600 hover:text-blue-600 transition-colors text-sm font-semibold self-start"
        aria-label="Go back to generator"
      >
        <div className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-blue-50 flex items-center justify-center transition-all group-hover:scale-110">
          <ArrowLeft className="w-4 h-4" />
        </div>
        <span className="uppercase tracking-wide">Back to Generator</span>
      </button>
      
      {/* Search Info - Now visible on mobile */}
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="text-slate-400">Generated for:</span>
        <div className="flex flex-wrap items-center gap-2">
          {keywords && (
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-medium">
              {keywords}
            </span>
          )}
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-medium">
            {style}
          </span>
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-medium">
            {length}
          </span>
        </div>
      </div>
    </div>
  );
}
