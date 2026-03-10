"""
批改服务
封装 LLM 批改逻辑
"""

from typing import Any, Optional

import structlog

from app.services.llm import get_llm_adapter, GradingResult

logger = structlog.get_logger(__name__)


class GradingService:
    """批改服务"""
    
    def __init__(self, llm_provider: Optional[str] = None):
        """
        初始化批改服务
        
        Args:
            llm_provider: 指定 LLM 提供商，不指定则使用默认配置
        """
        self.llm = get_llm_adapter(llm_provider)
        logger.info("GradingService initialized", provider=self.llm.name)
    
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
            question_type: 题目类型
            question_content: 题目内容
            user_answer: 用户答案
            correct_answer: 标准答案
            rubric: 评分规则
            max_points: 最高分值
            
        Returns:
            GradingResult: 批改结果
        """
        logger.info(
            "Grading answer",
            question_type=question_type,
            llm=self.llm.name,
        )
        
        # 根据题型选择批改策略
        if question_type == "fill_blank":
            return await self._grade_fill_blank(
                question_content, user_answer, correct_answer, rubric, max_points
            )
        elif question_type == "essay":
            return await self._grade_essay(
                question_content, user_answer, rubric, max_points
            )
        elif question_type in ("drawing", "geogebra"):
            return await self._grade_drawing(
                question_content, user_answer, rubric, max_points
            )
        else:
            # 通用批改
            return await self.llm.grade(
                question_type=question_type,
                question_content=question_content,
                user_answer=user_answer,
                correct_answer=correct_answer,
                rubric=rubric,
                max_points=max_points,
            )
    
    async def _grade_fill_blank(
        self,
        question_content: dict,
        user_answer: dict,
        correct_answer: Optional[dict],
        rubric: Optional[dict],
        max_points: int,
    ) -> GradingResult:
        """填空题批改"""
        # 如果有标准答案，先尝试精确匹配
        if correct_answer:
            expected = correct_answer.get("text", "")
            actual = user_answer.get("text", "")
            
            # 标准化比较（去除空格、统一大小写）
            expected_normalized = expected.strip().lower()
            actual_normalized = actual.strip().lower()
            
            if expected_normalized == actual_normalized:
                return GradingResult(
                    score=max_points,
                    feedback="回答正确！",
                    confidence=1.0,
                    model="exact_match",
                )
        
        # 精确匹配失败，使用 LLM 判断
        return await self.llm.grade(
            question_type="fill_blank",
            question_content=question_content,
            user_answer=user_answer,
            correct_answer=correct_answer,
            rubric=rubric,
            max_points=max_points,
        )
    
    async def _grade_essay(
        self,
        question_content: dict,
        user_answer: dict,
        rubric: Optional[dict],
        max_points: int,
    ) -> GradingResult:
        """简答题批改"""
        return await self.llm.grade(
            question_type="essay",
            question_content=question_content,
            user_answer=user_answer,
            rubric=rubric or {
                "criteria": [
                    {"name": "内容完整性", "weight": 0.4},
                    {"name": "表达清晰度", "weight": 0.3},
                    {"name": "逻辑严谨性", "weight": 0.3},
                ]
            },
            max_points=max_points,
        )
    
    async def _grade_drawing(
        self,
        question_content: dict,
        user_answer: dict,
        rubric: Optional[dict],
        max_points: int,
    ) -> GradingResult:
        """作图题批改"""
        # 作图题通常需要人工复核
        # AI 只做初步判断
        result = await self.llm.grade(
            question_type="drawing",
            question_content=question_content,
            user_answer=user_answer,
            rubric=rubric or {
                "criteria": [
                    {"name": "图形准确性", "weight": 0.5},
                    {"name": "标注完整性", "weight": 0.3},
                    {"name": "作图规范性", "weight": 0.2},
                ]
            },
            max_points=max_points,
        )
        
        # 降低置信度，提示需要人工复核
        result.confidence = min(result.confidence, 0.7)
        result.feedback += "\n\n⚠️ 作图题建议人工复核"
        
        return result
