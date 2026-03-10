"""
答题 API
"""

from typing import List
from fastapi import APIRouter, HTTPException, status, BackgroundTasks

from app.db.supabase import get_supabase_client
from app.models.submission import Submission, SubmissionCreate, SubmissionBatch
from app.core.deps import CurrentUser

router = APIRouter()


@router.post("/submit", response_model=Submission)
async def submit_answer(
    submission: SubmissionCreate,
    user: CurrentUser,
    background_tasks: BackgroundTasks,
):
    """提交单题答案"""
    supabase = get_supabase_client()
    
    # 检查题目是否存在
    question = supabase.table("questions").select("id, type, answer").eq("id", submission.question_id).single().execute()
    if not question.data:
        raise HTTPException(status_code=404, detail="Question not found")
    
    # 判断是否正确 (仅选择题)
    is_correct = None
    if question.data["type"] in ("choice", "multi_choice"):
        correct_answer = question.data.get("answer", {}).get("correct")
        user_answer = submission.answer.get("selected")
        is_correct = correct_answer == user_answer
    
    # 插入或更新答题记录
    data = {
        "user_id": user.id,
        "question_id": submission.question_id,
        "lesson_id": submission.lesson_id,
        "course_id": submission.course_id,
        "answer": submission.answer,
        "is_correct": is_correct,
    }
    
    result = supabase.table("submissions").upsert(
        data,
        on_conflict="user_id,question_id"
    ).execute()
    
    # 对于主观题，触发 AI 批改 (后台任务)
    if question.data["type"] in ("fill_blank", "essay", "drawing", "geogebra"):
        from app.workers.tasks import grade_submission
        background_tasks.add_task(grade_submission, result.data[0]["id"])
    
    return result.data[0]


@router.post("/submit-batch", response_model=List[Submission])
async def submit_batch(
    batch: SubmissionBatch,
    user: CurrentUser,
    background_tasks: BackgroundTasks,
):
    """批量提交答案"""
    supabase = get_supabase_client()
    
    # 获取所有相关题目
    question_ids = [s.question_id for s in batch.answers]
    questions = supabase.table("questions").select("id, type, answer").in_("id", question_ids).execute()
    question_map = {q["id"]: q for q in questions.data}
    
    submissions = []
    subjective_submission_ids = []
    
    for answer in batch.answers:
        question = question_map.get(answer.question_id)
        if not question:
            continue
        
        # 判断是否正确
        is_correct = None
        if question["type"] in ("choice", "multi_choice"):
            correct_answer = question.get("answer", {}).get("correct")
            user_answer = answer.answer.get("selected")
            is_correct = correct_answer == user_answer
        
        data = {
            "user_id": user.id,
            "question_id": answer.question_id,
            "lesson_id": batch.lesson_id,
            "course_id": batch.course_id,
            "answer": answer.answer,
            "is_correct": is_correct,
        }
        
        result = supabase.table("submissions").upsert(
            data,
            on_conflict="user_id,question_id"
        ).execute()
        
        if result.data:
            submissions.append(result.data[0])
            
            # 收集需要 AI 批改的题目
            if question["type"] in ("fill_blank", "essay", "drawing", "geogebra"):
                subjective_submission_ids.append(result.data[0]["id"])
    
    # 批量触发 AI 批改
    if subjective_submission_ids:
        from app.workers.tasks import grade_submissions_batch
        background_tasks.add_task(grade_submissions_batch, subjective_submission_ids)
    
    return submissions


@router.get("/my-submissions/{lesson_id}")
async def get_my_submissions(lesson_id: str, user: CurrentUser):
    """获取我在某课时的所有答题记录"""
    supabase = get_supabase_client()
    
    result = supabase.table("submissions").select(
        "*, gradings(*)"
    ).eq("user_id", user.id).eq("lesson_id", lesson_id).execute()
    
    return result.data


@router.get("/progress/{course_id}")
async def get_course_progress(course_id: str, user: CurrentUser):
    """获取课程学习进度"""
    supabase = get_supabase_client()
    
    # 获取进度记录
    progress = supabase.table("progress").select("*").eq("user_id", user.id).eq("course_id", course_id).execute()
    
    # 获取课程总课时数
    lessons = supabase.table("lessons").select("id").eq("course_id", course_id).execute()
    
    total_lessons = len(lessons.data)
    completed_lessons = len([p for p in progress.data if p["completed"]])
    
    return {
        "total_lessons": total_lessons,
        "completed_lessons": completed_lessons,
        "progress_percentage": (completed_lessons / total_lessons * 100) if total_lessons > 0 else 0,
        "lessons": progress.data,
    }
