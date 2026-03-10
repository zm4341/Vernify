"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { Maximize2, ZoomIn, X } from 'lucide-react';

interface InteractiveImageProps {
  src: string;
  alt: string;
}

export const InteractiveImage: React.FC<InteractiveImageProps> = ({ src, alt }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Parallax Entry Effect
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });
  
  const y = useTransform(scrollYProgress, [0, 1], [30, -30]);
  const opacity = useTransform(scrollYProgress, [0, 0.2], [0, 1]);

  return (
    <>
      <motion.div
        ref={containerRef}
        style={{ y, opacity }}
        className="w-full max-w-2xl mx-auto my-20 group cursor-zoom-in relative"
        onClick={() => setIsOpen(true)}
      >
        {/* Decorative elements */}
        <div className="absolute -inset-1 bg-gradient-to-r from-secondary/20 to-primary/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition duration-700" />
        
        <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-surface border border-white/5 backdrop-blur-sm p-1.5 transition-colors group-hover:border-white/10">
            <div className="bg-grid absolute inset-0 opacity-[0.05]" />
            
            <div className="relative overflow-hidden rounded-xl bg-white/95">
                <motion.img 
                    layoutId={`image-${src}`}
                    src={src} 
                    alt={alt}
                    className="w-full h-auto p-6 transition-transform duration-700 group-hover:scale-[1.03]"
                />
            </div>
             
             {/* Overlay */}
             <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100 backdrop-blur-[2px]">
                <div className="bg-black/60 backdrop-blur-xl text-white px-5 py-2.5 rounded-full flex items-center gap-2 border border-white/10 shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    <ZoomIn size={16} />
                    <span className="text-xs font-bold uppercase tracking-wider">Expand</span>
                </div>
             </div>
        </div>
        
        <div className="mt-4 flex justify-between items-center px-2">
            <p className="text-xs text-gray-500 font-bold font-mono tracking-widest border-l-2 border-primary pl-3 uppercase">
            FIG: {alt}
            </p>
        </div>
      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/95 backdrop-blur-2xl"
              onClick={() => setIsOpen(false)}
            />
            
            <motion.div
                layoutId={`image-${src}`}
                className="relative max-w-[90vw] max-h-[90vh] z-10 bg-white rounded-lg overflow-hidden p-1 shadow-2xl shadow-primary/20"
                onClick={(e) => e.stopPropagation()}
            >
                <img 
                    src={src} 
                    alt={alt} 
                    className="w-full h-full object-contain rounded bg-white"
                />
            </motion.div>
            
            <button 
                className="absolute top-8 right-8 text-white bg-white/10 p-3 rounded-full hover:bg-white/20 transition-colors z-20 backdrop-blur-md border border-white/10"
                onClick={() => setIsOpen(false)}
            >
                <X size={24} />
            </button>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
