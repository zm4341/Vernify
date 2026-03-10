import type { ApiClient } from '../base';

/** AI 接口暂无统一响应 schema，返回类型保留 unknown */
export function createAi(client: ApiClient) {
  return {
    grade: (data: {
      question_type: string;
      question_content: unknown;
      user_answer: unknown;
      correct_answer?: unknown;
      rubric?: unknown;
      max_points?: number;
    }) => client.post<unknown>('/api/v1/ai/grade', data),
    chat: (data: {
      messages: { role: string; content: string }[];
      system_prompt?: string;
      temperature?: number;
      max_tokens?: number;
      model?: string;
    }) => client.post<unknown>('/api/v1/ai/chat', data),
    getModels: () => client.get<unknown>('/api/v1/ai/models'),
    test: () => client.post<unknown>('/api/v1/ai/test'),
  };
}
