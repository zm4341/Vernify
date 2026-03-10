"use client";

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plyr, APITypes } from 'plyr-react';
import 'plyr-react/plyr.css';
import { X, Play } from 'lucide-react';

interface ManimPlayerProps {
  src: string;
  title?: string;
}

export const ManimPlayer: React.FC<ManimPlayerProps> = ({ src, title }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<APITypes>(null);

  // Custom styling for Plyr using CSS variables
  const plyrStyle = {
    "--plyr-color-main": "#7000FF", // Primary Color
    "--plyr-video-background": "transparent",
    borderRadius: "0.75rem",
    overflow: "hidden",
  } as React.CSSProperties;

  return (
    <>
      <motion.div
        layoutId={`video-container-${src}`}
        className="relative w-full max-w-4xl mx-auto my-16 cursor-pointer rounded-2xl overflow-hidden shadow-2xl bg-surface aspect-video group border border-white/5"
        onClick={() => setIsOpen(true)}
        whileHover={{ scale: 1.01 }}
        transition={{ duration: 0.4 }}
      >
         {/* Ambient Glow */}
         <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-2xl blur opacity-10 group-hover:opacity-30 transition duration-1000 group-hover:duration-200"></div>
         
         <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
            {/* Play Button Overlay */}
            <motion.div 
                whileHover={{ scale: 1.1 }}
                className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 shadow-lg group-hover:bg-primary/90 group-hover:border-primary transition-colors"
            >
              <Play fill="white" className="text-white ml-1" size={32} />
            </motion.div>
         </div>
         
         {/* Preview / Thumbnail Video (Muted, Loop or Static) */}
         <video 
           src={src} 
           className="relative w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity rounded-2xl"
           muted
           playsInline
         />
         
         {title && (
           <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black/80 to-transparent rounded-b-2xl backdrop-blur-[2px]">
             <div className="flex items-center gap-2 mb-1">
                 <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                 <span className="text-[10px] font-bold tracking-widest text-gray-400 uppercase font-heading">Manim Simulation</span>
             </div>
             <h3 className="text-white font-heading font-bold text-lg">{title}</h3>
           </div>
         )}
      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/90 backdrop-blur-xl"
              onClick={() => setIsOpen(false)}
            />
            
            <motion.div
              layoutId={`video-container-${src}`}
              className="relative w-full max-w-6xl bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 z-20 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors backdrop-blur-md"
              >
                <X size={24} />
              </button>
              
              <div style={plyrStyle} className="plyr-wrapper">
                <Plyr
                  ref={ref}
                  source={{
                    type: 'video',
                    sources: [{ src, provider: 'html5' }],
                  }}
                  options={{
                    autoplay: true,
                    speed: { selected: 1, options: [0.5, 0.75, 1, 1.25, 1.5, 2] },
                  }}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
