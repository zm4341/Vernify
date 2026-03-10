"use client";

import React, { useState, useRef, useEffect } from 'react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

interface FillInBlankProps {
  answer?: string;
  mathMode?: boolean;
}

/**
 * FillInBlank - 深邃星空主题填空组件
 */
export const FillInBlank: React.FC<FillInBlankProps> = ({ answer, mathMode = false }) => {
  const [value, setValue] = useState("");
  const [status, setStatus] = useState<"idle" | "correct" | "incorrect">("idle");
  const mathFieldRef = useRef<HTMLElement | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    if (mathMode) {
      import('mathlive').then(() => {
        setIsMounted(true);
      });
    } else {
      setIsMounted(true);
    }
  }, [mathMode]);

  useEffect(() => {
    if (mathMode && isMounted && mathFieldRef.current) {
      const mf = mathFieldRef.current as any;
      
      const handleInput = () => {
        const latex = mf.getValue?.() || '';
        setValue(latex);
        if (status !== 'idle') setStatus('idle');
      };

      mf.addEventListener('input', handleInput);
      
      return () => {
        mf.removeEventListener('input', handleInput);
      };
    }
  }, [mathMode, isMounted, status]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && answer) {
      checkAnswer();
    }
  };

  const checkAnswer = () => {
    if (!answer) return;
    
    const normalizedValue = value.replace(/\s+/g, '').trim();
    const normalizedAnswer = answer.replace(/\s+/g, '').trim();
    
    if (normalizedValue === normalizedAnswer) {
      setStatus("correct");
    } else {
      setStatus("incorrect");
      setTimeout(() => setStatus("idle"), 800);
    }
  };

  // 颜色映射
  const getColors = () => {
    switch (status) {
      case 'correct':
        return { border: 'rgba(34, 197, 94, 0.8)', text: 'rgb(134, 239, 172)' };
      case 'incorrect':
        return { border: 'rgba(239, 68, 68, 0.8)', text: 'rgb(252, 165, 165)' };
      default:
        return { border: 'rgba(124, 58, 237, 0.5)', text: 'rgba(255, 255, 255, 0.9)' };
    }
  };

  const colors = getColors();

  // Simple text input (non-math mode)
  if (!mathMode) {
    return (
      <span className="inline-flex items-baseline relative mx-1 align-baseline">
        <motion.input
          type="text"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            if (status !== 'idle') setStatus('idle');
          }}
          onKeyDown={handleKeyDown}
          className="bg-transparent border-0 border-b-2 text-center focus:outline-none transition-colors duration-300 font-medium px-2 py-0.5"
          style={{ 
            minWidth: '80px',
            width: value ? `${Math.max(value.length * 14 + 20, 80)}px` : '80px',
            borderColor: colors.border,
            color: colors.text
          }}
          animate={status === "incorrect" ? { x: [-3, 3, -3, 3, 0] } : {}}
          transition={{ duration: 0.4 }}
        />
        <AnimatePresence>
          {status === "correct" && (
            <motion.span 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="absolute -top-5 left-1/2 -translate-x-1/2 text-xs font-bold text-green-400"
            >
              ✓
            </motion.span>
          )}
        </AnimatePresence>
      </span>
    );
  }

  // Math mode with MathLive
  if (!isMounted) {
    return (
      <span 
        className="inline-block min-w-[80px] h-6 rounded animate-pulse"
        style={{ background: 'rgba(124, 58, 237, 0.2)' }}
      />
    );
  }

  return (
    <span className="inline-flex items-baseline relative mx-1 align-baseline">
      <motion.span
        className="inline-block border-b-2 transition-colors duration-300"
        style={{ borderColor: colors.border }}
        animate={status === "incorrect" ? { x: [-3, 3, -3, 3, 0] } : {}}
        transition={{ duration: 0.4 }}
      >
        {/* @ts-ignore - MathLive web component */}
        <math-field
          ref={mathFieldRef}
          onKeyDown={(e: any) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              checkAnswer();
            }
          }}
          style={{
            display: 'inline-block',
            minWidth: '80px',
            padding: '0 4px',
            fontSize: 'inherit',
            background: 'transparent',
            color: colors.text,
            border: 'none',
            outline: 'none',
          }}
        />
      </motion.span>
      
      <AnimatePresence>
        {status === "correct" && (
          <motion.span 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="ml-1 font-bold text-green-400"
          >
            ✓
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
};

// Add global type declaration for math-field
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'math-field': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        ref?: React.Ref<HTMLElement>;
      };
    }
  }
}
