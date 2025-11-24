'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ErrorState } from '@/components/error-state';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  const router = useRouter();

  useEffect(() => {
    console.error('Results page error:', error);
  }, [error]);

  const handleGoHome = () => {
    router.push('/');
  };

  return (
    <div className="flex-1 w-full max-w-5xl mx-auto px-4 md:px-6 pt-12 pb-24">
      <ErrorState
        variant="page"
        title="Something Went Wrong"
        message={error.message || 'An unexpected error occurred while generating names. Please try again.'}
        digest={error.digest}
        onRetry={reset}
        onBack={handleGoHome}
        showHelp
      />
    </div>
  );
}
