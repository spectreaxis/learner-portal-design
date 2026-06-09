import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api-client';

interface InitiatePaymentParams {
  certificateId: string;
  phoneNumber: string;
}

interface PaymentStatus {
  paymentId: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  amount: number;
  mpesaReceipt?: string;
  transactionDate?: string;
  certificate: {
    id: string;
    certificateId: string;
    moduleName: string;
  };
}

interface CertificatePaymentStatus {
  isPaid: boolean;
  status?: string;
  amount?: number;
  mpesaReceipt?: string;
}

export const useInitiatePayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: InitiatePaymentParams) => {
      const response = await apiClient.post('/payment/initiate', params);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
    },
  });
};

export const usePaymentStatus = (checkoutRequestId: string | null, enabled = false) => {
  return useQuery<PaymentStatus>({
    queryKey: ['payment-status', checkoutRequestId],
    queryFn: async () => {
      const response = await apiClient.get(`/payment/status/${checkoutRequestId}`);
      return response.data.data;
    },
    enabled: enabled && !!checkoutRequestId,
    refetchInterval: (query) => {
      // Keep polling every 15 seconds while payment is pending (avoids rate limits)
      if (query.state.data?.status === 'PENDING') {
        return 15000;
      }
      return false;
    },
  });
};

export const useCertificatePaymentStatus = (certificateId: string) => {
  return useQuery<CertificatePaymentStatus>({
    queryKey: ['certificate-payment', certificateId],
    queryFn: async () => {
      const response = await apiClient.get(`/payment/certificate/${certificateId}`);
      return response.data.data;
    },
    enabled: !!certificateId,
  });
};
