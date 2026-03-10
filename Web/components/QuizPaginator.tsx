"use client";

import React, { useState, Children, isValidElement, cloneElement } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, CheckCircle, Circle } from 'lucide-react';

interface QuizPaginatorProps {
  children: React.ReactNode;
  title?: string;
}

/**
 * QuizPaginator - 题目分页器
 * 一次只显示一道题目，可以通过按钮切换
 */
export const QuizPaginator: React.FC<QuizPaginatorProps> = ({ 
  children,
  title = "练习题"
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completedQuestions, setCompletedQuestions] = useState<Set<number>>(new Set());
  
  // 获取所有子元素（QuizBlock）
  const quizItems = Children.toArray(children).filter(isValidElement);
  const totalQuestions = quizItems.length;

  const goToNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const goToQuestion = (index: number) => {
    setCurrentIndex(index);
  };

  const markAsCompleted = (index: number) => {
    setCompletedQuestions(prev => new Set(prev).add(index));
  };

  // 如果没有子元素，不渲染
  if (totalQuestions === 0) {
    return null;
  }

  return (
    <div className="my-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-white/90">{title}</h3>
          <span 
            className="text-sm px-3 py-1 rounded-full"
            style={{ background: 'rgba(124, 58, 237, 0.15)', color: 'rgba(167, 139, 250, 1)' }}
          >
            {currentIndex + 1} / {totalQuestions}
          </span>
        </div>
        
        {/* Progress dots */}
        <div className="flex items-center gap-2">
          {quizItems.map((_, index) => (
            <button
              key={index}
              onClick={() => goToQuestion(index)}
              className={`
                w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium
                transition-all duration-300
                ${index === currentIndex 
                  ? 'text-white scale-110' 
                  : completedQuestions.has(index)
                    ? 'text-green-400'
                    : 'text-white/30 hover:text-white/60'
                }
              `}
              style={{
                background: index === currentIndex 
                  ? 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)'
                  : completedQuestions.has(index)
                    ? 'rgba(34, 197, 94, 0.15)'
                    : 'rgba(255,255,255,0.05)'
              }}
            >
              {completedQuestions.has(index) ? (
                <CheckCircle size={14} />
              ) : (
                index + 1
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Question Content */}
      <div className="relative min-h-[400px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {/* 克隆当前题目元素，传递 onComplete 回调 */}
            {isValidElement(quizItems[currentIndex]) && 
              cloneElement(quizItems[currentIndex] as React.ReactElement<any>, {
                onComplete: () => markAsCompleted(currentIndex)
              })
            }
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/5">
        <button
          onClick={goToPrevious}
          disabled={currentIndex === 0}
          className={`
            flex items-center gap-2 px-6 py-3 rounded-xl font-medium
            transition-all duration-300
            ${currentIndex === 0 
              ? 'opacity-30 cursor-not-allowed text-white/30' 
              : 'text-white/70 hover:text-white hover:bg-white/5'
            }
          `}
          style={{ background: 'rgba(255,255,255,0.03)' }}
        >
          <ChevronLeft size={18} />
          上一题
        </button>

        {/* Center indicator */}
        <div className="flex items-center gap-1.5">
          {quizItems.map((_, index) => (
            <div
              key={index}
              className={`
                h-1.5 rounded-full transition-all duration-300
                ${index === currentIndex 
                  ? 'w-6' 
                  : 'w-1.5'
                }
              `}
              style={{
                background: index === currentIndex 
                  ? 'linear-gradient(90deg, #7c3aed, #a855f7)'
                  : completedQuestions.has(index)
                    ? 'rgba(34, 197, 94, 0.5)'
                    : 'rgba(255,255,255,0.1)'
              }}
            />
          ))}
        </div>

        <button
          onClick={goToNext}
          disabled={currentIndex === totalQuestions - 1}
          className={`
            flex items-center gap-2 px-6 py-3 rounded-xl font-medium
            transition-all duration-300
            ${currentIndex === totalQuestions - 1 
              ? 'opacity-30 cursor-not-allowed text-white/30' 
              : 'text-white hover:scale-105'
            }
          `}
          style={currentIndex === totalQuestions - 1 
            ? { background: 'rgba(255,255,255,0.03)' }
            : { 
                background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
                boxShadow: '0 4px 20px rgba(124, 58, 237, 0.3)'
              }
          }
        >
          下一题
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Completion message */}
      {completedQuestions.size === totalQuestions && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 p-6 rounded-2xl text-center"
          style={{ 
            background: 'rgba(34, 197, 94, 0.1)',
            boxShadow: '0 0 0 1px rgba(34, 197, 94, 0.2)'
          }}
        >
          <CheckCircle size={32} className="mx-auto mb-3 text-green-400" />
          <p className="text-green-400 font-semibold">恭喜！你已完成本节所有题目</p>
        </motion.div>
      )}
    </div>
  );
};
