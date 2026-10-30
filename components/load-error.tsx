'use client';

import { AlertCircle, RotateCw } from 'lucide-react';
import { isAxiosError } from 'axios';

interface LoadErrorProps {
  error: unknown;
  onRetry: () => void;
  isRetrying?: boolean;
}

function describe(error: unknown) {
  if (isAxiosError(error) && error.response?.status === 429) {
    return 'Too many requests in a short time. Please wait a moment, then try again.';
  }
  return 'Check your connection and try again.';
}

/**
 * Shown in place of a page's content when its data failed to load, so a
 * failed request is never mistaken for a learner with no progress
 */
export function LoadError({ error, onRetry, isRetrying = false }: LoadErrorProps) {
  return (
    <div className="flex items-center justify-center py-24 px-6">
      <div role="alert" className="max-w-md w-full p-8 rounded-2xl bg-card border border-border shadow-sm text-center">
        <div className="w-14 h-14 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-7 h-7 text-destructive" />
        </div>
        <h2 className="text-lg font-semibold text-foreground mb-2">We couldn&apos;t load this page</h2>
        <p className="text-sm text-muted-foreground mb-6">{describe(error)}</p>
        <button
          onClick={onRetry}
          disabled={isRetrying}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50"
        >
          <RotateCw className={isRetrying ? 'w-4 h-4 animate-spin' : 'w-4 h-4'} />
          Try again
        </button>
      </div>
    </div>
  );
}
