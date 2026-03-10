'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import {
  LessonSchema,
  QuestionSchema,
  SubmissionSchema,
  CourseProgressSchema,
} from '@/lib/schemas';

export function useLesson(id: string) {
  return useQuery({
    queryKey: ['lesson', id],
    queryFn: async () => {
      const data = await api.lessons.get(id);
      return LessonSchema.parse(data);
    },
    enabled: !!id,
  });
}

export function useLessonQuestions(lessonId: string) {
  return useQuery({
    queryKey: ['lesson', lessonId, 'questions'],
    queryFn: async () => {
      const data = await api.lessons.getQuestions(lessonId);
      return data.map((item) => QuestionSchema.parse(item));
    },
    enabled: !!lessonId,
  });
}

export function useSubmitAnswer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      question_id: string;
      lesson_id: string;
      course_id: string;
      answer: Record<string, unknown>;
    }) => {
      const result = await api.quiz.submit(data);
      return SubmissionSchema.parse(result);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['lesson', variables.lesson_id, 'submissions'],
      });
      queryClient.invalidateQueries({
        queryKey: ['course', variables.course_id, 'progress'],
      });
    },
  });
}

export function useSubmitBatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      lesson_id: string;
      course_id: string;
      answers: Array<{ question_id: string; answer: Record<string, unknown> }>;
    }) => {
      const result = await api.quiz.submitBatch(data);
      return result.map((item) => SubmissionSchema.parse(item));
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['lesson', variables.lesson_id, 'submissions'],
      });
      queryClient.invalidateQueries({
        queryKey: ['course', variables.course_id, 'progress'],
      });
    },
  });
}

export function useMySubmissions(lessonId: string) {
  return useQuery({
    queryKey: ['lesson', lessonId, 'submissions'],
    queryFn: async () => {
      const data = await api.quiz.getMySubmissions(lessonId);
      return data.map((item) => SubmissionSchema.parse(item));
    },
    enabled: !!lessonId,
  });
}

export function useCourseProgress(courseId: string) {
  return useQuery({
    queryKey: ['course', courseId, 'progress'],
    queryFn: async () => {
      const data = await api.quiz.getProgress(courseId);
      return CourseProgressSchema.parse(data);
    },
    enabled: !!courseId,
  });
}
