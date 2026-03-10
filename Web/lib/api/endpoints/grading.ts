import type { ApiClient } from '../base';
import type { Grading, GradingStats } from '@/lib/schemas';

export function createGrading(client: ApiClient) {
  return {
    getPending: (params?: { courseId?: string; limit?: number; offset?: number }) => {
      const query = new URLSearchParams();
      if (params?.courseId) query.set('course_id', params.courseId);
      if (params?.limit) query.set('limit', String(params.limit));
      if (params?.offset) query.set('offset', String(params.offset));
      return client.get<Grading[]>(`/api/v1/grading/pending?${query}`);
    },
    get: (id: string) => client.get<Grading>(`/api/v1/grading/${id}`),
    review: (
      id: string,
      data: { human_score: number; human_feedback?: string }
    ) => client.post<Grading>(`/api/v1/grading/${id}/review`, data),
    dispute: (id: string, reason: string) =>
      client.post<Grading>(`/api/v1/grading/${id}/dispute`, { reason }),
    getStats: (courseId: string) =>
      client.get<GradingStats>(`/api/v1/grading/stats/${courseId}`),
  };
}
