"""
Vernify AI Service - FastAPI 主入口
专注于 AI 批改和扩展能力
"""

from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import structlog

from app.core.config import settings
from app.api.v1.ai import router as ai_router
from app.api.v1.latex import router as latex_router
from app.extensions import load_extensions

# 配置日志
structlog.configure(
    processors=[
        structlog.stdlib.filter_by_level,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.stdlib.PositionalArgumentsFormatter(),
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        structlog.processors.UnicodeDecoder(),
        structlog.dev.ConsoleRenderer() if settings.DEBUG else structlog.processors.JSONRenderer(),
    ],
    wrapper_class=structlog.stdlib.BoundLogger,
    context_class=dict,
    logger_factory=structlog.stdlib.LoggerFactory(),
    cache_logger_on_first_use=True,
)

logger = structlog.get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """应用生命周期管理"""
    logger.info("Starting Vernify AI Service", version=settings.VERSION)
    
    # 加载扩展
    await load_extensions(app)
    
    yield
    
    logger.info("Shutting down Vernify AI Service")


# 创建 FastAPI 应用
app = FastAPI(
    title="Vernify AI Service",
    description="AI 批改和扩展能力服务",
    version=settings.VERSION,
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
    openapi_url="/openapi.json" if settings.DEBUG else None,
    lifespan=lifespan,
)

# CORS 中间件
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # AI 服务内部使用
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# 健康检查
@app.get("/health")
async def health_check():
    """健康检查端点"""
    return {
        "status": "healthy",
        "service": "ai",
        "version": settings.VERSION,
    }


# AI 路由 - /api/v1/ai/*
app.include_router(ai_router, prefix="/api/v1/ai", tags=["AI"])

# LaTeX 同步路由 - /api/v1/latex/*
app.include_router(latex_router, prefix="/api/v1/latex", tags=["LaTeX"])


if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
    )
