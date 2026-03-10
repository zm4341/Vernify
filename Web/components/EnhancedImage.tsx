"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ZoomIn, ZoomOut, Move, RotateCcw, Download, Maximize2 } from 'lucide-react';

interface EnhancedImageProps {
  src: string;
  alt?: string;
  className?: string;
}

/**
 * EnhancedImage - 深邃星空主题增强图片组件
 */
export const EnhancedImage: React.FC<EnhancedImageProps> = ({ 
  src, 
  alt = "图片",
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
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

  const handleWheelZoom = useCallback((e: WheelEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setScale(prev => Math.min(Math.max(prev + delta, 0.5), 3));
  }, []);

  useEffect(() => {
    const element = imageAreaRef.current;
    if (element && isOpen) {
      element.addEventListener('wheel', handleWheelZoom, { passive: false });
      return () => {
        element.removeEventListener('wheel', handleWheelZoom);
      };
    }
  }, [isOpen, handleWheelZoom]);

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

  const resetState = () => {
    setScale(1);
  };

  const handleOpen = () => {
    resetState();
    setPosition({ x: window.innerWidth / 2 - 180, y: 100 });
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.25, 0.5));
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = src;
    link.download = alt || 'image';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const currentSize = BASE_SIZE * scale;

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
          <div 
            className="relative rounded-2xl overflow-hidden"
            style={{ 
              background: 'rgba(15, 10, 35, 0.95)',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255,255,255,0.05), 0 0 60px rgba(124, 58, 237, 0.15)'
            }}
          >
            {/* 标题栏 */}
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
              
              <div className="flex items-center gap-1" onMouseDown={(e) => e.stopPropagation()}>
                <button onClick={handleZoomOut} className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-all" title="缩小">
                  <ZoomOut size={14} />
                </button>
                <span className="text-xs text-white/30 w-12 text-center font-mono">{Math.round(scale * 100)}%</span>
                <button onClick={handleZoomIn} className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-all" title="放大">
                  <ZoomIn size={14} />
                </button>
                <button onClick={resetState} className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-all" title="重置">
                  <RotateCcw size={14} />
                </button>
                <button onClick={handleDownload} className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-all" title="下载">
                  <Download size={14} />
                </button>
                <button onClick={handleClose} className="p-1.5 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all ml-1" title="关闭">
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* 图片区域 */}
            <div 
              ref={imageAreaRef}
              className="relative p-3"
              style={{ width: currentSize + 24, height: currentSize + 24, background: 'rgba(0,0,0,0.2)' }}
            >
              <img
                src={src}
                alt={alt}
                className="rounded-xl"
                style={{ width: currentSize, height: currentSize, objectFit: 'contain', background: 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}
                draggable={false}
              />
            </div>

            {/* 底部 */}
            <div 
              className="px-4 py-2 flex items-center justify-between"
              style={{ background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.05)' }}
            >
              <span className="text-[10px] text-white/20">拖拽标题栏移动 · 滚轮缩放</span>
              <span className="text-[10px] text-white/20 truncate max-w-[120px]">{alt}</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      {/* 缩略图 */}
      <motion.div
        className="relative inline-block cursor-pointer group"
        onClick={handleOpen}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div 
          className="relative rounded-2xl p-3 overflow-hidden transition-all duration-300"
          style={{ 
            background: 'rgba(124, 58, 237, 0.06)',
            boxShadow: '0 0 0 1px rgba(255,255,255,0.05)'
          }}
        >
          <img 
            src={src} 
            alt={alt}
            className={`max-w-full h-auto rounded-xl ${className}`}
            style={{ maxHeight: '200px', objectFit: 'contain' }}
          />
          
          <div 
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(15, 10, 35, 0.85)' }}
          >
            <span 
              className="flex items-center gap-2 text-white text-sm font-medium px-4 py-2 rounded-full transform translate-y-2 group-hover:translate-y-0 transition-transform"
              style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)' }}
            >
              <Maximize2 size={14} />
              点击放大
            </span>
          </div>
        </div>
      </motion.div>

      {mounted && createPortal(viewerContent, document.body)}
    </>
  );
};
