"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ZoomIn, ZoomOut, Move, RotateCcw, Download } from 'lucide-react';

/**
 * GlobalImageViewer - 深邃星空主题图片查看器
 */
export const GlobalImageViewer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState('');
  const [imageAlt, setImageAlt] = useState('');
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [mounted, setMounted] = useState(false);
  const imageAreaRef = useRef<HTMLDivElement>(null);

  const BASE_SIZE = 300;

  useEffect(() => {
    setMounted(true);
  }, []);

  // 处理滚轮缩放
  const handleWheelZoom = useCallback((e: WheelEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setScale(prev => Math.min(Math.max(prev + delta, 0.5), 3));
  }, []);

  // 绑定滚轮事件
  useEffect(() => {
    const element = imageAreaRef.current;
    if (element && isOpen) {
      element.addEventListener('wheel', handleWheelZoom, { passive: false });
      return () => {
        element.removeEventListener('wheel', handleWheelZoom);
      };
    }
  }, [isOpen, handleWheelZoom]);

  // 拖拽处理
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  }, [position]);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStart]);

  // 全局监听图片点击
  useEffect(() => {
    const handleImageClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      if (target.tagName === 'IMG') {
        const img = target as HTMLImageElement;
        
        if (img.classList.contains('no-zoom') || 
            img.width < 50 || 
            img.height < 50 ||
            img.closest('.no-image-zoom')) {
          return;
        }
        
        e.preventDefault();
        e.stopPropagation();
        
        setImageSrc(img.src);
        setImageAlt(img.alt || '图片');
        setScale(1);
        setPosition({ x: window.innerWidth / 2 - 180, y: 100 });
        setIsOpen(true);
      }
    };

    document.addEventListener('click', handleImageClick, true);
    
    return () => {
      document.removeEventListener('click', handleImageClick, true);
    };
  }, []);

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.25, 0.5));
  };

  const handleReset = () => {
    setScale(1);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = imageSrc;
    link.download = imageAlt || 'image';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const currentSize = BASE_SIZE * scale;

  // 浮动窗口内容
  const viewerContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          style={{ 
            position: 'fixed',
            left: position.x,
            top: position.y,
            zIndex: 9999,
            cursor: isDragging ? 'grabbing' : 'default',
            fontFamily: "'LXGW WenKai', sans-serif",
          }}
        >
          {/* 主容器 */}
          <div 
            className="relative rounded-2xl overflow-hidden"
            style={{ 
              background: 'rgba(15, 10, 35, 0.95)',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255,255,255,0.05), 0 0 60px rgba(124, 58, 237, 0.15)'
            }}
          >
            {/* 标题栏 - 拖拽区域 */}
            <div 
              className="flex items-center justify-between px-4 py-3 select-none"
              style={{ 
                cursor: isDragging ? 'grabbing' : 'grab',
                background: 'rgba(255,255,255,0.03)',
                borderBottom: '1px solid rgba(255,255,255,0.05)'
              }}
              onMouseDown={handleMouseDown}
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <div 
                    className="w-3 h-3 rounded-full cursor-pointer transition-all hover:scale-110" 
                    style={{ background: '#ff5f57' }}
                    onClick={(e) => { e.stopPropagation(); handleClose(); }} 
                    onMouseDown={(e) => e.stopPropagation()}
                  />
                  <div className="w-3 h-3 rounded-full" style={{ background: '#febc2e' }} />
                  <div className="w-3 h-3 rounded-full" style={{ background: '#28c840' }} />
                </div>
                <div className="flex items-center gap-2 text-white/40">
                  <Move size={12} />
                  <span className="text-xs">图片查看器</span>
                </div>
              </div>
              
              {/* 工具栏 */}
              <div className="flex items-center gap-1" onMouseDown={(e) => e.stopPropagation()}>
                <button
                  onClick={handleZoomOut}
                  className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-all"
                  title="缩小"
                >
                  <ZoomOut size={14} />
                </button>
                <span className="text-xs text-white/30 w-12 text-center font-mono">
                  {Math.round(scale * 100)}%
                </span>
                <button
                  onClick={handleZoomIn}
                  className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-all"
                  title="放大"
                >
                  <ZoomIn size={14} />
                </button>
                <button
                  onClick={handleReset}
                  className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-all"
                  title="重置"
                >
                  <RotateCcw size={14} />
                </button>
                <button
                  onClick={handleDownload}
                  className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-all"
                  title="下载"
                >
                  <Download size={14} />
                </button>
                <button
                  onClick={handleClose}
                  className="p-1.5 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all ml-1"
                  title="关闭"
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* 图片区域 */}
            <div 
              ref={imageAreaRef}
              className="relative p-3"
              style={{
                width: currentSize + 24,
                height: currentSize + 24,
                background: 'rgba(0,0,0,0.2)'
              }}
            >
              <img
                src={imageSrc}
                alt={imageAlt}
                className="rounded-xl"
                style={{ 
                  width: currentSize,
                  height: currentSize,
                  objectFit: 'contain',
                  background: 'white',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
                }}
                draggable={false}
              />
            </div>

            {/* 底部 */}
            <div 
              className="px-4 py-2 flex items-center justify-between"
              style={{ 
                background: 'rgba(255,255,255,0.02)',
                borderTop: '1px solid rgba(255,255,255,0.05)'
              }}
            >
              <span className="text-[10px] text-white/20">
                拖拽标题栏移动 · 滚轮缩放
              </span>
              <span className="text-[10px] text-white/20 truncate max-w-[120px]">
                {imageAlt}
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      {children}
      {mounted && createPortal(viewerContent, document.body)}
    </>
  );
};
