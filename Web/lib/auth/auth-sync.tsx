'use client';

import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from './store';

/**
 * 将 Supabase Auth 状态同步到 Zustand auth store
 * 需在 Providers 内使用（浏览器环境）
 *
 * 说明：若通过 127.0.0.1 访问首页/登录/注册，会做一次重定向到 localhost（避免 Cookie 等差异），
 * 会带来一次整页刷新；建议统一用 localhost 访问以减少刷新感。
 */
export function AuthSync({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
    const isEntryPath = pathname === '/' || pathname === '/login' || pathname === '/register';
    if (typeof window !== 'undefined' && window.location.hostname === '127.0.0.1' && isEntryPath) {
      const target = `http://localhost:${window.location.port || '38080'}${window.location.pathname}${window.location.search}`;
      window.location.replace(target);
      return;
    }

    const supabase = createClient();
    const { setAuth, clearAuth, setLoading } = useAuthStore.getState();

    async function sync() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setAuth(null, null);
        return;
      }
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, grade, subjects, display_name, avatar_url')
        .eq('id', user.id)
        .single();
      setAuth(user, profile ?? null);
    }

    sync();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        clearAuth();
        return;
      }
      if (session?.user) {
        void sync();
      } else {
        setAuth(null, null);
      }
    });

    return () => {
      subscription.unsubscribe();
      /* 不再在卸载时 setLoading(true)，避免导航或重挂载时出现短暂 loading 闪烁 */
    };
  }, []);

  return <>{children}</>;
}
