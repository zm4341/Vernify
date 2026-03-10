"""
AI 应用服务层
封装批改、对话、流式、Embedding、Rerank 等能力，供 api 路由调用。
路由层只做 HTTP 与参数校验，业务与 LLM 调用集中在此，便于测试与替换实现。
"""

import json
import re
from typing import Any, AsyncGenerator, Optional

from litellm import acompletion, aembedding
import structlog

from app.core.config import settings
from app.services.llm.base import GradingResult
from app.services.llm.factory import (
    get_default_model,
    get_llm_adapter,
    list_available_models,
    list_available_providers,
)

logger = structlog.get_logger(__name__)


class AIService:
    """AI 应用服务：批改、对话、流式、模型列表、Embedding、Rerank"""

    async def grade(
        self,
        question_type: str,
        question_content: dict[str, Any],
        user_answer: dict[str, Any],
        correct_answer: Optional[dict[str, Any]] = None,
        rubric: Optional[dict[str, Any]] = None,
        max_points: int = 100,
        model: Optional[str] = None,
    ) -> GradingResult:
        """批改答题。"""
        adapter = get_llm_adapter(model)
        return await adapter.grade(
            question_type=question_type,
            question_content=question_content,
            user_answer=user_answer,
            correct_answer=correct_answer,
            rubric=rubric,
            max_points=max_points,
        )

    async def chat(
        self,
        messages: list[dict[str, str]],
        system_prompt: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 1000,
        model: Optional[str] = None,
    ) -> tuple[str, str]:
        """非流式对话，返回 (content, model)。"""
        adapter = get_llm_adapter(model)
        content = await adapter.chat(
            messages=messages,
            system_prompt=system_prompt,
            temperature=temperature,
            max_tokens=max_tokens,
        )
        return content, adapter.model

    async def stream_chat(
        self,
        model: Optional[str],
        messages: list[dict[str, Any]],
        temperature: float = 0.7,
        max_tokens: int = 1000,
    ) -> AsyncGenerator[dict, None]:
        """OpenAI 兼容的流式对话，逐个 yield  chunk（dict）。"""
        actual_model = model or settings.LLM_MODEL
        response = await acompletion(
            model=actual_model,
            messages=messages,
            stream=True,
            temperature=temperature,
            max_tokens=max_tokens,
        )
        async for chunk in response:
            yield chunk

    def get_models(self) -> tuple[str, list[str], list[dict]]:
        """返回 (default_model, providers, models)。"""
        return (
            get_default_model(),
            list_available_providers(),
            list_available_models(),
        )

    async def embed(self, input_texts: list[str]) -> tuple[str, list[dict[str, Any]]]:
        """Embedding，返回 (model, data)。data 为 [ {"embedding": [...], "index": i}, ... ]。"""
        if not input_texts:
            return settings.EMBEDDING_MODEL, []
        response = await aembedding(
            model=settings.EMBEDDING_MODEL,
            input=input_texts,
        )
        data = []
        raw_data = getattr(response, "data", None) or (
            response if isinstance(response, list) else []
        )
        for i, item in enumerate(raw_data):
            emb = getattr(item, "embedding", None) or (
                item.get("embedding") if isinstance(item, dict) else []
            )
            data.append({"embedding": emb, "index": getattr(item, "index", i) or i})
        return settings.EMBEDDING_MODEL, data

    async def rerank(
        self,
        query: str,
        documents: list[str],
        top_n: Optional[int] = None,
    ) -> list[tuple[int, str, float]]:
        """Rerank，返回 [(index, document, relevance_score), ...] 按分数降序。"""
        if not documents:
            return []
        doc_list = "\n".join(
            f"[{i}] {d[:500]}" for i, d in enumerate(documents)
        )
        prompt = f"""你是一个相关性打分器。给定一个查询和若干文档，对每个文档给出与查询的相关性分数（0.0 到 1.0）。
只输出一个 JSON 数组，长度为文档数，每个元素是对应文档的分数。不要其他文字。

查询：
{query[:1000]}

文档：
{doc_list}

输出格式示例：[0.9, 0.2, 0.7]"""
        response = await acompletion(
            model=settings.RERANKER_MODEL,
            messages=[{"role": "user", "content": prompt}],
            max_tokens=500,
            temperature=0,
        )
        content = response.choices[0].message.content
        json_match = re.search(r"\[[\s\d.,]+\]", content)
        if not json_match:
            scores = [0.5] * len(documents)
        else:
            scores = json.loads(json_match.group())
        if len(scores) != len(documents):
            scores = scores[: len(documents)] + [0.0] * (
                len(documents) - len(scores)
            )
        indexed = [(i, documents[i], scores[i]) for i in range(len(documents))]
        indexed.sort(key=lambda x: -x[2])
        n = top_n or len(indexed)
        return indexed[:n]


def get_ai_service() -> AIService:
    """获取 AI 应用服务单例（可后续改为依赖注入）。"""
    return AIService()
