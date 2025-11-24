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
    </header>
  );
}
