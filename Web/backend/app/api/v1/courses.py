"""
课程 API
"""

from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query, status

from app.db.supabase import get_supabase_client
from app.models.course import Course, CourseCreate, CourseUpdate
from app.core.deps import CurrentUser, OptionalUser, TeacherOrAdmin

router = APIRouter()


@router.get("/", response_model=List[Course])
async def list_courses(
    user: OptionalUser,
    status: Optional[str] = Query(None, description="Filter by status"),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
):
    """获取课程列表"""
    supabase = get_supabase_client()
    
    query = supabase.table("courses").select("*")
    
    # 未登录或普通用户只能看已发布课程
    if not user or user.role == "student":
        query = query.eq("status", "published")
    elif status:
        query = query.eq("status", status)
    
    result = query.order("created_at", desc=True).range(offset, offset + limit - 1).execute()
    
    return result.data


@router.get("/{course_id}", response_model=Course)
async def get_course(course_id: str, user: OptionalUser):
    """获取单个课程"""
    supabase = get_supabase_client()
    
    result = supabase.table("courses").select("*").eq("id", course_id).single().execute()
    
    if not result.data:
        raise HTTPException(status_code=404, detail="Course not found")
    
    course = result.data
    
    # 权限检查
    if course["status"] != "published":
        if not user or user.role not in ("teacher", "admin"):
            raise HTTPException(status_code=404, detail="Course not found")
    
    return course


@router.post("/", response_model=Course, status_code=status.HTTP_201_CREATED)
async def create_course(course: CourseCreate, user: TeacherOrAdmin):
    """创建课程 (教师/管理员)"""
    supabase = get_supabase_client()
    
    data = course.model_dump()
    data["created_by"] = user.id
    
    result = supabase.table("courses").insert(data).execute()
    
    return result.data[0]


@router.patch("/{course_id}", response_model=Course)
async def update_course(course_id: str, course: CourseUpdate, user: TeacherOrAdmin):
    """更新课程 (教师/管理员)"""
    supabase = get_supabase_client()
    
    # 检查课程是否存在
    existing = supabase.table("courses").select("id").eq("id", course_id).single().execute()
    if not existing.data:
        raise HTTPException(status_code=404, detail="Course not found")
    
    data = course.model_dump(exclude_unset=True)
    result = supabase.table("courses").update(data).eq("id", course_id).execute()
    
    return result.data[0]


@router.delete("/{course_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_course(course_id: str, user: TeacherOrAdmin):
    """删除课程 (教师/管理员)"""
    supabase = get_supabase_client()
    
    supabase.table("courses").delete().eq("id", course_id).execute()


@router.get("/{course_id}/lessons")
async def get_course_lessons(course_id: str, user: OptionalUser):
    """获取课程的所有课时"""
    supabase = get_supabase_client()
    
    # 先检查课程
    course = supabase.table("courses").select("status").eq("id", course_id).single().execute()
    if not course.data:
        raise HTTPException(status_code=404, detail="Course not found")
    
    if course.data["status"] != "published":
        if not user or user.role not in ("teacher", "admin"):
            raise HTTPException(status_code=404, detail="Course not found")
    
    # 获取课时
    result = supabase.table("lessons").select("*").eq("course_id", course_id).order("order_index").execute()
    
    return result.data
