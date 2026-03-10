/**
 * 题目 / 答题 / 进度领域 schema
 */
import { z } from 'zod';
import { UUIDSchema, DateTimeSchema } from './base';

export const QuestionTypeSchema = z.enum([
  'choice',
  'multi_choice',
  'fill_blank',
  'drawing',
  'essay',
  'geogebra',
]);

export const QuestionSchema = z.object({
  id: UUIDSchema,
  lesson_id: UUIDSchema,
  type: QuestionTypeSchema,
  content: z.record(z.string(), z.any()),
  answer: z.record(z.string(), z.any()).nullable().optional(),
  rubric: z.record(z.string(), z.any()).nullable().optional(),
  points: z.number().default(0),
  order_index: z.number().default(0),
  metadata: z.record(z.string(), z.any()).nullable().optional(),
  created_at: DateTimeSchema,
});

export type Question = z.infer<typeof QuestionSchema>;

export const SubmissionSchema = z.object({
  id: UUIDSchema,
  user_id: UUIDSchema,
  question_id: UUIDSchema,
  lesson_id: UUIDSchema,
  course_id: UUIDSchema,
  answer: z.record(z.string(), z.any()),
  is_correct: z.boolean().nullable().optional(),
  submitted_at: DateTimeSchema,
});

export type Submission = z.infer<typeof SubmissionSchema>;

export const ProgressSchema = z.object({
  id: UUIDSchema,
  user_id: UUIDSchema,
  lesson_id: UUIDSchema,
  course_id: UUIDSchema,
  completed: z.boolean().default(false),
  score: z.number().nullable().optional(),
  time_spent: z.number().default(0),
  started_at: DateTimeSchema,
  completed_at: DateTimeSchema.nullable().optional(),
  last_accessed_at: DateTimeSchema,
});

export type Progress = z.infer<typeof ProgressSchema>;

export const CourseProgressSchema = z.object({
  total_lessons: z.number(),
  completed_lessons: z.number(),
  progress_percentage: z.number(),
  lessons: z.array(ProgressSchema),
});

export type CourseProgress = z.infer<typeof CourseProgressSchema>;

export const SubmitAnswerSchema = z.object({
  question_id: UUIDSchema,
  lesson_id: UUIDSchema,
  course_id: UUIDSchema,
  answer: z.record(z.string(), z.any()),
});

export type SubmitAnswerInput = z.infer<typeof SubmitAnswerSchema>;

export const BatchSubmitSchema = z.object({
  lesson_id: UUIDSchema,
  course_id: UUIDSchema,
  answers: z.array(
    z.object({
      question_id: UUIDSchema,
      answer: z.record(z.string(), z.any()),
    })
  ),
});

export type BatchSubmitInput = z.infer<typeof BatchSubmitSchema>;
