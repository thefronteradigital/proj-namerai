"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { GeneratedName } from "@/features/name-generator/services/name-generator";
import type { DomainResult } from "@/features/name-generator/services/domain-service";
import { checkDomainsAction } from "@/features/name-generator/actions/check-domains";
import {
  Check,
  X,
  DollarSign,
  AlertCircle,
  Copy,
  CheckCheck,
  ChevronRight,
  Heart,
  X as CloseIcon,
  Globe,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import {
  getSavedNames,
  isNameSaved,
  toggleSavedName,
} from "@/lib/saved-names";

interface ResultsListProps {
  results: GeneratedName[];
  countLabel?: string;
  savedNames?: GeneratedName[];
  onSavedNamesChange?: (names: GeneratedName[]) => void;
}

const getItemKey = (item: GeneratedName) =>
  `${item.name}::${item.languageOrigin}`;

const getSuggestedDomains = (item: GeneratedName) => {
  if (item.suggestedDomains && item.suggestedDomains.length > 0) {
    return item.suggestedDomains;
  }
  const base = item.name.toLowerCase().replace(/[^a-z0-9]/g, "");
  return [
    ".com",
    ".my",
    ".com.my",
    ".shop",
    ".ai",
    ".net",
    ".org",
    ".edu.my",
    ".biz.my",
    ".xyz",
  ].map((ext) => `${base}${ext}`);
};

export function ResultsList({
  results,
  countLabel,
  savedNames: savedNamesProp,
  onSavedNamesChange,
}: ResultsListProps) {
  const [copiedName, setCopiedName] = useState<string | null>(null);
  const [internalSavedNames, setInternalSavedNames] = useState<GeneratedName[]>(
    []
  );
  const [activeItem, setActiveItem] = useState<GeneratedName | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [domainResultsMap, setDomainResultsMap] = useState<
    Record<string, DomainResult[]>
  >({});
  const [domainLoadingMap, setDomainLoadingMap] = useState<
    Record<string, boolean>
  >({});
  const [domainErrorMap, setDomainErrorMap] = useState<
    Record<string, string | null>
  >({});
  const sheetRef = useRef<HTMLElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  const savedNames = savedNamesProp ?? internalSavedNames;
  const setSavedNames = onSavedNamesChange ?? setInternalSavedNames;

  useEffect(() => {
    if (!savedNamesProp) {
      setInternalSavedNames(getSavedNames());
    }
  }, [savedNamesProp]);

  // Handle Sheet interactions
  useEffect(() => {
    if (!isSheetOpen) return;

    previouslyFocusedRef.current = document.activeElement as HTMLElement | null;
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        handleCloseSheet();
        return;
      }

      if (event.key !== "Tab") return;
      const sheet = sheetRef.current;
      if (!sheet) return;
      const focusables = Array.from(
        sheet.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
      ).filter((el) => !el.hasAttribute("disabled"));
      if (focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previouslyFocusedRef.current?.focus();
    };
  }, [isSheetOpen]);

  const handleCopyName = async (name: string) => {
    try {
      await navigator.clipboard.writeText(name);
      setCopiedName(name);
      setTimeout(() => setCopiedName(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleToggleSave = (item: GeneratedName) => {
    const nextSaved = toggleSavedName(item, savedNames);
    setSavedNames(nextSaved);
  };

  const handleOpenSheet = (item: GeneratedName) => {
    setActiveItem(item);
    setIsSheetOpen(true);
    // Automatically trigger domain check if not checked yet
    const key = getItemKey(item);
    if (!domainResultsMap[key] && !domainLoadingMap[key]) {
      checkDomains(item);
    }
  };

  const handleCloseSheet = () => {
    setIsSheetOpen(false);
    setTimeout(() => setActiveItem(null), 300); // Wait for transition
  };

  const checkDomains = async (item: GeneratedName) => {
    const key = getItemKey(item);
    if (domainResultsMap[key] || domainLoadingMap[key]) return;

    setDomainLoadingMap((prev) => ({ ...prev, [key]: true }));
    const domains = getSuggestedDomains(item);
    const { results: domainResults, error } = await checkDomainsAction(domains);
    setDomainResultsMap((prev) => ({ ...prev, [key]: domainResults }));
    setDomainErrorMap((prev) => ({ ...prev, [key]: error }));
    setDomainLoadingMap((prev) => ({ ...prev, [key]: false }));
  };

  const activeKey = useMemo(
    () => (activeItem ? getItemKey(activeItem) : null),
    [activeItem]
  );
  const activeDomainResults = activeKey
    ? domainResultsMap[activeKey] ?? []
    : [];
  const activeDomainLoading = activeKey
    ? domainLoadingMap[activeKey] ?? false
    : false;
  const activeDomainError = activeKey ? domainErrorMap[activeKey] : null;

  if (results.length === 0) return null;

  return (
    <>
      <div className="w-full">
        {/* Results Metadata */}
        <div className="mb-8 flex items-end justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-xl font-display font-bold text-slate-900">
              Generated Results
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Found <span className="font-semibold text-slate-900">{results.length}</span>{" "}
              {countLabel ?? "names based on your criteria"}
            </p>
          </div>
        </div>

        {/* Results Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map((item, index) => (
            <div
              key={`${item.name}-${item.languageOrigin}`}
              role="button"
              tabIndex={0}
              onClick={() => handleOpenSheet(item)}
              className="group relative bg-white rounded-2xl p-5 md:p-6 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05),0_0_0_1px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_24px_-8px_rgba(0,0,0,0.1),0_0_0_1px_rgba(59,130,246,0.1)] transition-all duration-300 hover:-translate-y-1 cursor-pointer overflow-hidden isolate"
            >
              <div className="absolute inset-0 bg-linear-to-br from-slate-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />

              <div className="flex items-center justify-between mb-6 md:mb-8">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-600 group-hover:bg-blue-50 group-hover:text-blue-700 transition-colors">
                  <Globe className="w-3 h-3" />
                  {item.languageOrigin}
                </span>
                <span className="text-[10px] items-center justify-center hidden group-hover:flex text-blue-600 font-semibold bg-blue-50 px-2 py-1 rounded-full animate-in fade-in zoom-in duration-200">
                  View <ChevronRight className="w-3 h-3 ml-0.5" />
                </span>
              </div>

              <h3 className="text-2xl md:text-3xl font-display font-bold text-slate-900 group-hover:text-blue-600 transition-colors tracking-tight mb-3">
                {item.name}
              </h3>

              <p className="text-sm text-slate-500 line-clamp-2 mb-6 h-10">
                {item.meaning}
              </p>

              <div className="flex items-center gap-2 pt-4 border-t border-slate-50 group-hover:border-slate-100/50 transition-colors">
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    handleToggleSave(item);
                  }}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${isNameSaved(item, savedNames)
                    ? "bg-rose-50 text-rose-600 hover:bg-rose-100"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100 group-hover:bg-white group-hover:shadow-sm group-hover:ring-1 group-hover:ring-slate-200"
                    }`}
                >
                  <Heart
                    className={`w-4 h-4 ${isNameSaved(item, savedNames) ? "fill-current" : ""}`}
                  />
                  {isNameSaved(item, savedNames) ? "Saved" : "Save"}
                </button>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    handleCopyName(item.name);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold bg-slate-50 text-slate-600 hover:bg-slate-100 group-hover:bg-white group-hover:shadow-sm group-hover:ring-1 group-hover:ring-slate-200 transition-all"
                >
                  {copiedName === item.name ? (
                    <>
                      <CheckCheck className="w-4 h-4 text-emerald-600" />
                      <span className="text-emerald-700">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sheet / Drawer Overlay */}
      <div
        className={`fixed inset-0 z-50 transition-all duration-500 ${isSheetOpen ? "pointer-events-auto visible shadow-none" : "pointer-events-none invisible delay-300"
          }`}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-500 ${isSheetOpen ? "opacity-100" : "opacity-0"
            }`}
          onClick={handleCloseSheet}
        />

        {/* Sheet Content */}
        <aside
          ref={sheetRef}
          className={`absolute right-0 top-0 h-full w-full sm:max-w-[520px] bg-white shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${isSheetOpen ? "translate-x-0" : "translate-x-full"
            }`}
          role="dialog"
          aria-modal="true"
        >
          {activeItem && (
            <div className="h-full flex flex-col bg-slate-50/50">
              {/* Sheet Header */}
              <div className="flex-none px-5 py-5 md:px-8 md:py-6 bg-white border-b border-slate-100">
                <div className="flex items-center justify-between mb-4 md:mb-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full text-[11px] font-bold uppercase tracking-wider text-slate-600">
                    <Globe className="w-3 h-3" />
                    {activeItem.languageOrigin}
                  </div>
                  <button
                    onClick={handleCloseSheet}
                    className="group flex flex-col items-center justify-center w-10 h-10 rounded-full bg-slate-50 hover:bg-slate-100 transition-colors"
                  >
                    <CloseIcon className="w-5 h-5 text-slate-400 group-hover:text-slate-700 transition-colors" />
                  </button>
                </div>

                <div className="space-y-4">
                  <h2 className="text-3xl md:text-5xl font-display font-bold text-slate-900 tracking-tight break-words">
                    {activeItem.name}
                  </h2>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleToggleSave(activeItem)}
                      className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold transition-all cursor-pointer ${isNameSaved(activeItem, savedNames)
                        ? "bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-100"
                        : "bg-white text-slate-700 hover:text-slate-900 border border-slate-200 hover:border-slate-300 shadow-sm"
                        }`}
                    >
                      <Heart
                        className={`w-4 h-4 ${isNameSaved(activeItem, savedNames) ? "fill-current" : ""}`}
                      />
                      {isNameSaved(activeItem, savedNames) ? "Saved to favorites" : "Save to favorites"}
                    </button>
                    <button
                      onClick={() => handleCopyName(activeItem.name)}
                      className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white text-slate-700 border border-slate-200 hover:border-slate-300 hover:text-slate-900 shadow-sm transition-all"
                    >
                      {copiedName === activeItem.name ? (
                        <CheckCheck className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <Copy className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Sheet Body */}
              <div className="flex-1 overflow-y-auto p-5 md:p-8 space-y-6 md:space-y-8">
                {/* Meaning Section */}
                <div className="bg-white rounded-3xl p-6 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)] border border-slate-100/50">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                      Meaning & Context
                    </h3>
                  </div>
                  <p className="text-base md:text-lg text-slate-600 leading-relaxed font-light">
                    {activeItem.meaning}
                  </p>
                </div>

                {/* Domain Availability */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                      Domain Availability
                    </h3>
                    {/* Re-check button if needed, or status */}
                    {activeDomainLoading && <span className="text-xs text-slate-400 animate-pulse">Checking...</span>}
                  </div>

                  <div className="grid grid-cols-1 gap-2">
                    {activeDomainError && (
                      <div className="p-4 rounded-xl bg-rose-50 text-rose-700 text-sm border border-rose-100">
                        {activeDomainError}
                      </div>
                    )}

                    {!activeDomainLoading && activeDomainResults.length === 0 && !activeDomainError && (
                      // This shouldn't typically happen as we check on open
                      <div className="text-sm text-slate-500 italic">No domain data available.</div>
                    )}

                    {activeDomainLoading ? (
                      // Loading Skeletons
                      Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="h-14 rounded-xl bg-white border border-slate-100 overflow-hidden relative">
                          <div className="absolute inset-0 bg-linear-to-r from-transparent via-slate-50 to-transparent animate-shimmer" style={{ transform: 'translateX(-100%)' }} />
                        </div>
                      ))
                    ) : (
                      activeDomainResults.map((domain) => (
                        <a
                          key={domain.url}
                          href={`https://${domain.url}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex flex-col xs:flex-row items-start xs:items-center justify-between gap-3 p-4 rounded-xl bg-white border border-slate-100 hover:border-blue-200 hover:shadow-sm transition-all text-left"
                        >
                          <span className="font-mono text-slate-700 text-sm break-all">{domain.url}</span>

                          <div className="flex items-center gap-3 w-full xs:w-auto justify-between xs:justify-end">
                            {domain.status === "Available" && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-wide border border-emerald-100/50">
                                <Check className="w-3 h-3 stroke-[3px]" /> Available
                              </span>
                            )}
                            {domain.status === "Taken" && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-wide">
                                <X className="w-3 h-3 stroke-[3px]" /> Taken
                              </span>
                            )}
                            {domain.status === "Premium" && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-[10px] font-bold uppercase tracking-wide border border-amber-100/50">
                                <DollarSign className="w-3 h-3 stroke-[3px]" /> Premium
                              </span>
                            )}
                            {domain.status === "Error" && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 text-[10px] font-bold uppercase tracking-wide">
                                <AlertCircle className="w-3 h-3 stroke-[3px]" /> Error
                              </span>
                            )}
                            <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-blue-400 transition-colors" />
                          </div>
                        </a>
                      ))
                    )}
                  </div>
                </div>

                {/* Additional Actions / Footer */}
                <div className="pt-8 mt-4 border-t border-slate-100">
                  <div className="bg-blue-50/50 rounded-2xl p-5 border border-blue-100/50">
                    <p className="text-sm text-blue-900/80 mb-3">
                      Like this name? Save it to keep track of your favorites or continue refining your search.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </aside>
      </div>
    </>
  );
}
