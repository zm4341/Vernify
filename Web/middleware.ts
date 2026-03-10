import { updateSession } from '@/lib/supabase/middleware';
import { NextResponse, type NextRequest } from 'next/server';

const PUBLIC_PATHS = ['/', '/login', '/register', '/auth'];
const AUTH_PATHS = ['/login', '/register'];

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

function isAuthPath(pathname: string) {
  return AUTH_PATHS.some((p) => pathname === p);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 静态资源、API、_next 等跳过
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico'
  ) {
    try {
      const result = await updateSession(request);
      return result.response;
    } catch {
      return NextResponse.next({ request });
    }
  }

  let response: NextResponse;
  let hasSession = false;

  try {
    const result = await updateSession(request);
    response = result.response;
    hasSession = !!result.user;
  } catch {
    // Supabase 不可达时（如 Docker 未启动、网络问题），放行请求，由页面处理
    return NextResponse.next({ request });
  }

  // 未登录访问受保护路径 -> 重定向登录
  if (!hasSession && !isPublicPath(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  // 已登录访问登录/注册页 -> 重定向首页
  if (hasSession && isAuthPath(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
