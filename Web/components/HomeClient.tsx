"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lesson } from '@/lib/content';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/lib/stores';
import { motion, useScroll, useTransform } from 'framer-motion';
import { 
  ArrowRight, 
  Sparkles, 
  BookOpen, 
  PlayCircle, 
  Clock, 
  Circle,
  GraduationCap,
  Compass,
  PenTool,
  LogOut
} from 'lucide-react';
import React, { useRef } from 'react';

/**
 * HomeClient - 深邃星空主题
 * 
 * 设计风格: 简约、高级、沉浸式
 * 配色: 深紫渐变 + 柔和发光
 * 特点: 无边框、柔和阴影、微妙动效
 */
export default function HomeClient({ lessons }: { lessons: Lesson[] }) {
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
                
                {/* Hero Section */}
                <motion.div 
                    style={{ opacity: heroOpacity, scale: heroScale }}
                    className="text-center mb-24"
                >
                    {/* 标签 */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8"
                        style={{ background: 'rgba(124, 58, 237, 0.15)' }}
                    >
                        <Sparkles size={14} className="text-purple-400" />
                        <span className="text-purple-300 text-sm font-medium">四年级上册 · 几何小实验</span>
                    </motion.div>
                    
                    {/* 主标题 */}
                    <motion.h1 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.1 }}
                        className="text-6xl md:text-7xl font-bold mb-8 tracking-tight"
                        style={{
                            background: 'linear-gradient(135deg, #ffffff 0%, #c4b5fd 50%, #a78bfa 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}
                    >
                        圆的初步认识
                    </motion.h1>
                    
                    {/* 副标题 */}
                    <motion.p 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="text-lg md:text-xl text-white/50 mb-12 max-w-2xl mx-auto leading-relaxed"
                    >
                        通过动画演示和交互练习，探索圆的奥秘
                        <br />
                        理解<span className="text-purple-400">圆心</span>、
                        <span className="text-blue-400">半径</span>、
                        <span className="text-pink-400">直径</span>的概念与关系
                    </motion.p>
                    
                    {/* CTA 按钮 */}
                    <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="flex justify-center gap-4 flex-wrap"
                    >
                        <Link 
                            href="/lessons/01_MultipleChoice"
                            className="group flex items-center gap-2 px-8 py-4 rounded-2xl text-white font-semibold transition-all duration-300 hover:scale-105"
                            style={{
                                background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
                                boxShadow: '0 8px 32px rgba(124, 58, 237, 0.4)'
                            }}
                        >
                            <PlayCircle size={20} />
                            开始学习
                            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <button 
                            onClick={() => document.getElementById('course-list')?.scrollIntoView({ behavior: 'smooth' })}
                            className="px-8 py-4 rounded-2xl text-white/70 font-medium transition-all duration-300 hover:text-white hover:bg-white/10"
                            style={{ background: 'rgba(255,255,255,0.05)' }}
                        >
                            查看大纲
                        </button>
                        <Link 
                            href="/lessons/00_Cover"
                            className="px-8 py-4 rounded-2xl text-white/70 font-medium transition-all duration-300 hover:text-white hover:bg-white/10"
                            style={{ background: 'rgba(255,255,255,0.05)' }}
                        >
                            注意事项
                        </Link>
                    </motion.div>

                    {/* 统计数据 */}
                    <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="flex justify-center gap-12 mt-16"
                    >
                        {[
                            { value: '4', label: '节课程', icon: BookOpen },
                            { value: '13', label: '道练习', icon: PenTool },
                            { value: '42', label: '分钟', icon: Clock },
                        ].map((stat) => (
                            <div key={stat.label} className="text-center">
                                <div className="flex items-center justify-center gap-2 mb-2">
                                    <stat.icon size={16} className="text-white/30" />
                                    <span className="text-3xl font-bold text-white">{stat.value}</span>
                                </div>
                                <span className="text-sm text-white/40">{stat.label}</span>
                            </div>
                        ))}
                    </motion.div>
                </motion.div>

                {/* 课程列表 */}
                <motion.div
                    id="course-list"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                >
                    {/* Section Header */}
                    <div className="flex items-center gap-4 mb-10">
                        <Compass size={20} className="text-purple-400" />
                        <h2 className="text-xl font-semibold text-white/90">课程目录</h2>
                        <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent"></div>
                    </div>

                    {/* Cards Grid - 排除注意事项(00_Cover)，已移至 Hero 按钮行 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {lessons
                            .filter((l) => l.slug !== '00_Cover')
                            .map((lesson, index) => (
                                <LessonCard key={lesson.slug} lesson={lesson} index={index} />
                            ))}
                    </div>
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

/**
 * LessonCard - 课程卡片
 * 简约设计：无边框、柔和发光、微妙渐变
 */
const LessonCard = ({ lesson, index }: { lesson: Lesson, index: number }) => {
    // 每张卡片的渐变色
    const gradients = [
        { bg: 'rgba(124, 58, 237, 0.08)', glow: 'rgba(124, 58, 237, 0.3)', accent: '#a78bfa' },
        { bg: 'rgba(59, 130, 246, 0.08)', glow: 'rgba(59, 130, 246, 0.3)', accent: '#60a5fa' },
        { bg: 'rgba(236, 72, 153, 0.08)', glow: 'rgba(236, 72, 153, 0.3)', accent: '#f472b6' },
        { bg: 'rgba(16, 185, 129, 0.08)', glow: 'rgba(16, 185, 129, 0.3)', accent: '#34d399' },
    ];
    const style = gradients[index % gradients.length];

    return (
        <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
        >
            <Link href={`/lessons/${lesson.slug}`} className="block group">
                <div 
                    className="relative p-6 rounded-2xl transition-all duration-500 overflow-hidden"
                    style={{ 
                        background: style.bg,
                        boxShadow: '0 0 0 1px rgba(255,255,255,0.05)'
                    }}
                >
                    {/* Hover glow effect */}
                    <div 
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                        style={{
                            background: `radial-gradient(circle at 50% 50%, ${style.glow}, transparent 70%)`,
                        }}
                    />
                    
                    <div className="relative z-10">
                        {/* Top row */}
                        <div className="flex items-start justify-between mb-5">
                            <div 
                                className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold transition-all duration-300 group-hover:scale-110"
                                style={{ 
                                    background: 'rgba(255,255,255,0.05)',
                                    color: style.accent
                                }}
                            >
                                {index + 1}
                            </div>
                            <div className="flex items-center gap-1.5 text-white/40 text-xs">
                                <Clock size={12} />
                                <span>{String(lesson.frontmatter.duration ?? '15 分钟')}</span>
                            </div>
                        </div>
                        
                        {/* Title */}
                        <h3 className="text-lg font-semibold text-white/90 mb-3 group-hover:text-white transition-colors">
                            {lesson.frontmatter.title}
                        </h3>
                        
                        {/* Description */}
                        <p className="text-sm text-white/40 mb-5 leading-relaxed line-clamp-2 group-hover:text-white/60 transition-colors">
                            {String(lesson.frontmatter.description ?? '探索几何世界的奥秘')}
                        </p>
                        
                        {/* Bottom row */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span 
                                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full"
                                    style={{ background: 'rgba(255,255,255,0.05)', color: style.accent }}
                                >
                                    <PlayCircle size={12} />
                                    视频
                                </span>
                                <span 
                                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full text-emerald-400"
                                    style={{ background: 'rgba(16,185,129,0.1)' }}
                                >
                                    <BookOpen size={12} />
                                    练习
                                </span>
                            </div>
                            <div 
                                className="w-8 h-8 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0"
                                style={{ background: style.accent }}
                            >
                                <ArrowRight size={16} className="text-white" />
                            </div>
                        </div>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}
