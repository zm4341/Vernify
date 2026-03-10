"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Circle, Mail, Lock, Loader2, Send } from "lucide-react";

const SEND_COOLDOWN_SEC = 60;

export default function RegisterPage() {
  const [step, setStep] = useState<"email" | "verify">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sendCooldown, setSendCooldown] = useState(0);
  const router = useRouter();

  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const { error: err } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    });
    setLoading(false);
    if (err) {
      setError(err.message.includes("already registered") ? "该邮箱已被注册" : err.message);
      return;
    }
    setStep("verify");
    setSendCooldown(SEND_COOLDOWN_SEC);
    const timer = setInterval(() => {
      setSendCooldown((s) => {
        if (s <= 1) {
          clearInterval(timer);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      setError("两次输入的密码不一致");
      return;
    }
    if (password.length < 6) {
      setError("密码至少需要 6 位");
      return;
    }
    if (!/^\d{6}$/.test(code)) {
      setError("请输入 6 位验证码");
      return;
    }
    setLoading(true);
    const REGISTER_TIMEOUT_MS = 15000;
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("请求超时，请检查网络后重试")), REGISTER_TIMEOUT_MS)
    );
    try {
      const supabase = createClient();
      const verifyPromise = supabase.auth.verifyOtp({
        email,
        token: code,
        type: "email",
      });
      const { error: verifyErr } = await Promise.race([verifyPromise, timeoutPromise]);
      if (verifyErr) {
        setError(verifyErr.message.includes("expired") ? "验证码已过期，请重新获取" : "验证码错误");
        return;
      }
      const updatePromise = supabase.auth.updateUser({ password });
      const { error: updateErr } = await Promise.race([updatePromise, timeoutPromise]);
      if (updateErr) {
        setError(updateErr.message);
        return;
      }
      router.push("/");
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "网络或服务异常，请重试";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  function handleBack() {
    setStep("email");
    setCode("");
    setError(null);
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
          <span className="text-white/90 font-semibold text-xl tracking-wide">Lattice</span>
        </Link>

        <div
          className="rounded-2xl p-8"
          style={{
            background: "rgba(255,255,255,0.03)",
            boxShadow: "0 0 0 1px rgba(255,255,255,0.05)",
          }}
        >
          <h1 className="text-2xl font-bold text-white mb-2">注册</h1>
          <p className="text-white/50 text-sm mb-6">
            {step === "email"
              ? "输入邮箱，获取验证码"
              : `验证码已发送至 ${email}，请查收`}
          </p>

          {step === "email" ? (
            <form onSubmit={handleSendCode} className="space-y-5">
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
                    发送中...
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    发送验证码
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="code" className="block text-sm font-medium text-white/70 mb-2">
                  验证码
                </label>
                <div className="flex gap-2">
                  <input
                    id="code"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                    required
                    autoComplete="one-time-code"
                    placeholder="6 位数字"
                    className="flex-1 pl-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 transition-all text-center text-lg tracking-[0.5em]"
                  />
                  <button
                    type="button"
                    disabled={sendCooldown > 0}
                    onClick={handleSendCode}
                    className="px-4 py-3 rounded-xl text-sm font-medium whitespace-nowrap transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      background: "rgba(255,255,255,0.08)",
                      color: sendCooldown > 0 ? "rgba(255,255,255,0.4)" : "rgb(167, 139, 250)",
                    }}
                  >
                    {sendCooldown > 0 ? `${sendCooldown}s 后重发` : "重新发送"}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-white/70 mb-2">
                  设置密码
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
                    autoComplete="new-password"
                    placeholder="至少 6 位"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 transition-all"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="confirm" className="block text-sm font-medium text-white/70 mb-2">
                  确认密码
                </label>
                <div className="relative">
                  <Lock
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30"
                  />
                  <input
                    id="confirm"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    placeholder="再次输入密码"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 transition-all"
                  />
                </div>
              </div>

              {error && (
                <div className="rounded-lg py-3 px-4 text-sm text-red-400 bg-red-500/10 border border-red-500/20">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex-1 py-3 px-4 rounded-xl font-semibold text-white/80 transition-all cursor-pointer hover:text-white"
                  style={{ background: "rgba(255,255,255,0.05)" }}
                >
                  返回修改邮箱
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 px-4 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed hover:opacity-90"
                  style={{
                    background: "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)",
                    boxShadow: "0 4px 20px rgba(124, 58, 237, 0.3)",
                  }}
                >
                  {loading ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      注册中...
                    </>
                  ) : (
                    "完成注册"
                  )}
                </button>
              </div>
            </form>
          )}

          <p className="mt-6 text-center text-white/50 text-sm">
            已有账号？{" "}
            <Link
              href="/login"
              className="text-purple-400 hover:text-purple-300 font-medium transition-colors cursor-pointer"
            >
              去登录
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
