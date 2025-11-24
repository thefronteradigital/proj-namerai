'use client';

import { ArrowLeft } from 'lucide-react';

export function BackButton() {
  return (
    <button
      onClick={() => window.history.back()}
      className="group inline-flex items-center justify-center gap-2 px-8 h-14 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-lg border-2 border-slate-200 hover:border-slate-300 transition-all transform active:scale-[0.98]"
    >
      <ArrowLeft className="w-5 h-5" />
      <span>Go Back</span>
    </button>
  );
}
