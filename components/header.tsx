'use client';

import Link from 'next/link';
import { ArrowRight, Hexagon } from 'lucide-react';

export function Header() {
  return (
    <header className="w-full h-16 bg-[#4338ca] text-white flex items-center justify-between px-6 md:px-10 shadow-md relative z-50">
      <Link href="/" className="flex items-center gap-2">
        <Hexagon className="w-6 h-6 fill-white/20 stroke-white stroke-2" />
        <span className="text-xl font-display font-bold tracking-tight">
          Namer.ai
        </span>
      </Link>

      <div className="flex items-center gap-3 sm:gap-4">
        <nav className="flex items-center gap-2 text-sm font-semibold text-indigo-100">
          <Link
            href="/saved"
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full hover:bg-indigo-500/30 hover:text-white transition-colors"
          >
            Saved
          </Link>
        </nav>
        <span className="h-5 w-px bg-indigo-300/60" aria-hidden="true" />
        <a
          href="https://frontera.my.id"
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-2 text-sm font-medium text-indigo-100 hover:text-white transition-colors"
        >
          <span className="hidden md:inline">by</span>
          <span>Frontera</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </a>
      </div>
    </header>
  );
}
