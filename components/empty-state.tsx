'use client';

import { Sparkles } from 'lucide-react';

interface EmptyStateProps {
  message?: string;
}

export function EmptyState({ message = 'No names generated. Please try again.' }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 sm:py-20 px-4 text-center">
      <div className="relative mb-6">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center">
          <Sparkles className="w-10 h-10 text-slate-400" />
        </div>
        <div className="absolute inset-0 rounded-full bg-blue-100 animate-ping opacity-20" />
      </div>
      <h3 className="text-lg font-semibold text-slate-700 mb-2">No Results Yet</h3>
      <p className="text-slate-500 text-sm sm:text-base max-w-md leading-relaxed">{message}</p>
    </div>
  );
}
