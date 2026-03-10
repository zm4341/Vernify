"""
批改 API
"""

from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query, status

from app.db.supabase import get_supabase_client
from app.models.submission import Grading, GradingReview
from app.core.deps import CurrentUser, TeacherOrAdmin

router = APIRouter()


@router.get("/pending", response_model=List[Grading])
async def list_pending_gradings(
    user: TeacherOrAdmin,
    course_id: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
):
    """获取待人工复核的批改记录 (教师/管理员)"""
    supabase = get_supabase_client()
    
    query = supabase.table("gradings").select(
        "*, submissions(*, questions(content, type), profiles:user_id(display_name, username))"
    ).eq("status", "ai_graded")
    
    if course_id:
        query = query.eq("submissions.course_id", course_id)
    
    result = query.order("created_at").range(offset, offset + limit - 1).execute()
    
    return result.data


@router.get("/{grading_id}", response_model=Grading)
async def get_grading(grading_id: str, user: CurrentUser):
    """获取批改详情"""
    supabase = get_supabase_client()
    
    result = supabase.table("gradings").select(
        "*, submissions(user_id, question_id, answer)"
    ).eq("id", grading_id).single().execute()
    
    if not result.data:
        raise HTTPException(status_code=404, detail="Grading not found")
    
    grading = result.data
    submission = grading.get("submissions", {})
    
    # 权限检查：学生只能看自己的
    if user.role == "student" and submission.get("user_id") != user.id:
        raise HTTPException(status_code=403, detail="Permission denied")
    
    return grading


@router.post("/{grading_id}/review", response_model=Grading)
async def review_grading(grading_id: str, review: GradingReview, user: TeacherOrAdmin):
    """人工复核批改 (教师/管理员)"""
    supabase = get_supabase_client()
    
    # 检查批改记录是否存在
    existing = supabase.table("gradings").select("id, status").eq("id", grading_id).single().execute()
    if not existing.data:
        raise HTTPException(status_code=404, detail="Grading not found")
    
    # 更新批改记录
    data = {
        "human_score": review.human_score,
        "human_feedback": review.human_feedback,
        "human_reviewer_id": user.id,
        "human_reviewed_at": "now()",
        "status": "human_reviewed",
    }
    
    result = supabase.table("gradings").update(data).eq("id", grading_id).execute()
    
    return result.data[0]


@router.post("/{grading_id}/dispute")
async def dispute_grading(grading_id: str, reason: str, user: CurrentUser):
    """申诉批改结果"""
    supabase = get_supabase_client()
    
    # 检查批改记录是否存在且属于当前用户
    result = supabase.table("gradings").select(
        "id, status, submissions(user_id)"
    ).eq("id", grading_id).single().execute()
    
    if not result.data:
        raise HTTPException(status_code=404, detail="Grading not found")
    
    if result.data.get("submissions", {}).get("user_id") != user.id:
        raise HTTPException(status_code=403, detail="Permission denied")
    
    # 更新状态为申诉中
    supabase.table("gradings").update({
        "status": "disputed",
    }).eq("id", grading_id).execute()
    
    return {"message": "Dispute submitted"}


@router.get("/stats/{course_id}")
async def get_grading_stats(course_id: str, user: TeacherOrAdmin):
    """获取课程批改统计 (教师/管理员)"""
    supabase = get_supabase_client()
    
    # 获取所有批改记录
    result = supabase.table("gradings").select(
        "status, final_score, submissions!inner(course_id)"
    ).eq("submissions.course_id", course_id).execute()
    
    gradings = result.data
    
    # 统计
    total = len(gradings)
    pending = len([g for g in gradings if g["status"] == "pending"])
    ai_graded = len([g for g in gradings if g["status"] == "ai_graded"])
    human_reviewed = len([g for g in gradings if g["status"] == "human_reviewed"])
    disputed = len([g for g in gradings if g["status"] == "disputed"])
    
    scores = [g["final_score"] for g in gradings if g["final_score"] is not None]
    avg_score = sum(scores) / len(scores) if scores else 0
    
    return {
        "total": total,
        "pending": pending,
        "ai_graded": ai_graded,
        "human_reviewed": human_reviewed,
        "disputed": disputed,
        "average_score": round(avg_score, 2),
    }
