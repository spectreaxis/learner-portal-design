'use client';

import { useEffect, useState } from 'react';
import { Check, Share2 } from 'lucide-react';

interface ShareCertificateButtonProps {
  verifyUrl: string;
  title: string;
}

type ShareStatus = 'idle' | 'copied' | 'failed';

/**
 * Shares the certificate's public verification link: the device's share sheet
 * where there is one (mostly phones), otherwise the link is copied
 */
export function ShareCertificateButton({ verifyUrl, title }: ShareCertificateButtonProps) {
  const [status, setStatus] = useState<ShareStatus>('idle');

  useEffect(() => {
    if (status === 'idle') return;
    const timer = setTimeout(() => setStatus('idle'), 2500);
    return () => clearTimeout(timer);
  }, [status]);

  const share = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, url: verifyUrl });
        return;
      } catch (error) {
        // Closing the share sheet is not a failure
        if ((error as DOMException).name === 'AbortError') return;
      }
    }
    try {
      await navigator.clipboard.writeText(verifyUrl);
      setStatus('copied');
    } catch {
      setStatus('failed');
    }
  };

  return (
    <button
      onClick={share}
      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-card border border-border text-foreground text-sm font-medium hover:bg-muted transition-colors shadow-sm"
    >
      {status === 'copied' ? <Check className="w-4 h-4 text-success" /> : <Share2 className="w-4 h-4" />}
      <span aria-live="polite">
        {status === 'copied' ? 'Link copied' : status === 'failed' ? "Couldn't copy link" : 'Share'}
      </span>
    </button>
  );
}
