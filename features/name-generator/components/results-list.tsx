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
  ChevronDown,
  Heart,
  X as CloseIcon,
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
  const [isDomainOpen, setIsDomainOpen] = useState(false);
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

  useEffect(() => {
    setIsDomainOpen(false);
  }, [activeItem]);

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
  };

  const handleCloseSheet = () => {
    setIsSheetOpen(false);
  };

  const handleToggleDomains = async () => {
    if (!activeItem) return;
    const nextOpen = !isDomainOpen;
    setIsDomainOpen(nextOpen);

    if (!nextOpen) return;

    const key = getItemKey(activeItem);
    if (domainResultsMap[key] || domainLoadingMap[key]) return;

    setDomainLoadingMap((prev) => ({ ...prev, [key]: true }));
    const domains = getSuggestedDomains(activeItem);
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
    <div className="w-full animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-slate-600">
          <span className="font-semibold text-slate-900">{results.length}</span>{" "}
          {countLabel ??
            `${results.length === 1 ? "name" : "names"} generated`}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {results.map((item, index) => (
          <div
            key={`${item.name}-${item.languageOrigin}`}
            role="button"
            tabIndex={0}
            onClick={() => handleOpenSheet(item)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                handleOpenSheet(item);
              }
            }}
            className="group text-left bg-white rounded-2xl p-5 shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 hover:border-blue-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            aria-label={`Open details for ${item.name}`}
          >
            <div className="flex items-center justify-between gap-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">
                {item.languageOrigin}
              </span>
              <span className="text-[11px] font-semibold text-slate-400">
                #{String(index + 1).padStart(2, "0")}
              </span>
            </div>
            <h3 className="text-2xl font-display font-bold text-slate-900 group-hover:text-blue-600 transition-colors tracking-tight mt-4">
              {item.name}
            </h3>
            <div className="flex flex-wrap items-center gap-2 mt-4">
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  handleToggleSave(item);
                }}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-rose-200 text-rose-600 text-xs font-semibold hover:bg-rose-50 transition-colors"
              >
                <Heart
                  className="w-3.5 h-3.5"
                  fill={isNameSaved(item, savedNames) ? "currentColor" : "none"}
                />
                {isNameSaved(item, savedNames) ? "Saved" : "Save"}
              </button>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  handleCopyName(item.name);
                }}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition-colors"
              >
                {copiedName === item.name ? (
                  <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                {copiedName === item.name ? "Copied" : "Copy"}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div
        className={`fixed inset-0 z-50 ${
          isSheetOpen ? "pointer-events-auto" : "pointer-events-none"
        }`}
      >
        <div
          className={`absolute inset-0 bg-slate-900/30 transition-opacity duration-200 ${
            isSheetOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={handleCloseSheet}
        />
        <aside
          ref={sheetRef}
          className={`absolute right-0 top-0 h-full w-full sm:max-w-md bg-white shadow-2xl border-l border-slate-200 transition-transform duration-300 ${
            isSheetOpen ? "translate-x-0" : "translate-x-full"
          }`}
          role="dialog"
          aria-modal="true"
          aria-labelledby="name-detail-title"
          aria-hidden={!isSheetOpen}
        >
          <div className="h-full flex flex-col">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-white/70 backdrop-blur">
              <div className="space-y-1">
                <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                  Name Detail
                </span>
                <h2
                  id="name-detail-title"
                  className="text-2xl font-display font-bold text-slate-900"
                >
                  {activeItem?.name ?? "Select a name"}
                </h2>
              </div>
              <button
                type="button"
                onClick={handleCloseSheet}
                ref={closeButtonRef}
                className="w-9 h-9 rounded-full border border-slate-200 text-slate-500 hover:text-slate-700 hover:border-slate-300 flex items-center justify-center transition-colors"
                aria-label="Close details"
              >
                <CloseIcon className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
              {activeItem ? (
                <>
                  <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-5 space-y-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                        {activeItem.languageOrigin}
                      </span>
                      <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                        Meaning
                      </span>
                    </div>
                    <p className="text-slate-700 text-sm leading-relaxed">
                      {activeItem.meaning}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleSave(activeItem)}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-rose-200 text-rose-600 text-sm font-semibold hover:bg-rose-50 transition-colors"
                    >
                      <Heart
                        className="w-4 h-4"
                        fill={
                          isNameSaved(activeItem, savedNames)
                            ? "currentColor"
                            : "none"
                        }
                      />
                      {isNameSaved(activeItem, savedNames)
                        ? "Saved"
                        : "Save"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCopyName(activeItem.name)}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-colors"
                    >
                      {copiedName === activeItem.name ? (
                        <CheckCheck className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                      {copiedName === activeItem.name ? "Copied" : "Copy"}
                    </button>
                  </div>

                  <div className="border border-slate-100 rounded-2xl p-4 bg-slate-50">
                    <button
                      type="button"
                      onClick={handleToggleDomains}
                      className="w-full flex items-center justify-between gap-2 text-sm font-semibold text-slate-700"
                    >
                      <span>Domain availability</span>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-400 transition-transform ${
                          isDomainOpen ? "rotate-0" : "-rotate-90"
                        }`}
                      />
                    </button>

                    {isDomainOpen && (
                      <div className="mt-4 space-y-3">
                        {activeDomainLoading && (
                          <div className="space-y-2">
                            {[...Array(10)].map((_, idx) => (
                              <div
                                key={`domain-skeleton-${idx}`}
                                className="h-10 rounded-lg bg-white border border-slate-100 overflow-hidden relative"
                              >
                                <div className="absolute inset-0 bg-gradient-to-r from-slate-100 via-slate-200/70 to-slate-100 animate-pulse" />
                              </div>
                            ))}
                          </div>
                        )}
                        {activeDomainError && (
                          <div className="text-xs text-rose-600">
                            {activeDomainError}
                          </div>
                        )}
                        {!activeDomainLoading && activeDomainResults.length > 0 && (
                          <div className="space-y-2">
                            {activeDomainResults.map((domain) => (
                              <div
                                key={domain.url}
                                className="flex items-center justify-between gap-2 p-3 rounded-lg bg-white border border-slate-100"
                              >
                                <span className="text-sm font-semibold text-slate-700 font-mono tracking-tight break-all">
                                  {domain.url}
                                </span>
                                <span className="shrink-0">
                                  {domain.status === "Available" && (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[11px] font-bold uppercase tracking-wide border border-emerald-100">
                                      <Check className="w-3 h-3 stroke-[3px]" />{" "}
                                      Available
                                    </span>
                                  )}
                                  {domain.status === "Taken" && (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 text-[11px] font-bold uppercase tracking-wide border border-slate-200">
                                      <X className="w-3 h-3 stroke-[3px]" />{" "}
                                      Taken
                                    </span>
                                  )}
                                  {domain.status === "Premium" && (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-600 text-[11px] font-bold uppercase tracking-wide border border-amber-100">
                                      <DollarSign className="w-3 h-3 stroke-[3px]" />{" "}
                                      Premium
                                    </span>
                                  )}
                                  {domain.status === "Error" && (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 text-rose-600 text-[11px] font-bold uppercase tracking-wide border border-rose-100">
                                      <AlertCircle className="w-3 h-3 stroke-[3px]" />{" "}
                                      Error
                                    </span>
                                  )}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                        {!activeDomainLoading &&
                          !activeDomainError &&
                          activeDomainResults.length === 0 && (
                            <div className="text-xs text-slate-500">
                              Click to check availability for .com, .my, and .ai.
                            </div>
                          )}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="space-y-6">
                  <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-5 space-y-4">
                    <div className="h-4 w-28 bg-slate-100 rounded-full animate-pulse" />
                    <div className="space-y-2">
                      <div className="h-4 w-full bg-slate-100 rounded-full animate-pulse" />
                      <div className="h-4 w-11/12 bg-slate-100 rounded-full animate-pulse" />
                      <div className="h-4 w-3/4 bg-slate-100 rounded-full animate-pulse" />
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <div className="h-10 w-28 bg-slate-100 rounded-full animate-pulse" />
                    <div className="h-10 w-24 bg-slate-100 rounded-full animate-pulse" />
                  </div>
                  <div className="border border-slate-100 rounded-2xl p-4 bg-slate-50">
                    <div className="flex items-center justify-between">
                      <div className="h-4 w-40 bg-slate-100 rounded-full animate-pulse" />
                      <div className="h-4 w-4 bg-slate-100 rounded-full animate-pulse" />
                    </div>
                    <div className="mt-4 space-y-2">
                      {[...Array(3)].map((_, idx) => (
                        <div
                          key={`sheet-domain-skeleton-${idx}`}
                          className="h-10 rounded-lg bg-white border border-slate-100 overflow-hidden relative"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-slate-100 via-slate-200/70 to-slate-100 animate-pulse" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
