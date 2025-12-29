"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FormInput } from "@/components/form-input";
import type { FormState } from "@/features/name-generator/services/name-generator";
import {
  LANGUAGES,
  NAMING_STYLES,
  NAME_LENGTHS,
  type Language,
  type NamingStyle,
  type NameLength,
} from "@/features/name-generator/constants/form-options";
import { ArrowRight, Globe, Settings2, ChevronDown, Type } from "lucide-react";

export function GeneratorForm() {
  const router = useRouter();
  const [formState, setFormState] = useState<FormState>({
    language: LANGUAGES.ENGLISH,
    style: NAMING_STYLES.TECHY,
    length: NAME_LENGTHS.SHORT,
    keywords: "",
    checkDomains: false,
  });

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams({
      language: formState.language,
      style: formState.style,
      length: formState.length,
      keywords: formState.keywords,
    });
    router.push(`/results?${params.toString()}`);
  };

  return (
    <form onSubmit={handleGenerate} className="flex flex-col gap-6">
      {/* Unified Form Container */}
      <div className="bg-white rounded-2xl p-6 shadow-xl border-2 border-slate-200 relative z-30">
        {/* Controls / Filters - Compact */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-5">
          {/* Language Selector */}
          <FormInput label="Language" className="md:col-span-1">
            <div className="relative group">
              <select
                value={formState.language}
                onChange={(e) =>
                  setFormState((prev) => ({
                    ...prev,
                    language: e.target.value as Language,
                  }))
                }
                className="w-full h-9 bg-white border-2 border-slate-300 text-slate-800 font-medium text-xs rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block pl-8 pr-8 outline-none appearance-none cursor-pointer hover:border-slate-400 transition-colors shadow-sm"
              >
                {Object.values(LANGUAGES).map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
              <Globe className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none group-hover:text-blue-600 transition-colors" />
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </FormInput>

          {/* Style Selector */}
          <FormInput label="Naming Style" className="md:col-span-1">
            <div className="relative group">
              <select
                value={formState.style}
                onChange={(e) =>
                  setFormState((prev) => ({
                    ...prev,
                    style: e.target.value as NamingStyle,
                  }))
                }
                className="w-full h-9 bg-white border-2 border-slate-300 text-slate-800 font-medium text-xs rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block pl-8 pr-8 outline-none appearance-none cursor-pointer hover:border-slate-400 transition-colors shadow-sm"
              >
                {Object.values(NAMING_STYLES).map((style) => (
                  <option key={style} value={style}>
                    {style}
                  </option>
                ))}
              </select>
              <Settings2 className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none group-hover:text-blue-600 transition-colors" />
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </FormInput>

          {/* Length Selector */}
          <FormInput label="Name Length" className="md:col-span-1">
            <div className="relative group">
              <select
                value={formState.length}
                onChange={(e) =>
                  setFormState((prev) => ({
                    ...prev,
                    length: e.target.value as NameLength,
                  }))
                }
                className="w-full h-9 bg-white border-2 border-slate-300 text-slate-800 font-medium text-xs rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block pl-8 pr-8 outline-none appearance-none cursor-pointer hover:border-slate-400 transition-colors shadow-sm"
              >
                {Object.values(NAME_LENGTHS).map((length) => (
                  <option key={length} value={length}>
                    {length}
                  </option>
                ))}
              </select>
              <Type className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none group-hover:text-blue-600 transition-colors" />
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </FormInput>

        </div>

        {/* Divider */}
        <div className="border-t border-slate-200 my-5" />

        {/* Main Input Bar */}
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="flex-1 w-full relative">
            <input
              type="text"
              value={formState.keywords}
              onChange={(e) =>
                setFormState((prev) => ({ ...prev, keywords: e.target.value }))
              }
              placeholder="Describe your project (e.g. coffee shop)"
              className="w-full h-14 md:h-16 px-4 md:px-5 bg-slate-50 border-2 border-slate-300 rounded-xl text-base md:text-lg font-semibold text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              autoFocus
            />
          </div>

          <button
            type="submit"
            className="w-full md:w-auto px-8 h-14 md:h-16 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-base md:text-lg shadow-lg shadow-blue-500/20 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <span>Generate</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </form>
  );
}
