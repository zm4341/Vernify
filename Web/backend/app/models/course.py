"""
课程相关模型
"""

from datetime import datetime
from typing import Any, Optional, List
from pydantic import BaseModel


class CourseBase(BaseModel):
    """课程基础模型"""
    title: str
    slug: str
    description: Optional[str] = None
    cover_image: Optional[str] = None
    status: str = "draft"
    metadata: Optional[dict[str, Any]] = None


class Course(CourseBase):
    """课程完整模型"""
    id: str
    created_at: datetime
    updated_at: datetime
    created_by: Optional[str] = None


class CourseCreate(CourseBase):
    """创建课程"""
    pass


class CourseUpdate(BaseModel):
    """更新课程"""
    title: Optional[str] = None
    description: Optional[str] = None
    cover_image: Optional[str] = None
    status: Optional[str] = None
    metadata: Optional[dict[str, Any]] = None


class LessonBase(BaseModel):
    """课时基础模型"""
    slug: str
    title: str
    description: Optional[str] = None
    duration: Optional[str] = None
    order_index: int = 0
    metadata: Optional[dict[str, Any]] = None


class Lesson(LessonBase):
    """课时完整模型"""
    id: str
    course_id: str
    content: Optional[dict[str, Any]] = None
    content_source: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None


class LessonCreate(LessonBase):
    """创建课时"""
    course_id: str
    content: Optional[dict[str, Any]] = None
    content_source: Optional[str] = None


class LessonUpdate(BaseModel):
    """更新课时"""
    title: Optional[str] = None
    description: Optional[str] = None
    content: Optional[dict[str, Any]] = None
    content_source: Optional[str] = None
    duration: Optional[str] = None
    order_index: Optional[int] = None
    metadata: Optional[dict[str, Any]] = None


class QuestionBase(BaseModel):
    """题目基础模型"""
    type: str  # choice, multi_choice, fill_blank, drawing, essay, geogebra
    content: dict[str, Any]
    answer: Optional[dict[str, Any]] = None
    rubric: Optional[dict[str, Any]] = None
    points: int = 0
    order_index: int = 0
    metadata: Optional[dict[str, Any]] = None


class Question(QuestionBase):
    """题目完整模型"""
    id: str
    lesson_id: str
    created_at: datetime


class QuestionCreate(QuestionBase):
    """创建题目"""
    lesson_id: str


class QuestionUpdate(BaseModel):
    """更新题目"""
    content: Optional[dict[str, Any]] = None
    answer: Optional[dict[str, Any]] = None
    rubric: Optional[dict[str, Any]] = None
    points: Optional[int] = None
    order_index: Optional[int] = None
    metadata: Optional[dict[str, Any]] = None
