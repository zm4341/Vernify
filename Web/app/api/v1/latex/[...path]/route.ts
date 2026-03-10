/**
 * LaTeX 能力代理
 * 浏览器请求 /api/v1/latex/* → Next.js BFF → 内部转发至 FastAPI，Caddy 不访问 FastAPI。
 */
import { proxyToFastAPI } from '@/lib/api/fastapi-proxy';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const backendPath = `/api/v1/latex/${path?.join('/') ?? ''}`;
  return proxyToFastAPI(backendPath, req);
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const backendPath = `/api/v1/latex/${path?.join('/') ?? ''}`;
  return proxyToFastAPI(backendPath, req);
}
