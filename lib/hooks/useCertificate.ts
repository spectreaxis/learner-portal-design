import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api-client';

// Until it is paid for, a certificate carries the learner's current profile
// name; paying issues it, fixing the name and signing it
export type LearnerCertificate =
  | { certificateId: string; isIssued: false; recipientName: string }
  | {
      certificateId: string;
      isIssued: true;
      recipientName: string;
      securityCode: string;
      revision: number;
      nameCorrectionsLeft: number;
    };

/** Keyed on payment status, so it refetches (and the server issues it) once paid */
export function useLearnerCertificate(certificateId: string, isPaid: boolean | undefined) {
  return useQuery<LearnerCertificate>({
    queryKey: ['certificate', certificateId, isPaid],
    queryFn: async () => (await apiClient.get(`/learner/certificates/${certificateId}/details`)).data,
    enabled: !!certificateId && isPaid !== undefined,
  });
}

export function useCorrectCertificateName(certificateId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (correction: { name: string; reason: string }) => {
      const { data } = await apiClient.post(`/learner/certificates/${certificateId}/name-corrections`, correction);
      return data as LearnerCertificate;
    },
    onSuccess: (certificate) => {
      queryClient.setQueryData(['certificate', certificateId, true], certificate);
    },
  });
}
