'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { CourseSchema, LessonSchema } from '@/lib/schemas';
import type { Course, Lesson, CourseQuestion } from '@/lib/schemas';

export type { CourseQuestion };

export function useCourses() {
  return useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      const data = await api.courses.list();
      return data.map((item) => CourseSchema.parse(item));
    },
  });
}

export function useCourse(id: string) {
  return useQuery({
    queryKey: ['course', id],
    queryFn: async () => {
      const data = await api.courses.get(id);
      return CourseSchema.parse(data);
    },
    enabled: !!id,
  });
}

export function useCourseLessons(courseId: string) {
  return useQuery({
    queryKey: ['course', courseId, 'lessons'],
    queryFn: async () => {
      const data = await api.courses.getLessons(courseId);
      return data.map((item) => LessonSchema.parse(item));
    },
    enabled: !!courseId,
  });
}

export function useCourseQuestions(courseId: string) {
  return useQuery({
    queryKey: ['course', courseId, 'questions'],
    queryFn: async () => api.courses.getQuestions(courseId),
    enabled: !!courseId,
  });
}
