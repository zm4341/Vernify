/**
 * Supabase 中间件配置
 * 用于刷新 session
 * 在 Docker 中需设置 SUPABASE_SERVER_URL 为内部地址（如 http://caddy:38080）
 * cookieOptions.name 必须与 client.ts 一致，否则浏览器写入的 cookie 与中间件读取的 cookie 名称不匹配
 */
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const SUPABASE_URL =
  process.env.SUPABASE_SERVER_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!;
const AUTH_COOKIE_NAME = 'sb-vernify-auth-token';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: { name: AUTH_COOKIE_NAME },
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // 刷新 session 并获取当前用户
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { response: supabaseResponse, user };
}
