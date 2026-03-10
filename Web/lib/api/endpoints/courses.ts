import type { ApiClient } from '../base';
import type { Course, Lesson, CourseQuestion } from '@/lib/schemas';

export function createCourses(client: ApiClient) {
  return {
    list: () => client.get<Course[]>('/api/v1/courses'),
    get: (id: string) => client.get<Course>(`/api/v1/courses/${id}`),
    getLessons: (id: string) => client.get<Lesson[]>(`/api/v1/courses/${id}/lessons`),
    getQuestions: (id: string) => client.get<CourseQuestion[]>(`/api/v1/courses/${id}/questions`),
  };
}
