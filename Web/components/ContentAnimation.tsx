'use client';

import type { ReactNode } from 'react';
import { motion } from 'framer-motion';

/** 淡入动画，支持 delay */
export function FadeIn({
  children,
  delay = 0,
  duration = 0.5,
  className,
}: {
  children: ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/** 逐字显示动画（children 需为字符串） */
export function LetterByLetter({
  children,
  delay = 0,
  stagger = 0.03,
  className,
}: {
  children: ReactNode;
  delay?: number;
  stagger?: number;
  className?: string;
}) {
  const text = typeof children === 'string' ? children : String(children);
  const chars = Array.from(text);
  return (
    <span className={className}>
      {chars.map((char, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2, delay: delay + i * stagger }}
          style={{ display: 'inline-block' }}
        >
          {char}
        </motion.span>
      ))}
    </span>
  );
}

/** 自下而上滑入 */
export function SlideUp({
  children,
  delay = 0,
  duration = 0.5,
  offset = 20,
  className,
}: {
  children: ReactNode;
  delay?: number;
  duration?: number;
  offset?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: offset }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
