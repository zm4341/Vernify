/**
 * Supabase 服务端客户端配置
 * 用于 API Routes 和 Server Components
 * 在 Docker 中需设置 SUPABASE_SERVER_URL 为内部地址（如 http://caddy:38080）
 */
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

const SUPABASE_URL =
  process.env.SUPABASE_SERVER_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!;
const AUTH_COOKIE_NAME = 'sb-vernify-auth-token';

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: { name: AUTH_COOKIE_NAME },
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Component 中无法设置 cookie，忽略错误
          }
        },
      },
    }
  );
}

/**
 * 创建服务端管理员客户端（使用 service_role key）
 * 用于需要绕过 RLS 的操作
 */
export function createAdminClient() {
  return createServerClient(
    SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() { return []; },
        setAll() {},
      },
    }
  );
}
