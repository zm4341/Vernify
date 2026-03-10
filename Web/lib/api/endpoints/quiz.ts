import type { ApiClient } from '../base';
import type { Submission, CourseProgress } from '@/lib/schemas';
import type { SubmitAnswerInput, BatchSubmitInput } from '@/lib/schemas';

export function createQuiz(client: ApiClient) {
  return {
    submit: (data: SubmitAnswerInput) => client.post<Submission>('/api/v1/quiz/submit', data),
    submitBatch: (data: BatchSubmitInput) =>
      client.post<Submission[]>('/api/v1/quiz/submit-batch', data),
    getMySubmissions: (lessonId: string) =>
      client.get<Submission[]>(`/api/v1/quiz/my-submissions/${lessonId}`),
    getProgress: (courseId: string) =>
      client.get<CourseProgress>(`/api/v1/quiz/progress/${courseId}`),
  };
}
