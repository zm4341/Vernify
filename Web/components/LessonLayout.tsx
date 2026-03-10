"use client";

import React, { useRef, useEffect } from 'react';
import Link from 'next/link';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { motion, useScroll, useSpring } from 'framer-motion';
import { GlobalImageViewer } from './GlobalImageViewer';
import { Home } from 'lucide-react';

interface LessonLayoutProps {
  children: React.ReactNode;
}

/**
 * LessonLayout - 深邃星空主题课程布局
 * 与 HomeClient 保持一致的设计风格
 */
export const LessonLayout: React.FC<LessonLayoutProps> = ({ children }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // 点击页面收起数学输入键盘（math-field 用 Shadow DOM，activeElement 可能是其内部节点）
  useEffect(() => {
    const getFocusedMathField = (): HTMLElement | null => {
      let el: Element | null = document.activeElement as Element;
      while (el) {
        if (el.tagName === 'MATH-FIELD') return el as HTMLElement;
        const root = el.getRootNode();
        el = (root instanceof ShadowRoot ? root.host : el.parentElement) as Element;
      }
      return null;
    };

    const handlePointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (target instanceof Element) {
        if (target.closest('math-field')) return;
        // 只排除键盘按键区域，点击 backdrop 遮罩应触发收起
        if (target.closest('.MLK__plate')) return;
      }
      const mf = getFocusedMathField();
      const kbd = (window as any).mathVirtualKeyboard;
      if (mf || kbd?.visible) {
        (document.activeElement as HTMLElement)?.blur();
        kbd?.hide?.();
      }
    };
    document.addEventListener('pointerdown', handlePointerDown, true);
    return () => document.removeEventListener('pointerdown', handlePointerDown, true);
  }, []);

  useGSAP(() => {
    if (!containerRef.current) return;

    const elements = containerRef.current.querySelectorAll('h1, h2, h3, p, ul, ol, div.relative, blockquote, table');

    gsap.fromTo(elements, 
      { 
        y: 20, 
        opacity: 0,
        filter: "blur(5px)"
      },
      { 
        y: 0, 
        opacity: 1, 
        filter: "blur(0px)",
        stagger: 0.03, 
        duration: 0.6, 
        ease: "power2.out",
        clearProps: "all"
      }
    );
  }, { scope: containerRef });

  return (
    <GlobalImageViewer>
      <div 
        className="min-h-screen relative overflow-x-hidden selection:bg-purple-500/30"
        style={{ 
          fontFamily: "'LXGW WenKai', sans-serif",
          background: 'linear-gradient(135deg, #0c0118 0%, #1a0a2e 25%, #16082a 50%, #0d0619 100%)'
        }}
      >
        {/* Progress Bar */}
        <motion.div
          className="fixed top-0 left-0 right-0 h-0.5 z-[100] origin-left"
          style={{ 
            scaleX,
            background: 'linear-gradient(90deg, #7c3aed 0%, #a855f7 50%, #ec4899 100%)',
            boxShadow: '0 0 20px rgba(124, 58, 237, 0.5)'
          }}
        />

        {/* 背景装饰 */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div 
            className="absolute w-[800px] h-[800px] rounded-full blur-[120px] opacity-20"
            style={{
              background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)',
              top: '-20%',
              right: '-10%',
            }}
          />
          <div 
            className="absolute w-[600px] h-[600px] rounded-full blur-[100px] opacity-15"
            style={{
              background: 'radial-gradient(circle, #3b82f6 0%, transparent 70%)',
              bottom: '20%',
              left: '-10%',
            }}
          />
          {/* 网格纹理 */}
          <div 
            className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage: `
                linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
              `,
              backgroundSize: '60px 60px'
            }}
          />
        </div>

        {/* 主内容 - 顶部导航由 lesson page 提供 */}
        <div className="max-w-4xl mx-auto px-8 pt-24 pb-24 relative z-10">
          <div 
            ref={containerRef}
            className="prose prose-lg max-w-none 
              prose-headings:font-semibold prose-headings:tracking-tight prose-headings:text-white
              prose-h1:text-4xl prose-h1:md:text-5xl prose-h1:mb-8 prose-h1:mt-0
              prose-h2:text-2xl prose-h2:mt-16 prose-h2:mb-6 prose-h2:text-white/90
              prose-h3:text-xl prose-h3:mt-10 prose-h3:mb-4 prose-h3:text-white/80
              prose-p:text-white/60 prose-p:leading-relaxed prose-p:my-5
              prose-a:text-purple-400 prose-a:no-underline prose-a:hover:text-purple-300 prose-a:transition-colors
              prose-strong:text-white prose-strong:font-semibold
              prose-code:text-pink-400 prose-code:bg-white/5 prose-code:px-2 prose-code:py-1 prose-code:rounded-md prose-code:text-sm prose-code:before:content-[''] prose-code:after:content-['']
              prose-pre:bg-white/5 prose-pre:border prose-pre:border-white/10 prose-pre:rounded-xl
              prose-ul:my-6 prose-ul:text-white/60
              prose-ol:my-6 prose-ol:text-white/60
              prose-li:my-2 prose-li:marker:text-purple-400
              prose-blockquote:border-l-purple-500 prose-blockquote:bg-white/5 prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:rounded-r-xl prose-blockquote:not-italic prose-blockquote:text-white/60
              prose-hr:border-white/10 prose-hr:my-12
              prose-img:rounded-2xl prose-img:shadow-2xl prose-img:cursor-pointer prose-img:hover:opacity-90 prose-img:transition-opacity
              prose-table:text-white/60 prose-th:text-white/80 prose-th:border-white/10 prose-td:border-white/10"
          >
            {children}
          </div>
          
          {/* Footer */}
          <footer className="mt-32 pt-8 border-t border-white/5">
            <div className="flex items-center justify-between text-xs text-white/30">
              <span>Lattice Learning System</span>
              <Link 
                href="/"
                className="flex items-center gap-2 hover:text-white/50 transition-colors"
              >
                <Home size={14} />
                <span>返回首页</span>
              </Link>
            </div>
          </footer>
        </div>
      </div>
    </GlobalImageViewer>
  );
};
