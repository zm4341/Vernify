"""
API v1 路由聚合
"""

from fastapi import APIRouter

from app.api.v1 import courses, lessons, quiz, grading, users

api_router = APIRouter()

api_router.include_router(courses.router, prefix="/courses", tags=["courses"])
api_router.include_router(lessons.router, prefix="/lessons", tags=["lessons"])
api_router.include_router(quiz.router, prefix="/quiz", tags=["quiz"])
api_router.include_router(grading.router, prefix="/grading", tags=["grading"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
