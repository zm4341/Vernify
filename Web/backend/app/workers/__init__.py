"""
Celery 后台任务
"""

from celery import Celery

from app.core.config import settings

# 创建 Celery 应用
celery_app = Celery(
    "vernify",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
)

# 配置
celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=300,  # 5 分钟超时
)

# 自动发现任务
celery_app.autodiscover_tasks(["app.workers"])
