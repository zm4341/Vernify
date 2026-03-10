/**
 * 课程 / 课时领域 schema
 */
import { z } from 'zod';
import { UUIDSchema, DateTimeSchema } from './base';

export const CourseStatusSchema = z.enum(['draft', 'published', 'archived']);

export const CourseSchema = z.object({
  id: UUIDSchema,
  title: z.string(),
  slug: z.string(),
  description: z.string().nullable().optional(),
  cover_image: z.string().nullable().optional(),
  status: CourseStatusSchema.default('draft'),
  metadata: z.record(z.string(), z.any()).nullable().optional(),
  created_at: DateTimeSchema,
  updated_at: DateTimeSchema,
  created_by: UUIDSchema.nullable().optional(),
});

export type Course = z.infer<typeof CourseSchema>;

export const LessonSchema = z.object({
  id: UUIDSchema,
  course_id: UUIDSchema,
  slug: z.string(),
  title: z.string(),
  description: z.string().nullable().optional(),
  content: z.record(z.string(), z.any()).nullable().optional(),
  content_source: z.string().nullable().optional(),
  duration: z.string().nullable().optional(),
  order_index: z.number().default(0),
  metadata: z.record(z.string(), z.any()).nullable().optional(),
  created_at: DateTimeSchema,
  updated_at: DateTimeSchema.nullable().optional(),
});

export type Lesson = z.infer<typeof LessonSchema>;

/** 课程题目列表项（含课时信息，GET /api/v1/courses/[id]/questions） */
export interface CourseQuestion {
  id: string;
  lesson_id: string;
  lesson_slug: string;
  lesson_title: string;
  lesson_order_index?: number;
  type: string;
  stem: string;
  options: string[];
  points: number;
  order_index: number;
  correctIndex: number;
  explanation: string;
}
