/**
 * API 客户端（单例、单 baseURL）
 * - 所有请求走 /api/v1/*，由 Next.js BFF 处理。
 * - Next.js 为主后端，需要 AI/LaTeX 等能力时内部直接请求 FastAPI，Caddy 不访问 FastAPI。
 * 实现按领域拆分为 lib/api/endpoints/*，此处聚合并保持原有导出。
 */

import { ApiClient as ApiClientClass } from './base';
import { createHealth } from './endpoints/health';
import { createCourses } from './endpoints/courses';
import { createLessons } from './endpoints/lessons';
import { createQuiz } from './endpoints/quiz';
import { createGrading } from './endpoints/grading';
import { createUsers } from './endpoints/users';
import { createLatex } from './endpoints/latex';
import { createAi } from './endpoints/ai';

export type { FetchOptions } from './base';
export { ApiClient } from './base';

const apiClient = new ApiClientClass('');
export { apiClient };

const health = createHealth(apiClient);
const courses = createCourses(apiClient);
const lessons = createLessons(apiClient);
const quiz = createQuiz(apiClient);
const grading = createGrading(apiClient);
const users = createUsers(apiClient);
const latex = createLatex(apiClient);
const ai = createAi(apiClient);

export const api = {
  health: health.health,
  courses,
  lessons,
  quiz,
  grading,
  users,
  latex,
  ai,
};
