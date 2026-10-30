'use client';

import { Loader2, CheckCircle, Clock, XCircle } from 'lucide-react';
import type { CheckoutPhase } from '@/lib/hooks/usePayment';

interface PaymentModalProps {
  phase: CheckoutPhase;
  error: string | null;
  onRetry: () => void;
  onClose: () => void;
}

/**
 * Shows what happens after Paystack's checkout popup: confirming the payment
 * on the server, then success, failure or a slow confirmation
 */
export function PaymentModal({ phase, error, onRetry, onClose }: PaymentModalProps) {
  if (phase === 'idle' || phase === 'opening') return null;

  const content = {
    confirming: {
      icon: <Loader2 className="w-8 h-8 text-primary animate-spin" />,
      tint: 'bg-primary/10',
      title: 'Confirming your payment',
      message: 'This usually takes a few seconds.',
    },
    paid: {
      icon: <CheckCircle className="w-8 h-8 text-green-500" />,
      tint: 'bg-green-500/10',
      title: 'Payment confirmed',
      message: 'Your certificate is unlocked and ready to download.',
    },
    failed: {
      icon: <XCircle className="w-8 h-8 text-red-500" />,
      tint: 'bg-red-500/10',
      title: 'Payment not completed',
      message: error || 'The payment did not go through. Try again, or choose another payment method.',
    },
    delayed: {
      icon: <Clock className="w-8 h-8 text-amber-500" />,
      tint: 'bg-amber-500/10',
      title: 'Still waiting for confirmation',
      message:
        "Your payment provider hasn't confirmed yet. If you approved the payment, your certificate unlocks as soon as it does: check back in a few minutes.",
    },
  }[phase];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="payment-status-title"
      className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4"
    >
      <div className="bg-white/95 rounded-2xl shadow-2xl max-w-sm w-full border-2 border-primary/20 p-8 text-center">
        <div className={`w-16 h-16 rounded-full ${content.tint} flex items-center justify-center mx-auto mb-4`}>
          {content.icon}
        </div>
        <h2 id="payment-status-title" className="text-lg font-semibold text-foreground mb-2">
          {content.title}
        </h2>
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {content.message}
        </p>

        {phase === 'failed' && (
          <div className="mt-6 space-y-2">
            <button
              onClick={onRetry}
              className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-medium hover:bg-primary/90 transition-colors"
            >
              Try again
            </button>
            <button
              onClick={onClose}
              className="w-full py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Close
            </button>
          </div>
        )}

        {(phase === 'paid' || phase === 'delayed') && (
          <button
            onClick={onClose}
            className="mt-6 w-full bg-primary text-primary-foreground py-3 rounded-xl font-medium hover:bg-primary/90 transition-colors"
          >
            {phase === 'paid' ? 'View certificate' : 'Close'}
          </button>
        )}
      </div>
    </div>
  );
}
