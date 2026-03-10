"""
后台任务定义
"""

import asyncio
from typing import List

from celery import shared_task
import structlog

from app.db.supabase import get_supabase_client
from app.services.grading import GradingService

logger = structlog.get_logger(__name__)


def run_async(coro):
    """在同步上下文中运行异步函数"""
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        return loop.run_until_complete(coro)
    finally:
        loop.close()


@shared_task(bind=True, max_retries=3)
def grade_submission(self, submission_id: str):
    """
    AI 批改单个答题
    """
    logger.info("Grading submission", submission_id=submission_id)
    
    try:
        result = run_async(_grade_submission_async(submission_id))
        return result
    except Exception as e:
        logger.error("Grading failed", submission_id=submission_id, error=str(e))
        self.retry(exc=e, countdown=60)


@shared_task(bind=True, max_retries=3)
def grade_submissions_batch(self, submission_ids: List[str]):
    """
    批量 AI 批改
    """
    logger.info("Batch grading", count=len(submission_ids))
    
    try:
        results = run_async(_grade_submissions_batch_async(submission_ids))
        return results
    except Exception as e:
        logger.error("Batch grading failed", error=str(e))
        self.retry(exc=e, countdown=60)


async def _grade_submission_async(submission_id: str) -> dict:
    """异步批改单个答题"""
    supabase = get_supabase_client()
    
    # 获取答题记录和题目信息
    submission = supabase.table("submissions").select(
        "*, questions(type, content, answer, rubric)"
    ).eq("id", submission_id).single().execute()
    
    if not submission.data:
        raise ValueError(f"Submission not found: {submission_id}")
    
    question = submission.data.get("questions", {})
    
    # 创建或获取批改记录
    grading = supabase.table("gradings").select("id").eq("submission_id", submission_id).single().execute()
    
    if not grading.data:
        grading = supabase.table("gradings").insert({
            "submission_id": submission_id,
            "status": "pending"
        }).execute()
        grading_id = grading.data[0]["id"]
    else:
        grading_id = grading.data["id"]
    
    # 调用 AI 批改
    grading_service = GradingService()
    result = await grading_service.grade(
        question_type=question["type"],
        question_content=question["content"],
        user_answer=submission.data["answer"],
        correct_answer=question.get("answer"),
        rubric=question.get("rubric"),
    )
    
    # 更新批改记录
    supabase.table("gradings").update({
        "ai_score": result.score,
        "ai_feedback": result.feedback,
        "ai_model": result.model,
        "ai_confidence": result.confidence,
        "ai_graded_at": "now()",
        "status": "ai_graded",
    }).eq("id", grading_id).execute()
    
    return {
        "submission_id": submission_id,
        "grading_id": grading_id,
        "score": result.score,
    }


async def _grade_submissions_batch_async(submission_ids: List[str]) -> List[dict]:
    """异步批量批改"""
    results = []
    for submission_id in submission_ids:
        try:
            result = await _grade_submission_async(submission_id)
            results.append(result)
        except Exception as e:
            logger.error("Failed to grade", submission_id=submission_id, error=str(e))
            results.append({"submission_id": submission_id, "error": str(e)})
    return results
