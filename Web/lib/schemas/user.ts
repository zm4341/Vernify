/**
 * 用户领域 schema
 */
import { z } from 'zod';
import { UUIDSchema, DateTimeSchema } from './base';

export const UserRoleSchema = z.enum(['student', 'teacher', 'admin']);

export const UserSchema = z.object({
  id: UUIDSchema,
  email: z.string().email().optional(),
  username: z.string().nullable().optional(),
  display_name: z.string().nullable().optional(),
  avatar_url: z.string().url().nullable().optional(),
  role: UserRoleSchema.default('student'),
  grade: z.string().nullable().optional(),
  class_name: z.string().nullable().optional(),
  student_id: z.string().nullable().optional(),
  created_at: DateTimeSchema.optional(),
  updated_at: DateTimeSchema.optional(),
});

export type User = z.infer<typeof UserSchema>;
