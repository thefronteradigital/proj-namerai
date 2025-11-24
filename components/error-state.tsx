'use client';

import { AlertCircle } from 'lucide-react';

interface ErrorStateProps {
  message: string;
  title?: string;
  digest?: string;
  variant?: 'inline' | 'page';
  onRetry?: () => void;
  onBack?: () => void;
  showHelp?: boolean;
}

export function ErrorState({ 
  message, 
  title = 'Generation Failed',
  digest,
  variant = 'inline',
  onRetry, 
  onBack,
  showHelp = false
}: ErrorStateProps) {
  if (variant === 'page') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-rose-50 flex items-center justify-center">
            <AlertCircle className="w-10 h-10 text-rose-600" />
          </div>
          <div className="absolute inset-0 rounded-full border-4 border-rose-200 animate-pulse" />
        </div>

        <div className="text-center space-y-3 max-w-md">
          <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
          <p className="text-slate-600 leading-relaxed">{message}</p>
          {digest && (
            <p className="text-xs text-slate-400 font-mono">
              Error ID: {digest}
            </p>
          )}
        </div>

        {(onRetry || onBack) && (
          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            {onRetry && (
              <button
                onClick={onRetry}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all hover:shadow-lg"
              >
                Try Again
              </button>
            )}
            {onBack && (
              <button
                onClick={onBack}
                className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-semibold transition-colors"
              >
                Go Back
              </button>
            )}
          </div>
        )}

        {showHelp && (
          <div className="mt-8 p-4 bg-slate-50 rounded-lg border border-slate-200 max-w-md">
            <p className="text-xs text-slate-600 text-center">
              If this problem persists, please check your API configuration or contact support.
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-full p-8 bg-rose-50 border border-rose-100 rounded-2xl flex flex-col items-center text-center gap-4 animate-in slide-in-from-bottom-4">
      <div className="p-3 bg-white rounded-full shadow-sm">
        <AlertCircle className="w-8 h-8 text-rose-600" />
      </div>
      <div>
        <h3 className="text-lg font-bold text-rose-800 mb-2">{title}</h3>
        <p className="text-rose-600/90 max-w-md">{message}</p>
      </div>
      {(onRetry || onBack) && (
        <div className="flex gap-3 mt-2">
          {onRetry && (
            <button 
              onClick={onRetry}
              className="px-6 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold transition-colors"
            >
              Try Again
            </button>
          )}
          {onBack && (
            <button 
              onClick={onBack}
              className="px-6 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg font-semibold transition-colors"
            >
              Go Back
            </button>
          )}
        </div>
      )}
    </div>
  );
}
