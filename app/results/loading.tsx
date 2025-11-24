import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="flex-1 w-full max-w-5xl mx-auto px-4 md:px-6 pt-12 pb-24">
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <div className="relative">
          <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
          <div className="absolute inset-0 rounded-full bg-blue-100 animate-ping opacity-20" />
        </div>
        
        <div className="text-center space-y-2">
          <h2 className="text-xl font-bold text-slate-800">
            Generating Names
          </h2>
          <p className="text-sm text-slate-500 max-w-md">
            Our AI is crafting unique project names for you. This may take a few moments...
          </p>
        </div>

        <div className="flex gap-2 mt-4">
          <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce [animation-delay:-0.3s]" />
          <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce [animation-delay:-0.15s]" />
          <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" />
        </div>
      </div>
    </div>
  );
}
