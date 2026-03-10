"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Unlock, Play, Sparkles, CheckCircle } from 'lucide-react';
import { ManimPlayer } from './ManimPlayer';

interface LockedVideoProps {
  src: string;
  title?: string;
  unlockText?: string;
}

export const LockedVideo: React.FC<LockedVideoProps> = ({ 
  src, 
  title,
  unlockText = "完成本题后解锁视频讲解"
}) => {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);

  const handleUnlock = () => {
    setIsUnlocking(true);
    // 模拟批改动画
    setTimeout(() => {
      setIsUnlocking(false);
      setIsUnlocked(true);
    }, 1500);
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto my-8">
      <AnimatePresence mode="wait">
        {!isUnlocked ? (
          <motion.div
            key="locked"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative rounded-2xl overflow-hidden border border-white/10 bg-surface/50 backdrop-blur-md"
          >
            {/* 锁定状态的模糊预览 */}
            <div className="aspect-video relative overflow-hidden">
              {/* 模糊背景 */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-surface to-secondary/20" />
              
              {/* 动态网格背景 */}
              <div className="absolute inset-0 opacity-30">
                <div className="absolute inset-0" style={{
                  backgroundImage: `linear-gradient(rgba(112, 0, 255, 0.1) 1px, transparent 1px), 
                                    linear-gradient(90deg, rgba(112, 0, 255, 0.1) 1px, transparent 1px)`,
                  backgroundSize: '40px 40px'
                }} />
              </div>
              
              {/* 浮动圆形装饰 */}
              <motion.div 
                className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full bg-primary/20 blur-3xl"
                animate={{ 
                  x: [0, 30, 0], 
                  y: [0, -20, 0],
                  scale: [1, 1.2, 1]
                }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.div 
                className="absolute bottom-1/4 right-1/4 w-40 h-40 rounded-full bg-secondary/20 blur-3xl"
                animate={{ 
                  x: [0, -20, 0], 
                  y: [0, 30, 0],
                  scale: [1.2, 1, 1.2]
                }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
              />

              {/* 中心锁定图标和内容 */}
              <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                <motion.div
                  animate={isUnlocking ? { rotate: [0, -10, 10, -10, 10, 0], scale: [1, 1.1, 1] } : {}}
                  transition={{ duration: 0.5 }}
                  className="relative mb-6"
                >
                  {/* 光环效果 */}
                  <motion.div 
                    className="absolute inset-0 rounded-full bg-primary/30 blur-xl"
                    animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.8, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  
                  <div className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-500 ${
                    isUnlocking 
                      ? 'bg-accent/20 border-accent' 
                      : 'bg-white/5 border-white/20'
                  } border-2 backdrop-blur-md`}>
                    {isUnlocking ? (
                      <motion.div
                        initial={{ rotate: 0 }}
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <Sparkles size={32} className="text-accent" />
                      </motion.div>
                    ) : (
                      <Lock size={32} className="text-gray-400" />
                    )}
                  </div>
                </motion.div>

                <h4 className="text-white font-heading font-bold text-xl mb-2">
                  {isUnlocking ? '正在批改...' : '视频已锁定'}
                </h4>
                <p className="text-gray-400 text-sm mb-6 text-center max-w-xs">
                  {isUnlocking ? '请稍候，正在检查您的答案' : unlockText}
                </p>

                {!isUnlocking && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleUnlock}
                    className="px-6 py-3 rounded-full bg-gradient-to-r from-primary to-secondary text-white font-bold flex items-center gap-2 shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-shadow"
                  >
                    <CheckCircle size={18} />
                    提交并批改
                  </motion.button>
                )}
              </div>

              {/* 标题栏 */}
              {title && (
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                  <div className="flex items-center gap-2">
                    <Lock size={14} className="text-gray-500" />
                    <span className="text-gray-400 text-sm">{title}</span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="unlocked"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            {/* 解锁成功提示 */}
            <motion.div
              initial={{ opacity: 1, y: 0 }}
              animate={{ opacity: 0, y: -20 }}
              transition={{ delay: 2, duration: 0.5 }}
              className="flex items-center justify-center gap-2 mb-4 text-accent"
            >
              <Unlock size={18} />
              <span className="text-sm font-medium">视频已解锁！</span>
            </motion.div>
            
            <ManimPlayer src={src} title={title} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
