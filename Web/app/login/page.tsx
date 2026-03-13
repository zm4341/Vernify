"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Circle, Mail, Lock, Loader2 } from "lucide-react";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  // 默认跳转到挑选课程页，可浏览并选择课程
  const next = searchParams.get("next") ?? "/courses";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const LOGIN_TIMEOUT_MS = 12_000;
    try {
      const supabase = createClient();
      const loginPromise = supabase.auth.signInWithPassword({ email, password });
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("登录超时，请重试或刷新页面")), LOGIN_TIMEOUT_MS)
      );
      const { data: loginData, error: err } = await Promise.race([loginPromise, timeoutPromise]);
      if (err) {
        setError(err.message.includes("Invalid login credentials") ? "邮箱或密码错误" : err.message);
        return;
      }
      // 短暂延迟后整页跳转，确保 Supabase 已将 session 写入 cookie，服务端才能读到
      await new Promise((r) => setTimeout(r, 300));
      // 按角色决定跳转：超级管理员 → /admin，否则使用 next（默认 /courses）
      const userId = loginData?.user?.id;
      let redirectTo = next;
      if (userId) {
        const { data: profile } = await supabase.from("profiles").select("role").eq("id", userId).single();
        if (profile?.role === "admin") redirectTo = "/admin";
      }
      window.location.href = redirectTo;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "网络或服务异常，请重试";
      const isNetworkError =
        msg === "Failed to fetch" ||
        msg.includes("NetworkError") ||
        msg.includes("load failed");
      setError(
        isNetworkError
          ? "无法连接认证服务，请确认 Supabase 已启动（Docker 或 supabase start），且 NEXT_PUBLIC_SUPABASE_URL 与访问地址同源"
          : msg
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
      style={{
        fontFamily: "'LXGW WenKai', sans-serif",
        background: "linear-gradient(135deg, #0c0118 0%, #1a0a2e 25%, #16082a 50%, #0d0619 100%)",
      }}
    >
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute w-[600px] h-[600px] rounded-full blur-[120px] opacity-20"
          style={{
            background: "radial-gradient(circle, #7c3aed 0%, transparent 70%)",
            top: "-10%",
            left: "20%",
          }}
        />
      </div>

      <div className="w-full max-w-md relative z-10">
        <Link
          href="/"
          className="flex items-center justify-center gap-3 mb-10 rounded-lg transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-transparent"
          aria-label="返回首页"
        >
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{
              background: "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)",
              boxShadow: "0 4px 20px rgba(124, 58, 237, 0.4)",
            }}
          >
            <Circle size={24} className="text-white" strokeWidth={3} />
          </div>
          <span className="text-white/90 font-semibold text-xl tracking-wide">Vernify</span>
        </Link>

        <div
          className="rounded-2xl p-8"
          style={{
            background: "rgba(255,255,255,0.03)",
            boxShadow: "0 0 0 1px rgba(255,255,255,0.05)",
          }}
        >
          <h1 className="text-2xl font-bold text-white mb-2">登录</h1>
          <p className="text-white/50 text-sm mb-6">使用邮箱和密码登录</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white/70 mb-2">
                邮箱
              </label>
              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30"
                />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 transition-all"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white/70 mb-2">
                密码
              </label>
              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30"
                />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 transition-all"
                />
              </div>
            </div>

            {error && (
              <div className="rounded-lg py-3 px-4 text-sm text-red-400 bg-red-500/10 border border-red-500/20">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed hover:opacity-90"
              style={{
                background: "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)",
                boxShadow: "0 4px 20px rgba(124, 58, 237, 0.3)",
              }}
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  登录中...
                </>
              ) : (
                "登录"
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-white/50 text-sm">
            还没有账号？{" "}
            <Link
              href="/register"
              className="text-purple-400 hover:text-purple-300 font-medium transition-colors cursor-pointer"
            >
              立即注册
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <main
        className="min-h-screen flex items-center justify-center"
        style={{ background: "linear-gradient(135deg, #0c0118 0%, #1a0a2e 50%, #0d0619 100%)" }}
      >
        <Loader2 size={32} className="text-purple-400 animate-spin" />
      </main>
    }>
      <LoginForm />
    </Suspense>
  );
}
