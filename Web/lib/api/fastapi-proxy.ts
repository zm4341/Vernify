/**
 * FastAPI 代理工具
 * Next.js 作为主后端，需要 AI/LaTeX 等能力时，内部直接请求 FastAPI，不经过 Caddy。
 */
const BACKEND_URL = process.env.AI_SERVICE_URL || 'http://backend:8000';

/** 将传入请求转发到 FastAPI 指定路径，返回 Response */
export async function proxyToFastAPI(
  backendPath: string,
  req: Request
): Promise<Response> {
  const search = new URL(req.url).search;
  const url = `${BACKEND_URL}${backendPath.startsWith('/') ? backendPath : `/${backendPath}`}${search}`;
  const headers = new Headers();
  let hasHeaders = false;
  ['content-type', 'authorization', 'cookie'].forEach((h) => {
    const v = req.headers.get(h);
    if (v) {
      headers.set(h, v);
      hasHeaders = true;
    }
  });
  const body = req.method !== 'GET' && req.method !== 'HEAD' ? await req.text() : undefined;
  const res = await fetch(url, {
    method: req.method,
    headers: hasHeaders ? headers : undefined,
    body,
  });
  return new Response(res.body, {
    status: res.status,
    statusText: res.statusText,
    headers: res.headers,
  });
}
