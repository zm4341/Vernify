"use client";

import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { CheckCircle, XCircle, HelpCircle, Sparkles } from 'lucide-react';
import clsx from 'clsx';

// --- Context ---
const QuizContext = createContext<any[]>([]);

export const QuizProvider = ({ data, children }: { data: any[], children: React.ReactNode }) => {
  useEffect(() => {
    console.log("QuizProvider mounted with data:", data?.length);
  }, [data]);
  return <QuizContext.Provider value={data}>{children}</QuizContext.Provider>;
};

// --- Component ---

interface QuizBlockProps {
  id?: string;
  data?: any;
  onComplete?: () => void;  // 答题完成后的回调
}

/**
 * QuizBlock - 深邃星空主题测验组件
 */
export const QuizBlock: React.FC<QuizBlockProps> = ({ id, data: directData, onComplete }) => {
  const contextData = useContext(QuizContext);
  
  // Resolve data: either direct prop or from context by ID
  let quizData = directData;
  if (!quizData && id && contextData) {
      const index = parseInt(id.split('_')[1]);
      if (!isNaN(index) && contextData[index]) {
          quizData = contextData[index];
      }
  }

  if (!quizData) {
      return (
          <div 
            className="my-8 p-4 rounded-xl flex items-center gap-3 text-red-400"
            style={{ background: 'rgba(239, 68, 68, 0.1)' }}
          >
              <XCircle size={20} />
              <span>错误: 找不到题目数据 ID: {id}</span>
          </div>
      );
  }

  const { type = 'choice', question, options = [], correctIndex, explanation, score } = quizData;
  const isChoiceOrFill = type === 'choice' || type === 'fill_blank' || type === 'multi_choice';
  const hasOptions = options && options.length > 0;
  
  const [selected, setSelected] = useState<number | null>(null);
  const [essayAnswer, setEssayAnswer] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);

  const handleSubmit = () => {
    if (isChoiceOrFill && hasOptions && selected === null) return;
    
    setIsSubmitted(true);
    const correct = isChoiceOrFill && hasOptions ? selected === correctIndex : null; 
    setIsCorrect(correct ?? false);

    // 调用完成回调
    if (onComplete) {
      onComplete();
    }

    if (correct === true) {
       const tl = gsap.timeline();
       if (containerRef.current) {
           tl.to(containerRef.current, { 
             scale: 1.01, 
             boxShadow: "0 0 40px rgba(34, 197, 94, 0.2)", 
             duration: 0.15, 
             ease: "power2.out" 
           })
           .to(containerRef.current, { scale: 1, duration: 0.4, ease: "elastic.out(1, 0.3)" });
       }
    } else if (correct === false) {
       if (containerRef.current) {
           gsap.fromTo(containerRef.current, 
               { x: -8 }, 
               { x: 8, duration: 0.08, repeat: 5, yoyo: true, ease: "sine.inOut", onComplete: () => { 
                   gsap.set(containerRef.current, { x: 0 });
               }}
           );
       }
    }
  };

  return (
    <div className="relative my-16">
      <div 
        ref={containerRef}
        className="relative w-full max-w-3xl mx-auto rounded-2xl overflow-hidden"
        style={{ 
          background: 'rgba(124, 58, 237, 0.06)',
          boxShadow: '0 0 0 1px rgba(255,255,255,0.05)'
        }}
      >
        {/* 背景光晕 */}
        <div 
          className="absolute top-0 right-0 w-64 h-64 rounded-full blur-[80px] opacity-30 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)' }}
        />

        <div className="relative z-10 p-8">
          {/* Header */}
          <div className="flex items-start gap-5 mb-8">
            <div 
              className="p-3 rounded-xl shrink-0"
              style={{ background: 'rgba(124, 58, 237, 0.15)' }}
            >
              <HelpCircle size={24} className="text-purple-400" strokeWidth={1.5} />
            </div>
            <div className="flex-1 pt-1">
              <div className="flex items-center justify-between mb-3">
                <span 
                  className="text-xs px-3 py-1 rounded-full text-purple-300"
                  style={{ background: 'rgba(124, 58, 237, 0.15)' }}
                >
                  {type === 'fill_blank' ? '填空题' : type === 'essay' ? '简答题' : type === 'drawing' ? '作图题' : '选择题'}
                </span>
                {score && score > 0 && (
                  <span className="text-xs text-white/40">{score} 分</span>
                )}
              </div>
              <div 
                className="text-white/90 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: question }}
              />
            </div>
          </div>

          {/* Options 或 简答/作图输入 */}
          <div className="space-y-3">
            {hasOptions ? options.map((option: string, index: number) => {
              const isSelected = selected === index;
              const isCorrectOption = index === correctIndex;
              
              let bgStyle = 'rgba(255,255,255,0.03)';
              let borderStyle = '1px solid rgba(255,255,255,0.05)';
              let textColor = 'rgba(255,255,255,0.7)';
              
              if (isSubmitted) {
                if (isCorrectOption) {
                  bgStyle = 'rgba(34, 197, 94, 0.1)';
                  borderStyle = '1px solid rgba(34, 197, 94, 0.3)';
                  textColor = 'rgb(134, 239, 172)';
                } else if (isSelected && !isCorrect) {
                  bgStyle = 'rgba(239, 68, 68, 0.1)';
                  borderStyle = '1px solid rgba(239, 68, 68, 0.3)';
                  textColor = 'rgb(252, 165, 165)';
                } else {
                  textColor = 'rgba(255,255,255,0.3)';
                }
              } else if (isSelected) {
                bgStyle = 'rgba(124, 58, 237, 0.15)';
                borderStyle = '1px solid rgba(124, 58, 237, 0.4)';
                textColor = 'rgb(196, 181, 253)';
              }

              return (
                <motion.button
                  key={index}
                  whileHover={!isSubmitted ? { scale: 1.005, x: 4 } : {}}
                  whileTap={!isSubmitted ? { scale: 0.995 } : {}}
                  onClick={() => !isSubmitted && setSelected(index)}
                  disabled={isSubmitted}
                  className="w-full p-4 rounded-xl text-left transition-all duration-300 flex items-center gap-4"
                  style={{ 
                    background: bgStyle,
                    border: borderStyle,
                    color: textColor
                  }}
                >
                  <span 
                    className={clsx(
                      "w-8 h-8 flex items-center justify-center rounded-lg text-sm font-bold font-mono shrink-0 transition-all",
                      isSelected || (isSubmitted && isCorrectOption) 
                        ? "bg-white/10" 
                        : "bg-white/5"
                    )}
                  >
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span 
                    className="font-medium flex-1"
                    dangerouslySetInnerHTML={{ __html: option }} 
                  />
                  
                  {isSubmitted && isCorrectOption && (
                    <CheckCircle size={20} className="text-green-400 shrink-0" />
                  )}
                  {isSubmitted && isSelected && !isCorrect && (
                    <XCircle size={20} className="text-red-400 shrink-0" />
                  )}
                </motion.button>
              );
            }) : (
              /* Essay/Drawing: 文本输入框 */
              !isSubmitted ? (
                <textarea
                  value={essayAnswer}
                  onChange={(e) => setEssayAnswer(e.target.value)}
                  placeholder="在此输入你的答案..."
                  className="w-full min-h-[120px] p-4 rounded-xl resize-y bg-white/5 border border-white/10 text-white/90 placeholder-white/30 focus:outline-none focus:border-purple-500/50 transition-colors"
                  rows={4}
                />
              ) : (
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-white/70">
                  {essayAnswer || '(未填写)'}
                </div>
              )
            )}
          </div>

          {/* Submit Button */}
          {!isSubmitted && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-end mt-8"
            >
              <button
                onClick={handleSubmit}
                disabled={isChoiceOrFill && hasOptions ? selected === null : false}
                className={clsx(
                  "px-8 py-3 rounded-xl font-medium transition-all duration-300",
                  (isChoiceOrFill && hasOptions ? selected === null : false)
                    ? "bg-white/5 text-white/30 cursor-not-allowed"
                    : "text-white hover:scale-105"
                )}
                style={(isChoiceOrFill && hasOptions ? selected !== null : true) ? {
                  background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
                  boxShadow: '0 4px 20px rgba(124, 58, 237, 0.3)'
                } : {}}
              >
                提交答案
              </button>
            </motion.div>
          )}

          {/* Result */}
          <AnimatePresence>
            {isSubmitted && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.4, ease: "circOut" }}
                className="overflow-hidden"
              >
                <div className="h-px bg-white/5 my-8" />
                
                {/* Result Badge */}
                <div 
                  className={clsx(
                    "flex items-center gap-3 p-4 rounded-xl",
                    !hasOptions ? "text-purple-300" : isCorrect ? "text-green-400" : "text-red-400"
                  )}
                  style={{ 
                    background: !hasOptions 
                      ? 'rgba(124, 58, 237, 0.1)' 
                      : isCorrect 
                        ? 'rgba(34, 197, 94, 0.1)' 
                        : 'rgba(239, 68, 68, 0.1)' 
                  }}
                >
                  {!hasOptions ? (
                    <>
                      <Sparkles size={20} />
                      <span className="font-semibold">已提交</span>
                    </>
                  ) : isCorrect ? (
                    <>
                      <Sparkles size={20} />
                      <span className="font-semibold">回答正确！</span>
                    </>
                  ) : (
                    <>
                      <XCircle size={20} />
                      <span className="font-semibold">回答错误</span>
                    </>
                  )}
                </div>
                
                {explanation && (
                  <div 
                    className="mt-4 p-5 rounded-xl text-white/60 leading-relaxed"
                    style={{ 
                      background: 'rgba(255,255,255,0.03)',
                      borderLeft: '3px solid rgba(124, 58, 237, 0.5)'
                    }}
                  >
                    {explanation}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
