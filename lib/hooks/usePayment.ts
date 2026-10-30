import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api-client';

export interface Price {
  amount: number;
  currency: string;
}

interface CertificatePayment {
  isPaid: boolean;
  price: Price;
  chargeCurrency: string;
}

export type CheckoutPhase = 'idle' | 'opening' | 'confirming' | 'paid' | 'failed' | 'delayed';

// M-Pesa gives the customer 180 seconds to approve, plus time for confirmation
const CONFIRM_WINDOW_MS = 4 * 60 * 1000;

export const formatPrice = ({ amount, currency }: Price) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);

export const useCertificatePayment = (certificateId: string) => {
  return useQuery<CertificatePayment>({
    queryKey: ['certificate-payment', certificateId],
    queryFn: async () => {
      const response = await apiClient.get(`/payments/certificates/${certificateId}`);
      return response.data;
    },
    enabled: !!certificateId,
  });
};

/**
 * Paystack checkout in an in-page popup. The server sets the amount and opens
 * the transaction; this only resumes it and then waits for the server to
 * confirm, since the popup's own success callback is not proof of payment.
 */
export const useCertificateCheckout = (certificateId: string) => {
  const queryClient = useQueryClient();
  const [phase, setPhase] = useState<CheckoutPhase>('idle');
  const [error, setError] = useState<string | null>(null);
  const [reference, setReference] = useState<string | null>(null);
  const [watchUntil, setWatchUntil] = useState(0);

  const { data: payment } = useQuery<{ status: 'PENDING' | 'SUCCEEDED' | 'FAILED' }>({
    queryKey: ['payment', reference],
    queryFn: async () => (await apiClient.get(`/payments/${reference}`)).data,
    enabled: !!reference && watchUntil > 0,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return (!status || status === 'PENDING') && Date.now() < watchUntil ? 5000 : false;
    },
  });

  useEffect(() => {
    if (payment?.status === 'SUCCEEDED') {
      setWatchUntil(0);
      setPhase('paid');
      queryClient.invalidateQueries({ queryKey: ['certificate-payment', certificateId] });
    } else if (payment?.status === 'FAILED') {
      setPhase((current) => (current === 'confirming' ? 'failed' : current));
    }
  }, [payment?.status, certificateId, queryClient]);

  // Stop waiting at the end of the window; a late confirmation still unlocks
  // the certificate the next time its page loads
  useEffect(() => {
    if (!watchUntil) return;
    const timer = setTimeout(() => {
      setPhase((current) => (current === 'confirming' ? 'delayed' : current));
    }, watchUntil - Date.now());
    return () => clearTimeout(timer);
  }, [watchUntil]);

  // Fetch the checkout script up front so the popup opens without a wait
  useEffect(() => {
    import('@paystack/inline-js');
  }, []);

  const watch = () => setWatchUntil(Date.now() + CONFIRM_WINDOW_MS);

  const pay = async () => {
    setPhase('opening');
    setError(null);
    try {
      const { data } = await apiClient.post(`/payments/certificates/${certificateId}`);
      const { default: PaystackPop } = await import('@paystack/inline-js');

      setReference(data.reference);
      new PaystackPop().resumeTransaction(data.accessCode, {
        onLoad: () => setPhase('idle'),
        onSuccess: () => {
          setPhase('confirming');
          watch();
        },
        // Closing the popup does not cancel an M-Pesa prompt already sent to
        // the phone, so keep watching quietly in case it is approved
        onCancel: () => {
          setPhase('idle');
          watch();
        },
        onError: (loadError) => {
          setError(loadError.message);
          setPhase('failed');
        },
      });
    } catch (requestError: any) {
      if (requestError.response?.status === 409) {
        queryClient.invalidateQueries({ queryKey: ['certificate-payment', certificateId] });
        setPhase('paid');
        return;
      }
      setError(requestError.response?.data?.error || 'Could not open checkout, please try again');
      setPhase('failed');
    }
  };

  const reset = () => {
    setPhase('idle');
    setError(null);
  };

  return { phase, error, pay, reset };
};
