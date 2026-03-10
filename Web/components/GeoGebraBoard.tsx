"use client";

import React, { useRef, useState, useEffect } from 'react';
import Script from 'next/script';
import { Compass, Pencil, Circle, Move } from 'lucide-react';

declare global {
  interface Window {
    GGBApplet: any;
    ggbAppletReady?: (id: string) => void;
  }
}

interface GeoGebraBoardProps {
  materialId?: string;       // 可选：加载已有的素材
  appType?: 'geometry' | 'graphing' | 'classic';  // 应用类型
  width?: number;
  height?: number;
  showToolBar?: boolean;
  showMenuBar?: boolean;
  showAlgebraInput?: boolean;
  enableLabelDrags?: boolean;
}

// 全局计数器确保 ID 唯一
let geogebraCounter = 0;

export const GeoGebraBoard: React.FC<GeoGebraBoardProps> = ({ 
  materialId,
  appType = 'geometry',
  width = 800,
  height = 500,
  showToolBar = true,
  showMenuBar = false,
  showAlgebraInput = false,
  enableLabelDrags = true
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [initAttempted, setInitAttempted] = useState(false);
  const [appletId] = useState(() => `ggb_applet_${++geogebraCounter}`);

  // 初始化 GeoGebra 应用
  useEffect(() => {
    if (!scriptLoaded || initAttempted) return;

    // 确保容器 DOM 存在
    const container = document.getElementById(appletId);
    if (!container) {
      console.log('等待容器 DOM...');
      return;
    }

    let retryCount = 0;
    const maxRetries = 50; // 最多重试 5 秒

    const initGeoGebra = () => {
      if (typeof window.GGBApplet === 'undefined') {
        retryCount++;
        if (retryCount < maxRetries) {
          setTimeout(initGeoGebra, 100);
        } else {
          console.error('GeoGebra 加载超时');
        }
        return;
      }

      console.log('开始初始化 GeoGebra，容器 ID:', appletId);
      setInitAttempted(true);

      const params: any = {
        appName: appType,
        width: width,
        height: height,
        showToolBar: showToolBar,
        showMenuBar: showMenuBar,
        showAlgebraInput: showAlgebraInput,
        showResetIcon: true,
        enableLabelDrags: enableLabelDrags,
        enableShiftDragZoom: true,
        enableRightClick: true,
        errorDialogsActive: false,
        useBrowserForJS: true,
        allowStyleBar: true,
        preventFocus: false,
        showZoomButtons: true,
        capturingThreshold: 3,
        showFullscreenButton: true,
        scale: 1,
        disableAutoScale: false,
        allowUpscale: true,
        clickToLoad: false,
        appletOnLoad: function() {
          console.log('GeoGebra appletOnLoad 回调触发');
          setIsReady(true);
        },
        language: 'zh-CN',
      };

      // 如果有 materialId，加载素材
      if (materialId) {
        params.material_id = materialId;
      }

      try {
        const applet = new window.GGBApplet(params, true);
        
        // 设置本地托管的 HTML5 代码库路径
        applet.setHTML5Codebase('/lib/geogebra/GeoGebra/HTML5/5.0/web3d/');
        
        console.log('注入到容器:', appletId);
        applet.inject(appletId);
        
        // 备用：如果 appletOnLoad 没有触发，5秒后自动设置 ready
        setTimeout(() => {
          setIsReady(prev => {
            if (!prev) {
              console.log('备用超时设置 ready');
              return true;
            }
            return prev;
          });
        }, 5000);
        
      } catch (error) {
        console.error('GeoGebra 初始化失败:', error);
      }
    };

    initGeoGebra();
  }, [scriptLoaded, appletId, materialId, appType, width, height, showToolBar, showMenuBar, showAlgebraInput, enableLabelDrags, initAttempted]);

  return (
    <>
      {/* 加载本地托管的 deployggb.js */}
      <Script 
        src="/lib/geogebra/GeoGebra/deployggb.js"
        onLoad={() => {
          console.log('deployggb.js 脚本加载完成');
          setScriptLoaded(true);
        }}
        onError={(e) => {
          console.error('deployggb.js 加载失败:', e);
        }}
        strategy="afterInteractive"
      />

      <div 
        ref={containerRef}
        className="w-full max-w-4xl mx-auto my-8"
      >
        {/* 标题栏 */}
        <div className="flex items-center gap-3 mb-4 px-1">
          <div className="p-2 bg-primary/20 rounded-lg">
            <Compass size={20} className="text-primary" />
          </div>
          <div>
            <h4 className="font-heading font-bold text-white">GeoGebra 作图区域</h4>
            <p className="text-xs text-gray-500">使用工具栏绘制圆形 · 可拖拽调整</p>
          </div>
        </div>

        {/* 作图区域 */}
        <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-white">
          {/* 加载指示器 */}
          {!isReady && (
            <div className="absolute inset-0 z-10 flex items-center justify-center flex-col gap-4 bg-surface/90 backdrop-blur-sm">
              <div className="flex gap-2">
                <Circle size={24} className="text-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                <Pencil size={24} className="text-secondary animate-bounce" style={{ animationDelay: '150ms' }} />
                <Move size={24} className="text-accent animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="text-sm font-medium text-gray-400">正在加载作图工具...</span>
            </div>
          )}

          {/* GeoGebra 容器 */}
          <div 
            id={appletId}
            className="w-full"
            style={{ minHeight: height }}
          />
        </div>

        {/* 提示信息 */}
        <div className="mt-4 flex flex-wrap gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1.5">
            <Circle size={12} className="text-primary" />
            点击"圆"工具绘制圆形
          </span>
          <span className="flex items-center gap-1.5">
            <Pencil size={12} className="text-secondary" />
            标注圆心O、半径r、直径d
          </span>
          <span className="flex items-center gap-1.5">
            <Move size={12} className="text-accent" />
            拖拽可调整位置和大小
          </span>
        </div>
      </div>
    </>
  );
};
