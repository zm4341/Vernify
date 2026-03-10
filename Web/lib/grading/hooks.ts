'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/client';

export function usePendingGradings(params?: {
  courseId?: string;
  limit?: number;
  offset?: number;
}) {
  return useQuery({
    queryKey: ['gradings', 'pending', params],
    queryFn: async () => api.grading.getPending(params),
  });
}

export function useReviewGrading() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: { human_score: number; human_feedback?: string };
    }) => api.grading.review(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gradings'] });
    },
  });
}

export function useGradingStats(courseId: string) {
  return useQuery({
    queryKey: ['grading', 'stats', courseId],
    queryFn: async () => api.grading.getStats(courseId),
    enabled: !!courseId,
  });
}
