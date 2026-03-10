/**
 * 流式对话 API（Vercel AI SDK）
 * POST /api/chat - 接收 useChat 的 messages，经 FastAPI 扩展服务（LiteLLM）流式返回
 */
import { streamText, convertToModelMessages, type UIMessage } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://backend:8000';
const AI_CHAT_MODEL = process.env.AI_CHAT_MODEL || 'gemini/gemini-3-pro-preview';

const litellm = createOpenAI({
  baseURL: `${AI_SERVICE_URL}/api/v1/ai`,
  apiKey: process.env.AI_SERVICE_API_KEY ?? 'not-needed',
});

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();
  const result = streamText({
    model: litellm(AI_CHAT_MODEL),
    messages: await convertToModelMessages(messages),
  });
  return result.toUIMessageStreamResponse();
}
