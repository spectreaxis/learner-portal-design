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
