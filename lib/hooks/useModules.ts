import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api-client';
import type { Module } from '@/lib/types';

export function useModules() {
  return useQuery({
    queryKey: ['modules'],
    queryFn: async () => {
      const { data } = await apiClient.get<Module[]>('/modules');
      return data;
    },
    staleTime: 5 * 60 * 1000, // Course data changes rarely
  });
}

export function useModule(moduleId: string) {
  return useQuery({
    queryKey: ['modules', moduleId],
    queryFn: async () => {
      const { data } = await apiClient.get<Module>(`/modules/${moduleId}`);
      return data;
    },
    enabled: !!moduleId,
  });
}

export function useLesson(moduleId: string, lessonId: string) {
  return useQuery({
    queryKey: ['lessons', moduleId, lessonId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/modules/${moduleId}/lessons/${lessonId}`);
      return data;
    },
    enabled: !!moduleId && !!lessonId,
  });
}
