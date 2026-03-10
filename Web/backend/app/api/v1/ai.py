"""
AI 服务 API 端点
提供 AI 批改、对话、Embedding、Rerank（RAG 预留）等能力。
路由层只做 HTTP 与参数校验，业务委托给 app.services.ai_service。
"""

import json
from typing import Any, Optional

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import structlog

from app.services.ai_service import get_ai_service

logger = structlog.get_logger(__name__)

router = APIRouter()


# ==================== 数据模型 ====================

class GradeRequest(BaseModel):
    """批改请求"""
    submission_id: Optional[str] = None
    question_type: str
    question_content: dict[str, Any]
    user_answer: dict[str, Any]
    correct_answer: Optional[dict[str, Any]] = None
    rubric: Optional[dict[str, Any]] = None
    max_points: int = 100


class GradeResponse(BaseModel):
    """批改响应"""
    submission_id: Optional[str]
    score: int
    feedback: str
    reasoning: Optional[str] = None


class ChatRequest(BaseModel):
    """对话请求"""
    messages: list[dict[str, str]]
    system_prompt: Optional[str] = None
    temperature: float = 0.7
    max_tokens: int = 1000
    model: Optional[str] = None


class ChatResponse(BaseModel):
    """对话响应"""
    content: str
    model: str


class ModelsResponse(BaseModel):
    """可用模型列表"""
    default_model: str
    providers: list[str]
    models: list[dict]


class OpenAIChatMessage(BaseModel):
    """OpenAI 风格单条消息"""
    role: str
    content: str


class OpenAICompletionsRequest(BaseModel):
    """OpenAI 兼容的 chat completions 请求（用于流式）"""
    model: Optional[str] = None
    messages: list[OpenAIChatMessage]
    stream: bool = True
    temperature: float = 0.7
    max_tokens: int = 1000


# ---------- RAG 预留：Embedding / Rerank ----------

class EmbedRequest(BaseModel):
    """Embedding 请求（为 RAG / pgvector 预留）"""
    input: list[str]


class EmbedResponse(BaseModel):
    """Embedding 响应（OpenAI 兼容格式，便于写入 pgvector）"""
    model: str
    data: list[dict[str, Any]]  # [ {"embedding": [...], "index": 0}, ... ]


class RerankRequest(BaseModel):
    """Rerank 请求（检索结果重排序，提升 RAG 精度）"""
    query: str
    documents: list[str]
    top_n: Optional[int] = None  # 返回前 N 条，默认全部按分数排序


class RerankResult(BaseModel):
    index: int
    document: str
    relevance_score: float


class RerankResponse(BaseModel):
    results: list[RerankResult]


# ==================== API 端点 ====================

@router.post("/grade", response_model=GradeResponse)
async def grade_submission(request: GradeRequest):
    """
    AI 批改端点
    接收答案，返回评分和反馈
    """
    try:
        service = get_ai_service()
        result = await service.grade(
            question_type=request.question_type,
            question_content=request.question_content,
            user_answer=request.user_answer,
            correct_answer=request.correct_answer,
            rubric=request.rubric,
            max_points=request.max_points,
        )
        return GradeResponse(
            submission_id=request.submission_id,
            score=result.score,
            feedback=result.feedback,
            reasoning=result.reasoning,
        )
    except Exception as e:
        logger.error("AI grading failed", error=str(e))
        raise HTTPException(status_code=500, detail=f"AI 批改失败: {str(e)}")


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    AI 对话端点
    支持多轮对话
    """
    try:
        service = get_ai_service()
        content, model = await service.chat(
            messages=request.messages,
            system_prompt=request.system_prompt,
            temperature=request.temperature,
            max_tokens=request.max_tokens,
            model=request.model,
        )
        return ChatResponse(content=content, model=model)
    except Exception as e:
        logger.error("AI chat failed", error=str(e))
        raise HTTPException(status_code=500, detail=f"AI 对话失败: {str(e)}")


@router.post("/v1/chat/completions")
async def openai_chat_completions(request: OpenAICompletionsRequest):
    """
    OpenAI 兼容的流式对话端点，供 Vercel AI SDK（createOpenAI baseURL）调用。
    仅支持 stream=True，返回 SSE 流。
    """
    messages = [m.model_dump() for m in request.messages]
    service = get_ai_service()

    async def event_stream():
        try:
            async for chunk in service.stream_chat(
                model=request.model,
                messages=messages,
                temperature=request.temperature,
                max_tokens=request.max_tokens,
            ):
                yield f"data: {json.dumps(chunk)}\n\n"
            yield "data: [DONE]\n\n"
        except Exception as e:
            logger.error("OpenAI-compat stream failed", error=str(e))
            yield f"data: {json.dumps({'error': str(e)})}\n\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@router.post("/embed", response_model=EmbedResponse)
async def embed_texts(request: EmbedRequest):
    """
    Embedding 接口（为 RAG / Supabase pgvector 预留）。
    使用配置的 EMBEDDING_MODEL（如 gemini-embedding-001）将文本向量化。
    """
    if not request.input:
        raise HTTPException(status_code=400, detail="input 不能为空")
    try:
        service = get_ai_service()
        model, data = await service.embed(request.input)
        return EmbedResponse(model=model, data=data)
    except Exception as e:
        logger.error("Embed failed", error=str(e))
        raise HTTPException(status_code=500, detail=f"Embedding 失败: {str(e)}")


@router.post("/rerank", response_model=RerankResponse)
async def rerank_documents(request: RerankRequest):
    """
    Rerank 接口（为 RAG 预留）。使用配置的 RERANKER_MODEL（如 gemini-2.5-flash-lite）
    对候选文档按与 query 的相关性重排序。
    """
    if not request.documents:
        return RerankResponse(results=[])
    try:
        service = get_ai_service()
        indexed = await service.rerank(
            query=request.query,
            documents=request.documents,
            top_n=request.top_n,
        )
        results = [
            RerankResult(index=idx, document=doc, relevance_score=score)
            for idx, doc, score in indexed
        ]
        return RerankResponse(results=results)
    except Exception as e:
        logger.error("Rerank failed", error=str(e))
        raise HTTPException(status_code=500, detail=f"Rerank 失败: {str(e)}")


@router.get("/models", response_model=ModelsResponse)
async def get_models():
    """
    获取可用的 AI 模型列表
    """
    service = get_ai_service()
    default_model, providers, models = service.get_models()
    return ModelsResponse(
        default_model=default_model,
        providers=providers,
        models=models,
    )


@router.post("/test")
async def test_connection():
    """
    测试 AI 服务连接
    """
    try:
        service = get_ai_service()
        content, model = await service.chat(
            messages=[{"role": "user", "content": "Say 'Hello, AI service is working!' in one line."}],
            max_tokens=50,
        )
        return {"status": "ok", "model": model, "response": content}
    except Exception as e:
        logger.error("AI test failed", error=str(e))
        service = get_ai_service()
        default_model, _, _ = service.get_models()
        return {"status": "error", "model": default_model, "error": str(e)}
