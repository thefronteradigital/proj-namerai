import type { Metadata } from 'next';
import Link from 'next/link';
import { Home, Sparkles } from 'lucide-react';
import { BackButton } from '@/components/back-button';

export const metadata: Metadata = {
  title: 'Page Not Found',
  description: 'The page you are looking for does not exist or has been moved. Return to Namer.ai to generate creative brand names.',
  robots: {
    index: false,
    follow: true,
  },
};

export default function NotFound() {
  return (
    <div className="flex-1 w-full max-w-5xl mx-auto px-4 md:px-6 flex flex-col justify-center items-center pb-32 pt-20">
      {/* Overlay to reduce background distraction */}
      <div className="fixed inset-0 bg-white/40 backdrop-blur-[2px] pointer-events-none -z-10" />
      
      <div className="w-full max-w-2xl flex flex-col items-center text-center animate-in fade-in zoom-in duration-500 relative z-10">
        {/* 404 Icon */}
        <div className="relative mb-8">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center">
            <Sparkles className="w-12 h-12 text-slate-400" />
          </div>
          <div className="absolute inset-0 rounded-full bg-blue-100 animate-ping opacity-20" />
        </div>

        {/* Error Message */}
        <div className="mb-8">
          <h1 className="text-6xl md:text-7xl font-display font-extrabold text-slate-900 tracking-tight mb-4">
            404
          </h1>
          <h2 className="text-2xl md:text-3xl font-display font-bold text-slate-800 mb-3">
            Page Not Found
          </h2>
          <p className="text-slate-600 text-base md:text-lg max-w-md leading-relaxed">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Link
            href="/"
            className="group inline-flex items-center justify-center gap-2 px-8 h-14 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg shadow-lg shadow-blue-500/20 transition-all transform active:scale-[0.98]"
          >
            <Home className="w-5 h-5" />
            <span>Go Home</span>
          </Link>
          
          <BackButton />
        </div>

        {/* Helper Text */}
        <div className="mt-12 p-4 bg-slate-50 rounded-lg border border-slate-200 max-w-md">
          <p className="text-xs text-slate-600 text-center">
            Need help? Try generating a brand name from the homepage.
          </p>
        </div>
      </div>
    </div>
  );
}
