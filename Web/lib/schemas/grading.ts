/**
 * 批改领域 schema
 */
import { z } from 'zod';
import { UUIDSchema, DateTimeSchema } from './base';

export const GradingStatusSchema = z.enum([
  'pending',
  'ai_graded',
  'human_reviewed',
  'disputed',
]);

export const GradingSchema = z.object({
  id: UUIDSchema,
  submission_id: UUIDSchema,
  ai_score: z.number().nullable().optional(),
  ai_feedback: z.string().nullable().optional(),
  ai_model: z.string().nullable().optional(),
  ai_confidence: z.number().nullable().optional(),
  ai_graded_at: DateTimeSchema.nullable().optional(),
  human_score: z.number().nullable().optional(),
  human_feedback: z.string().nullable().optional(),
  human_reviewer_id: UUIDSchema.nullable().optional(),
  human_reviewed_at: DateTimeSchema.nullable().optional(),
  final_score: z.number().nullable().optional(),
  status: GradingStatusSchema.default('pending'),
  created_at: DateTimeSchema,
  updated_at: DateTimeSchema.nullable().optional(),
});

export type Grading = z.infer<typeof GradingSchema>;

/** 批改统计（GET /api/v1/grading/stats/[courseId]） */
export interface GradingStats {
  course_id: string;
  total_submissions: number;
  pending: number;
  ai_graded: number;
  reviewed: number;
  disputed: number;
  graded?: number;
}
