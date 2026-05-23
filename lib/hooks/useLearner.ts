import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { apiClient } from '../api-client';

export function useLearnerProgress() {
  const { data: session, status } = useSession();

  return useQuery({
    queryKey: ['learner', 'progress'],
    queryFn: async () => {
      const { data } = await apiClient.get('/learner/progress');
      return data;
    },
    enabled: status === 'authenticated', // Only fetch when authenticated
  });
}

export function useUpdateProgress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ lessonId, completed }: { lessonId: string; completed: boolean }) => {
      const { data } = await apiClient.post('/learner/progress', { lessonId, completed });
      return data;
    },
    onSuccess: () => {
      // Invalidate progress queries to refresh UI
      queryClient.invalidateQueries({ queryKey: ['learner', 'progress'] });
    },
  });
}

export function useSubmitQuiz() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (submission: { quizId: string; answers: Record<string, string> }) => {
      const { data } = await apiClient.post('/learner/quizzes', submission);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['learner', 'progress'] });
    },
  });
}
