'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FormInput } from '@/components/form-input';
import type { FormState } from '@/features/name-generator/services/gemini-service';
import { LANGUAGES, NAMING_STYLES, NAME_LENGTHS, type Language, type NamingStyle, type NameLength } from '@/features/name-generator/constants/form-options';
import { ArrowRight, Globe, Settings2, ChevronDown, Type } from 'lucide-react';

export function GeneratorForm() {
  const router = useRouter();
  const [formState, setFormState] = useState<FormState>({
    language: LANGUAGES.ENGLISH,
    style: NAMING_STYLES.TECHY,
    length: NAME_LENGTHS.SHORT,
    keywords: '',
    checkDomains: false,
  });

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams({
      language: formState.language,
      style: formState.style,
      length: formState.length,
      keywords: formState.keywords,
      checkDomains: String(formState.checkDomains),
    });
    router.push(`/results?${params.toString()}`);
  };

  return (
    <form onSubmit={handleGenerate} className="flex flex-col gap-8">
      {/* Controls / Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 bg-white/80 backdrop-blur-xl rounded-2xl relative z-30">
        {/* Language Selector */}
        <FormInput label="Language" className="md:col-span-1">
          <div className="relative group">
            <select
              value={formState.language}
              onChange={(e) => setFormState(prev => ({ ...prev, language: e.target.value as Language }))}
              className="w-full h-11 bg-slate-50 border border-slate-200 text-slate-700 font-medium text-sm rounded-lg focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 block pl-10 pr-10 outline-none appearance-none cursor-pointer hover:border-slate-300 transition-colors"
            >
              {Object.values(LANGUAGES).map((lang) => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
            <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none group-hover:text-blue-600 transition-colors" />
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </FormInput>

        {/* Style Selector */}
        <FormInput label="Naming Style" className="md:col-span-1">
          <div className="relative group">
            <select
              value={formState.style}
              onChange={(e) => setFormState(prev => ({ ...prev, style: e.target.value as NamingStyle }))}
              className="w-full h-11 bg-slate-50 border border-slate-200 text-slate-700 font-medium text-sm rounded-lg focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 block pl-10 pr-10 outline-none appearance-none cursor-pointer hover:border-slate-300 transition-colors"
            >
              {Object.values(NAMING_STYLES).map((style) => (
                <option key={style} value={style}>{style}</option>
              ))}
            </select>
            <Settings2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none group-hover:text-blue-600 transition-colors" />
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </FormInput>

        {/* Length Selector */}
        <FormInput label="Name Length" className="md:col-span-1">
          <div className="relative group">
            <select
              value={formState.length}
              onChange={(e) => setFormState(prev => ({ ...prev, length: e.target.value as NameLength }))}
              className="w-full h-11 bg-slate-50 border border-slate-200 text-slate-700 font-medium text-sm rounded-lg focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 block pl-10 pr-10 outline-none appearance-none cursor-pointer hover:border-slate-300 transition-colors"
            >
              {Object.values(NAME_LENGTHS).map((length) => (
                <option key={length} value={length}>{length}</option>
              ))}
            </select>
            <Type className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none group-hover:text-blue-600 transition-colors" />
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </FormInput>

        {/* Domain Toggle */}
        <FormInput label="Preferences" className="md:col-span-1">
          <label className="flex items-center justify-between w-full h-11 px-3 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer hover:border-slate-300 transition-all group box-border">
            <span className="text-sm font-medium text-slate-600 group-hover:text-blue-600 transition-colors select-none">
              Check Domains
            </span>
            
            <div className="relative">
              <input 
                type="checkbox" 
                className="sr-only"
                checked={formState.checkDomains}
                onChange={() => setFormState(prev => ({ ...prev, checkDomains: !prev.checkDomains }))}
              />
              <div className={`w-9 h-5 rounded-full transition-colors duration-300 ${formState.checkDomains ? 'bg-blue-600' : 'bg-slate-300'}`}></div>
              <div className={`absolute left-1 top-1 bg-white w-3 h-3 rounded-full shadow-sm transition-transform duration-300 ${formState.checkDomains ? 'translate-x-4' : ''}`}></div>
            </div>
          </label>
        </FormInput>
      </div>

      {/* Hero Input Bar */}
      <div className="bg-white p-2.5 rounded-2xl shadow-soft ring-1 ring-slate-100 hover:ring-blue-200 hover:shadow-glow transition-all duration-300 flex flex-col md:flex-row items-center gap-2 relative z-20">
        <div className="flex-1 w-full relative">
          <input
            type="text"
            value={formState.keywords}
            onChange={(e) => setFormState(prev => ({ ...prev, keywords: e.target.value }))}
            placeholder="Describe your project (e.g. coffee shop, tech startup)"
            className="w-full h-12 md:h-14 px-4 bg-transparent text-lg md:text-xl font-medium text-slate-800 placeholder:text-slate-400 outline-none"
            autoFocus
          />
        </div>
        
        <button
          type="submit"
          className="w-full md:w-auto px-8 h-12 md:h-14 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg shadow-lg shadow-blue-500/20 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 whitespace-nowrap"
        >
          <span>Generate</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>

      {/* Domain Check Info */}
      {formState.checkDomains && (
        <div className="text-center text-sm text-slate-500 -mt-4">
          💡 Domain checking uses WhoisXML API (100 free checks/month)
        </div>
      )}
    </form>
  );
}
