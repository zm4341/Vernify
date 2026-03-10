"""
课时 API
"""

from typing import List
from fastapi import APIRouter, HTTPException, status

from app.db.supabase import get_supabase_client
from app.models.course import Lesson, LessonCreate, LessonUpdate
from app.core.deps import OptionalUser, TeacherOrAdmin

router = APIRouter()


@router.get("/{lesson_id}", response_model=Lesson)
async def get_lesson(lesson_id: str, user: OptionalUser):
    """获取单个课时"""
    supabase = get_supabase_client()
    
    result = supabase.table("lessons").select("*, courses(status)").eq("id", lesson_id).single().execute()
    
    if not result.data:
        raise HTTPException(status_code=404, detail="Lesson not found")
    
    lesson = result.data
    course_status = lesson.get("courses", {}).get("status")
    
    # 权限检查
    if course_status != "published":
        if not user or user.role not in ("teacher", "admin"):
            raise HTTPException(status_code=404, detail="Lesson not found")
    
    # 移除嵌套的 courses 数据
    lesson.pop("courses", None)
    
    return lesson


@router.get("/{lesson_id}/questions")
async def get_lesson_questions(lesson_id: str, user: OptionalUser):
    """获取课时的所有题目"""
    supabase = get_supabase_client()
    
    # 先检查课时
    lesson = supabase.table("lessons").select("id, courses(status)").eq("id", lesson_id).single().execute()
    if not lesson.data:
        raise HTTPException(status_code=404, detail="Lesson not found")
    
    course_status = lesson.data.get("courses", {}).get("status")
    if course_status != "published":
        if not user or user.role not in ("teacher", "admin"):
            raise HTTPException(status_code=404, detail="Lesson not found")
    
    # 获取题目
    result = supabase.table("questions").select("*").eq("lesson_id", lesson_id).order("order_index").execute()
    
    # 对于学生，隐藏答案
    questions = result.data
    if not user or user.role == "student":
        for q in questions:
            q.pop("answer", None)
            q.pop("rubric", None)
    
    return questions


@router.post("/", response_model=Lesson, status_code=status.HTTP_201_CREATED)
async def create_lesson(lesson: LessonCreate, user: TeacherOrAdmin):
    """创建课时 (教师/管理员)"""
    supabase = get_supabase_client()
    
    # 检查课程是否存在
    course = supabase.table("courses").select("id").eq("id", lesson.course_id).single().execute()
    if not course.data:
        raise HTTPException(status_code=404, detail="Course not found")
    
    data = lesson.model_dump()
    result = supabase.table("lessons").insert(data).execute()
    
    return result.data[0]


@router.patch("/{lesson_id}", response_model=Lesson)
async def update_lesson(lesson_id: str, lesson: LessonUpdate, user: TeacherOrAdmin):
    """更新课时 (教师/管理员)"""
    supabase = get_supabase_client()
    
    # 检查课时是否存在
    existing = supabase.table("lessons").select("id").eq("id", lesson_id).single().execute()
    if not existing.data:
        raise HTTPException(status_code=404, detail="Lesson not found")
    
    data = lesson.model_dump(exclude_unset=True)
    result = supabase.table("lessons").update(data).eq("id", lesson_id).execute()
    
    return result.data[0]


@router.delete("/{lesson_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_lesson(lesson_id: str, user: TeacherOrAdmin):
    """删除课时 (教师/管理员)"""
    supabase = get_supabase_client()
    
    supabase.table("lessons").delete().eq("id", lesson_id).execute()
