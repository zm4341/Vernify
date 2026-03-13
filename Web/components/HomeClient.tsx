"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Lesson } from '@/lib/content';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/lib/stores';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Circle, GraduationCap, LogOut, Sparkles } from 'lucide-react';
import { useRef } from 'react';

/**
 * HomeClient - 深邃星空主题（已登录首页）
 *
 * 设计风格: 简约、高级、沉浸式
 * 配色: 深紫渐变 + 柔和发光
 * 中间为简洁欢迎 +「去选课」入口，不展示具体课程/课时列表。
 */
export default function HomeClient({ lessons }: { lessons?: Lesson[] }) {
    const containerRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    async function handleLogout() {
        const supabase = createClient();
        await supabase.auth.signOut();
        useAuthStore.getState().clearAuth();
        router.push('/login');
        router.refresh();
    }
    const { scrollY } = useScroll();
    const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);
    const heroScale = useTransform(scrollY, [0, 400], [1, 0.95]);

    return (
        <main 
            className="min-h-screen relative overflow-hidden" 
            style={{ 
                fontFamily: "'LXGW WenKai', sans-serif",
                background: 'linear-gradient(135deg, #0c0118 0%, #1a0a2e 25%, #16082a 50%, #0d0619 100%)'
            }}
        >
            {/* 背景装饰 - 柔和光晕 */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                {/* 主光晕 */}
                <div 
                    className="absolute w-[800px] h-[800px] rounded-full blur-[120px] opacity-30"
                    style={{
                        background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)',
                        top: '-20%',
                        left: '-10%',
                    }}
                />
                <div 
                    className="absolute w-[600px] h-[600px] rounded-full blur-[100px] opacity-20"
                    style={{
                        background: 'radial-gradient(circle, #3b82f6 0%, transparent 70%)',
                        bottom: '10%',
                        right: '-5%',
                    }}
                />
                <div 
                    className="absolute w-[400px] h-[400px] rounded-full blur-[80px] opacity-15"
                    style={{
                        background: 'radial-gradient(circle, #ec4899 0%, transparent 70%)',
                        top: '40%',
                        left: '30%',
                    }}
                />
                
                {/* 网格纹理 */}
                <div 
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: `
                            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
                        `,
                        backgroundSize: '60px 60px'
                    }}
                />
            </div>

            {/* 顶部导航 */}
            <nav className="fixed top-0 w-full z-50 px-8 py-5">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div 
                            className="w-10 h-10 rounded-xl flex items-center justify-center"
                            style={{
                                background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
                                boxShadow: '0 4px 20px rgba(124, 58, 237, 0.4)'
                            }}
                        >
                            <Circle size={18} className="text-white" strokeWidth={3} />
                        </div>
                        <span className="text-white/90 font-semibold text-lg tracking-wide">Vernify</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button 
                            className="px-5 py-2 rounded-full text-sm font-medium text-white/80 hover:text-white transition-colors"
                            style={{ background: 'rgba(255,255,255,0.08)' }}
                        >
                            关于课程
                        </button>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium text-white/80 hover:text-white transition-colors cursor-pointer"
                            style={{ background: 'rgba(255,255,255,0.08)' }}
                        >
                            <LogOut size={16} />
                            退出登录
                        </button>
                    </div>
                </div>
            </nav>

            <div className="max-w-6xl mx-auto px-8 pt-32 pb-24 relative z-10" ref={containerRef}>
                {/* 已登录首页：欢迎 + 去选课入口（不展示课程/课时列表） */}
                <motion.div
                    style={{ opacity: heroOpacity, scale: heroScale }}
                    className="text-center py-16"
                >
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8"
                        style={{ background: 'rgba(124, 58, 237, 0.15)' }}
                    >
                        <Sparkles size={14} className="text-purple-400" />
                        <span className="text-purple-300 text-sm font-medium">欢迎回来</span>
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="text-4xl md:text-5xl font-bold mb-4 tracking-tight"
                        style={{
                            background: 'linear-gradient(135deg, #ffffff 0%, #c4b5fd 50%, #a78bfa 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}
                    >
                        开始你的学习之旅
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-white/50 mb-12 max-w-md mx-auto"
                    >
                        挑选感兴趣的课程，按自己的节奏学习
                    </motion.p>
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                    >
                        <Link
                            href="/courses"
                            className="group inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-white font-semibold transition-all duration-300 hover:scale-105"
                            style={{
                                background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
                                boxShadow: '0 8px 32px rgba(124, 58, 237, 0.4)',
                            }}
                        >
                            去选课
                            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </motion.div>
                </motion.div>
            </div>

            {/* Footer */}
            <footer className="relative z-10 py-12 text-center">
                <div className="flex items-center justify-center gap-2 text-white/30 text-sm">
                    <GraduationCap size={16} />
                    <span>Vernify Learning System</span>
                </div>
            </footer>
        </main>
    );
};
