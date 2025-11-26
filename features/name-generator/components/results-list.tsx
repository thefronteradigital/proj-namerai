'use client';

import { useState } from 'react';
import type { GeneratedName } from '@/lib/groq';
import { Check, X, DollarSign, Globe, AlertCircle, Copy, CheckCheck, ChevronDown } from 'lucide-react';

interface ResultsListProps {
  results: GeneratedName[];
}

interface ExpandedState {
  [key: string]: boolean;
}

export function ResultsList({ results }: ResultsListProps) {
  const [copiedName, setCopiedName] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<ExpandedState>({});

  if (results.length === 0) return null;

  const handleCopyName = async (name: string) => {
    try {
      await navigator.clipboard.writeText(name);
      setCopiedName(name);
      setTimeout(() => setCopiedName(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const toggleExpanded = (key: string) => {
    setExpanded((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const getFilteredDomains = (domains: GeneratedName['domains']) => {
    if (!domains) return [];
    const targetExtensions = ['.com', '.my', '.ai'];
    return domains.filter((domain) =>
      targetExtensions.some((ext) => domain.url.endsWith(ext))
    );
  };

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-8 duration-700">
      {/* Results count */}
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-slate-600">
          <span className="font-semibold text-slate-900">{results.length}</span> {results.length === 1 ? 'name' : 'names'} generated
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
        {results.map((item) => (
          <article 
            key={`${item.name}-${item.languageOrigin}`} 
            className="group bg-white rounded-2xl p-6 sm:p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 hover:border-blue-200 flex flex-col"
          >
            <div className="mb-4">
              <div className="flex items-start justify-between gap-3 mb-3">
                <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">
                  {item.languageOrigin}
                </span>
                <button
                  onClick={() => handleCopyName(item.name)}
                  className="p-2 rounded-lg hover:bg-slate-100 transition-colors touch-manipulation"
                  aria-label={`Copy ${item.name} to clipboard`}
                  title="Copy name"
                >
                  {copiedName === item.name ? (
                    <CheckCheck className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Copy className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
                  )}
                </button>
              </div>
              <h3 className="text-2xl sm:text-3xl font-display font-bold text-slate-900 group-hover:text-blue-600 transition-colors tracking-tight break-words">
                {item.name}
              </h3>
              <p className="text-slate-600 text-sm sm:text-base mt-3 leading-relaxed">
                {item.meaning}
              </p>
            </div>

            {item.domains && item.domains.length > 0 && (() => {
              const filteredDomains = getFilteredDomains(item.domains);
              const itemKey = `${item.name}-${item.languageOrigin}`;
              const isExpanded = expanded[itemKey] ?? true;
              
              return filteredDomains.length > 0 ? (
                <div className="mt-auto pt-6 border-t border-slate-100">
                  <button
                    onClick={() => toggleExpanded(itemKey)}
                    className="w-full flex items-center justify-between gap-2 mb-4 p-2 -m-2 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer group"
                  >
                    <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5" />
                      Domain Availability
                    </h4>
                    <ChevronDown 
                      className={`w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-transform duration-300 ${
                        isExpanded ? 'rotate-0' : '-rotate-90'
                      }`}
                    />
                  </button>
                  
                  {isExpanded && (
                    <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                      {filteredDomains.map((domain) => (
                        <div key={domain.url} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                          <span className="text-sm font-semibold text-slate-700 font-mono tracking-tight break-all">
                            {domain.url}
                          </span>
                          
                          <div className="flex items-center shrink-0">
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
                  )}
                </div>
              ) : null;
            })()}
          </article>
        ))}
      </div>
    </div>
  );
}
