"""
LLM 适配器基类
"""

from abc import ABC, abstractmethod
from typing import Any, Optional
from pydantic import BaseModel


class GradingResult(BaseModel):
    """批改结果"""
    score: float  # 得分 (0-100 或 0-题目分值)
    feedback: str  # 反馈意见
    confidence: float = 1.0  # 置信度 (0-1)
    model: Optional[str] = None  # 使用的模型
    raw_response: Optional[dict] = None  # 原始响应 (调试用)


class LLMAdapter(ABC):
    """
    LLM 适配器抽象基类
    
    所有 LLM 提供商适配器必须实现此接口
    """
    
    name: str = "base"
    
    @abstractmethod
    async def grade(
        self,
        question_type: str,
        question_content: dict[str, Any],
        user_answer: dict[str, Any],
        correct_answer: Optional[dict[str, Any]] = None,
        rubric: Optional[dict[str, Any]] = None,
        max_points: int = 100,
    ) -> GradingResult:
        """
        批改答题
        
        Args:
            question_type: 题目类型 (fill_blank, essay, drawing, geogebra)
            question_content: 题目内容
            user_answer: 用户答案
            correct_answer: 标准答案 (可选)
            rubric: 评分规则 (可选)
            max_points: 最高分值
            
        Returns:
            GradingResult: 批改结果
        """
        pass
    
    @abstractmethod
    async def chat(
        self,
        messages: list[dict[str, str]],
        system_prompt: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 1000,
    ) -> str:
        """
        通用聊天接口
        
        Args:
            messages: 消息列表 [{"role": "user", "content": "..."}]
            system_prompt: 系统提示词
            temperature: 温度参数
            max_tokens: 最大输出 token 数
            
        Returns:
            str: 模型响应
        """
        pass
    
    def _build_grading_prompt(
        self,
        question_type: str,
        question_content: dict[str, Any],
        user_answer: dict[str, Any],
        correct_answer: Optional[dict[str, Any]] = None,
        rubric: Optional[dict[str, Any]] = None,
        max_points: int = 100,
    ) -> str:
        """
        构建批改提示词
        """
        prompt = f"""你是一位专业的数学教师，正在批改学生的答题。

## 题目类型
{question_type}

## 题目内容
{question_content}

## 学生答案
{user_answer}

"""
        if correct_answer:
            prompt += f"""## 标准答案
{correct_answer}

"""
        
        if rubric:
            prompt += f"""## 评分标准
{rubric}

"""
        
        prompt += f"""## 要求
1. 根据学生答案进行评分，满分为 {max_points} 分
2. 提供详细的批改反馈，指出正确和错误之处
3. 如果是部分正确，按比例给分
4. 反馈要用鼓励性的语言，适合小学生理解

## 输出格式
请严格按以下 JSON 格式输出：
{{
    "score": <分数>,
    "feedback": "<批改反馈>",
    "confidence": <置信度 0-1>
}}
"""
        return prompt
