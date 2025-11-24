'use client';

import type { GeneratedName } from '@/features/name-generator/services/gemini-service';
import { Check, X, DollarSign, Globe, AlertCircle } from 'lucide-react';

interface ResultsListProps {
  results: GeneratedName[];
}

export function ResultsList({ results }: ResultsListProps) {
  if (results.length === 0) return null;

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {results.map((item) => (
          <div 
            key={`${item.name}-${item.languageOrigin}`} 
            className="group bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 hover:border-blue-100 flex flex-col"
          >
            <div className="mb-4">
              <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md mb-3">
                {item.languageOrigin}
              </span>
              <h3 className="text-3xl font-display font-bold text-slate-900 group-hover:text-blue-600 transition-colors tracking-tight">
                {item.name}
              </h3>
              <p className="text-slate-500 text-sm mt-3 leading-relaxed">
                {item.meaning}
              </p>
            </div>

            {item.domains && item.domains.length > 0 && (
              <div className="mt-auto pt-6 border-t border-slate-50">
                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-1.5">
                  <Globe className="w-3 h-3" />
                  Domain Availability
                </h4>
                <div className="space-y-3">
                  {item.domains.map((domain) => (
                    <div key={domain.url} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors -mx-2">
                      <span className="text-sm font-semibold text-slate-700 font-mono tracking-tight">
                        {domain.url}
                      </span>
                      
                      <div className="flex items-center">
                        {domain.status === 'Available' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[11px] font-bold uppercase tracking-wide border border-emerald-100">
                            <Check className="w-3 h-3 stroke-[3px]" /> Available
                          </span>
                        )}
                        {domain.status === 'Taken' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 text-[11px] font-bold uppercase tracking-wide border border-slate-200">
                            <X className="w-3 h-3 stroke-[3px]" /> Taken
                          </span>
                        )}
                        {domain.status === 'Premium' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-600 text-[11px] font-bold uppercase tracking-wide border border-amber-100">
                            <DollarSign className="w-3 h-3 stroke-[3px]" /> Premium
                          </span>
                        )}
                        {domain.status === 'Error' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 text-rose-600 text-[11px] font-bold uppercase tracking-wide border border-rose-100">
                            <AlertCircle className="w-3 h-3 stroke-[3px]" /> Error
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
