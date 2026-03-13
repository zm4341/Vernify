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
          // 仅当 cookie 实际变化时才写回响应，避免每次请求都 Set-Cookie 导致 Next.js 触发整页重载
          // 注意：不能比较数组长度，因为 current 包含浏览器所有 cookie，cookiesToSet 只含认证 cookie
          const same = cookiesToSet.every(
            (c) => request.cookies.get(c.name)?.value === c.value
          );
          if (same) return;

          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          // /admin 路径不写回 Set-Cookie，避免 Next.js 整页重载
          if (request.nextUrl.pathname.startsWith('/admin')) return;

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
