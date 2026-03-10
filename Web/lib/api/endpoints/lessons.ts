import type { ApiClient } from '../base';
import type { Lesson, Question } from '@/lib/schemas';

export function createLessons(client: ApiClient) {
  return {
    get: (id: string) => client.get<Lesson>(`/api/v1/lessons/${id}`),
    getQuestions: (id: string) => client.get<Question[]>(`/api/v1/lessons/${id}/questions`),
  };
}
