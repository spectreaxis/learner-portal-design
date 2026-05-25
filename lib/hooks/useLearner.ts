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
    onMutate: async ({ lessonId, completed }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['learner', 'progress'] });

      // Snapshot previous value
      const previous = queryClient.getQueryData(['learner', 'progress']);

      // Optimistically update cache
      queryClient.setQueryData(['learner', 'progress'], (old: any) => {
        if (!old) return old;

        const existingProgress = old.progress?.find((p: any) => p.lessonId === lessonId);

        if (existingProgress) {
          // Update existing
          return {
            ...old,
            progress: old.progress.map((p: any) =>
              p.lessonId === lessonId
                ? { ...p, completed, completedAt: new Date().toISOString() }
                : p
            )
          };
        } else {
          // Add new
          return {
            ...old,
            progress: [
              ...(old.progress || []),
              {
                lessonId,
                completed,
                completedAt: new Date().toISOString(),
                learnerId: old.id
              }
            ]
          };
        }
      });

      return { previous };
    },
    onError: (err, variables, context: any) => {
      // Rollback on error
      if (context?.previous) {
        queryClient.setQueryData(['learner', 'progress'], context.previous);
      }
    },
    onSettled: () => {
      // Refetch to ensure consistency
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
    onMutate: async ({ quizId }) => {
      await queryClient.cancelQueries({ queryKey: ['learner', 'progress'] });
      const previous = queryClient.getQueryData(['learner', 'progress']);

      // Optimistically add submission
      queryClient.setQueryData(['learner', 'progress'], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          quizSubmissions: [
            { quizId, submittedAt: new Date().toISOString(), pending: true },
            ...(old.quizSubmissions || [])
          ]
        };
      });

      return { previous };
    },
    onError: (err, variables, context: any) => {
      if (context?.previous) {
        queryClient.setQueryData(['learner', 'progress'], context.previous);
      }
    },
    onSuccess: (data) => {
      // Show certificate celebration if earned
      if (data.certificate) {
        console.log('🎉 Certificate earned!', data.certificate);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['learner', 'progress'] });
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ name, email }: { name: string; email: string }) => {
      const { data } = await apiClient.put('/learner/profile', { name, email });
      return data;
    },
    onSuccess: () => {
      // Invalidate progress to refresh user data everywhere
      queryClient.invalidateQueries({ queryKey: ['learner', 'progress'] });
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: async ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) => {
      const { data } = await apiClient.put('/learner/password', { currentPassword, newPassword });
      return data;
    },
  });
}

export function useCompleteActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ activityId, completed }: { activityId: string; completed: boolean }) => {
      const { data } = await apiClient.post('/learner/activities', { activityId, completed });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['learner', 'progress'] });
    },
  });
}
