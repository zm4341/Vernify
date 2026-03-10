/**
 * Supabase 客户端配置
 * 用于浏览器端
 * - npm dev (port 3000): Supabase 在 38080/54321，必须用 env 中的 URL
 * - Docker (port 38080): 用当前 origin，避免 127.0.0.1 与 localhost Cookie 不同步
 */
import { createBrowserClient } from '@supabase/ssr';

function getSupabaseUrl() {
  if (typeof window === 'undefined') {
    return process.env.NEXT_PUBLIC_SUPABASE_URL!;
  }
  // 开发时 app 在 3000，Supabase 在 38080，需使用 env 指向的地址
  if (window.location.port === '3000') {
    return process.env.NEXT_PUBLIC_SUPABASE_URL!;
  }
  return window.location.origin;
}

const AUTH_COOKIE_NAME = 'sb-vernify-auth-token';

export function createClient() {
  return createBrowserClient(
    getSupabaseUrl(),
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: { name: AUTH_COOKIE_NAME },
    }
  );
}
