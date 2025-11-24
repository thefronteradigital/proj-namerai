'use client';

import { Sparkles } from 'lucide-react';

interface EmptyStateProps {
  message?: string;
}

export function EmptyState({ message = 'No names generated. Please try again.' }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
        <Sparkles className="w-8 h-8 text-slate-400" />
      </div>
      <p className="text-slate-400 text-base">{message}</p>
    </div>
  );
}
