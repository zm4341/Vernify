"""
答题和批改模型
"""

from datetime import datetime
from typing import Any, Optional
from pydantic import BaseModel


class SubmissionBase(BaseModel):
    """答题记录基础模型"""
    question_id: str
    answer: dict[str, Any]


class Submission(SubmissionBase):
    """答题记录完整模型"""
    id: str
    user_id: str
    lesson_id: str
    course_id: str
    is_correct: Optional[bool] = None
    submitted_at: datetime


class SubmissionCreate(SubmissionBase):
    """创建答题记录"""
    lesson_id: str
    course_id: str


class SubmissionBatch(BaseModel):
    """批量提交答案"""
    lesson_id: str
    course_id: str
    answers: list[SubmissionBase]


class GradingBase(BaseModel):
    """批改记录基础模型"""
    submission_id: str


class Grading(GradingBase):
    """批改记录完整模型"""
    id: str
    
    # AI 批改
    ai_score: Optional[float] = None
    ai_feedback: Optional[str] = None
    ai_model: Optional[str] = None
    ai_confidence: Optional[float] = None
    ai_graded_at: Optional[datetime] = None
    
    # 人工复核
    human_score: Optional[float] = None
    human_feedback: Optional[str] = None
    human_reviewer_id: Optional[str] = None
    human_reviewed_at: Optional[datetime] = None
    
    # 最终分数
    final_score: Optional[float] = None
    
    status: str = "pending"
    created_at: datetime
    updated_at: Optional[datetime] = None


class GradingCreate(GradingBase):
    """创建批改记录"""
    pass


class GradingReview(BaseModel):
    """人工复核"""
    human_score: float
    human_feedback: Optional[str] = None


class GradingResult(BaseModel):
    """批改结果 (用于 API 响应)"""
    score: float
    feedback: str
    confidence: float = 1.0
    model: Optional[str] = None
