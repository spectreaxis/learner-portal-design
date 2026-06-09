'use client';

import React, { useState, useEffect } from 'react';
import { X, CreditCard, Smartphone, Loader2, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { useInitiatePayment, usePaymentStatus } from '@/lib/hooks/usePayment';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  certificateId: string;
  moduleName: string;
  amount: number;
  onPaymentSuccess: () => void;
}

export function PaymentModal({
  isOpen,
  onClose,
  certificateId,
  moduleName,
  amount,
  onPaymentSuccess,
}: PaymentModalProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [checkoutRequestId, setCheckoutRequestId] = useState<string | null>(null);
  const [paymentStep, setPaymentStep] = useState<'form' | 'processing' | 'success' | 'failed'>('form');

  const initiatePayment = useInitiatePayment();
  const { data: paymentStatus } = usePaymentStatus(checkoutRequestId, paymentStep === 'processing');

  // Update payment step based on status
  useEffect(() => {
    if (paymentStatus) {
      if (paymentStatus.status === 'COMPLETED') {
        setPaymentStep('success');
        setTimeout(() => {
          onPaymentSuccess();
          onClose();
        }, 3000);
      } else if (paymentStatus.status === 'FAILED' || paymentStatus.status === 'CANCELLED') {
        setPaymentStep('failed');
      }
    }
  }, [paymentStatus, onPaymentSuccess, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!phoneNumber || phoneNumber.length < 10) {
      alert('Please enter a valid phone number');
      return;
    }

    try {
      const result = await initiatePayment.mutateAsync({
        certificateId,
        phoneNumber,
      });

      if (result.success) {
        setCheckoutRequestId(result.data.checkoutRequestId);
        setPaymentStep('processing');
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to initiate payment');
    }
  };

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digit characters
    const digits = value.replace(/\D/g, '');

    // Format as user types
    if (digits.length <= 4) {
      return digits;
    } else if (digits.length <= 7) {
      return `${digits.slice(0, 4)} ${digits.slice(4)}`;
    } else {
      return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7, 10)}`;
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhoneNumber(formatted);
  };

  const resetModal = () => {
    setPhoneNumber('');
    setCheckoutRequestId(null);
    setPaymentStep('form');
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-white/95 rounded-2xl shadow-2xl max-w-md w-full border-2 border-primary/20">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Certificate Payment</h2>
              <p className="text-sm text-muted-foreground">Pay via M-Pesa</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-muted-foreground hover:text-foreground transition-colors p-1"
            disabled={paymentStep === 'processing'}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {/* Payment Form */}
          {paymentStep === 'form' && (
            <>
              <div className="mb-6 p-5 rounded-xl bg-primary/5 border border-primary/10">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm text-muted-foreground">Certificate</span>
                  <span className="text-sm font-semibold text-foreground">{moduleName}</span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-primary/10">
                  <span className="text-sm text-muted-foreground">Amount to Pay</span>
                  <span className="text-2xl font-bold text-primary">KES {amount.toFixed(2)}</span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    M-Pesa Phone Number
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">+254</span>
                    </div>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={handlePhoneChange}
                      placeholder="7XX XXX XXX"
                      maxLength={12}
                      className="w-full pl-20 pr-4 py-3 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                      required
                    />
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Enter your M-Pesa registered phone number
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={initiatePayment.isPending || !phoneNumber}
                  className="w-full bg-primary text-primary-foreground py-3.5 px-6 rounded-xl font-semibold text-base hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                >
                  {initiatePayment.isPending ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Initiating Payment...
                    </>
                  ) : (
                    <>
                      Pay KES {amount.toFixed(2)} Now
                    </>
                  )}
                </button>
              </form>
            </>
          )}

          {/* Processing State */}
          {paymentStep === 'processing' && (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Waiting for Payment</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Please check your phone for the M-Pesa prompt and enter your PIN
              </p>
              <div className="p-4 rounded-xl bg-muted/50 text-left">
                <p className="text-xs text-muted-foreground mb-2">Payment Details:</p>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Amount</span>
                    <span className="font-medium text-foreground">KES {amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Phone</span>
                    <span className="font-medium text-foreground">+254{phoneNumber.replace(/\s/g, '')}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setPaymentStep('form')}
                className="mt-4 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel Payment
              </button>
            </div>
          )}

          {/* Success State */}
          {paymentStep === 'success' && (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Payment Successful!</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Your payment has been confirmed
              </p>
              {paymentStatus?.mpesaReceipt && (
                <div className="p-4 rounded-xl bg-muted/50">
                  <p className="text-xs text-muted-foreground mb-1">M-Pesa Receipt</p>
                  <p className="text-sm font-medium text-foreground font-mono">
                    {paymentStatus.mpesaReceipt}
                  </p>
                </div>
              )}
              <p className="mt-4 text-xs text-muted-foreground">
                Redirecting to download...
              </p>
            </div>
          )}

          {/* Failed State */}
          {paymentStep === 'failed' && (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                <XCircle className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Payment Failed</h3>
              <p className="text-sm text-muted-foreground mb-6">
                {paymentStatus?.status === 'CANCELLED'
                  ? 'You cancelled the payment'
                  : 'The payment could not be processed'}
              </p>
              <button
                onClick={resetModal}
                className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-medium hover:bg-primary/90 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
