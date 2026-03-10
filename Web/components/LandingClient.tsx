"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { ReactNode } from "react";
import {
  Sparkles,
  BookOpen,
  GraduationCap,
  Layers,
  Circle,
  LogIn,
  UserPlus,
} from "lucide-react";
import { LandingLink } from "./landing/LandingLink";

/** 落地页结构：Hero → Problem → Solution/Features → Climax CTA（ui-ux-pro-max） */
const FEATURES = [
  { value: "3", label: "学科", icon: Layers },
  { value: "4+", label: "年级可选", icon: GraduationCap },
  { value: "—", label: "互动学习", icon: BookOpen },
] as const;

export interface LandingClientProps {
  /** MDX 渲染的内容（由 app/page.tsx 传入） */
  heroSubtitle?: ReactNode;
  heroDesc?: ReactNode;
  problemTitle?: ReactNode;
  problemDesc?: ReactNode;
  featuresTitle?: ReactNode;
  featureDescs?: readonly [ReactNode, ReactNode, ReactNode];
}

/** 默认文案（无 MDX 时回退） */
const defaults = {
  heroSubtitle: "语文 · 数学 · 英语 · 多学科学习",
  heroDesc: (
    <>
      从<span className="text-purple-400">四年级</span>到
      <span className="text-blue-400">高三</span>，按学科与年级自由选择
      <br />
      动画演示、<span className="text-pink-400">交互练习</span>与学习进度，助你系统提升
    </>
  ),
  problemTitle: "学习枯燥？进度跟不上？",
  problemDesc: "传统刷题难以理解，知识点分散难串联。Lattice 用动画与交互，让抽象概念看得见。",
  featuresTitle: "多学科 · 多年级 · 系统学习",
  featureDescs: ["语文 数学 英语", "小四至高三", "视频与练习"] as const,
};

/**
 * LandingClient - 公开落地页
 * 未登录用户访问主页时显示，介绍 Lattice 学习方案与登录/注册入口
 * Hero / Problem / Features 文案支持 MDX 渲染的富文本
 */
export default function LandingClient({
  heroSubtitle,
  heroDesc,
  problemTitle,
  problemDesc,
  featuresTitle,
  featureDescs,
}: LandingClientProps) {
  const sub = heroSubtitle ?? defaults.heroSubtitle;
  const desc = heroDesc ?? defaults.heroDesc;
  const pTitle = problemTitle ?? defaults.problemTitle;
  const pDesc = problemDesc ?? defaults.problemDesc;
  const fTitle = featuresTitle ?? defaults.featuresTitle;
  const fDescs = featureDescs ?? defaults.featureDescs;

  return (
    <main
      className="min-h-screen relative overflow-hidden font-sans"
      style={{
        background:
          "linear-gradient(135deg, #0c0118 0%, #1a0a2e 25%, #16082a 50%, #0d0619 100%)",
      }}
    >
      {/* 背景装饰 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden>
        <div
          className="absolute w-[800px] h-[800px] rounded-full blur-[120px] opacity-30 -top-[20%] -left-[10%]"
          style={{
            background: "radial-gradient(circle, #7c3aed 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute w-[600px] h-[600px] rounded-full blur-[100px] opacity-20 bottom-[10%] -right-[5%]"
          style={{
            background: "radial-gradient(circle, #3b82f6 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      {/* 顶部导航 */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 px-4 py-4 sm:px-6 sm:py-5"
        aria-label="主导航"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-3 cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-transparent rounded-lg transition-shadow duration-200"
            aria-label="Lattice 首页"
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                background: "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)",
                boxShadow: "0 4px 20px rgba(124, 58, 237, 0.4)",
              }}
            >
              <Circle size={18} className="text-white" strokeWidth={3} aria-hidden />
            </div>
            <span className="text-white/90 font-semibold text-lg tracking-wide">
              Lattice
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/admin"
              className="px-3 py-2 rounded-full text-sm font-medium text-white/70 hover:text-white transition-colors"
              style={{ background: "rgba(255,255,255,0.06)" }}
            >
              超级管理员
            </Link>
            <LandingLink href="/login" variant="ghost" size="nav" icon={LogIn} ariaLabel="登录">
              登录
            </LandingLink>
            <LandingLink href="/register" variant="primary" size="nav" icon={UserPlus} ariaLabel="注册">
              注册
            </LandingLink>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-8 pt-28 sm:pt-32 pb-24 relative z-10">
        {/* 1. Hero Section */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20 sm:mb-24"
          aria-labelledby="hero-title"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 sm:mb-8 bg-purple-500/15"
          >
            <Sparkles size={14} className="text-purple-400" aria-hidden />
            <span className="text-purple-300 text-sm font-medium">{sub}</span>
          </motion.div>

          <motion.h1
            id="hero-title"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-5xl sm:text-6xl md:text-7xl font-bold mb-6 sm:mb-8 tracking-tight"
            style={{
              background: "linear-gradient(135deg, #ffffff 0%, #c4b5fd 50%, #a78bfa 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Lattice 学习方案
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-base sm:text-lg md:text-xl text-white/50 mb-10 sm:mb-12 max-w-2xl mx-auto leading-relaxed"
          >
            {desc}
          </motion.div>
        </motion.section>

        {/* 2. Problem Statement */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mb-16 sm:mb-20"
          aria-labelledby="problem-title"
        >
          <h2
            id="problem-title"
            className="text-xl sm:text-2xl text-white/60 font-medium mb-3"
          >
            {pTitle}
          </h2>
          <div className="text-white/40 text-sm sm:text-base max-w-xl mx-auto">
            {pDesc}
          </div>
        </motion.section>

        {/* 3. Solution / Features */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mb-16 sm:mb-20"
          aria-labelledby="features-title"
        >
          <h2
            id="features-title"
            className="text-center text-lg sm:text-xl text-white/50 font-medium mb-10"
          >
            {fTitle}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-12">
            {FEATURES.map(({ value, label, icon: Icon }, i) => (
              <div
                key={label}
                className="text-center p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.1] transition-colors duration-200"
              >
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Icon size={20} className="text-white/30" aria-hidden />
                  <span className="text-3xl font-bold text-white">{value}</span>
                </div>
                <span className="text-sm text-white/40 block">{label}</span>
                <div className="text-xs text-white/30 mt-1">{fDescs[i]}</div>
              </div>
            ))}
          </div>
        </motion.section>

      </div>

      <footer className="relative z-10 py-12 text-center" role="contentinfo">
        <div className="flex items-center justify-center gap-2 text-white/30 text-sm">
          <Circle size={16} aria-hidden />
          <span>Lattice Learning System</span>
        </div>
      </footer>
    </main>
  );
}
