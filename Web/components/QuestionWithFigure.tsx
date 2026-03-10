"use client";

import React, { Children, isValidElement, cloneElement } from 'react';
import { DraggableImage } from './DraggableImage';

interface QuestionWithFigureProps {
  children: React.ReactNode;
  figure: string;  // Image src
  figureAlt?: string;
}

export const QuestionWithFigure: React.FC<QuestionWithFigureProps> = ({ 
  children, 
  figure, 
  figureAlt = "题目配图",
}) => {
  // 将 children 转换为数组
  const childArray = Children.toArray(children);
  
  // 找到第一个元素（通常是题目标题）
  const firstChild = childArray[0];
  const restChildren = childArray.slice(1);

  return (
    <div className="my-4">
      {/* 第一行：题目标题 + 图标 */}
      <div className="flex items-center gap-2">
        <div className="inline">{firstChild}</div>
        <DraggableImage 
          src={figure} 
          alt={figureAlt}
          iconOnly
        />
      </div>
      {/* 剩余内容 */}
      {restChildren}
    </div>
  );
};
