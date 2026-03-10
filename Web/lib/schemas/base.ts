/**
 * 基础 Zod 类型，供各领域 schema 复用
 */
import { z } from 'zod';

export const UUIDSchema = z.string().uuid();
export const DateTimeSchema = z.string().datetime({ offset: true });

export const ApiErrorSchema = z.object({
  detail: z.string(),
});
export type ApiError = z.infer<typeof ApiErrorSchema>;
