"""
LLM 适配器工厂
使用 LiteLLM 统一管理所有 LLM 提供商
"""

from functools import lru_cache
from typing import Optional, List

from app.core.config import settings
from app.services.llm.base import LLMAdapter
from app.services.llm.litellm_adapter import LiteLLMAdapter, get_available_models


@lru_cache()
def get_llm_adapter(model: Optional[str] = None) -> LLMAdapter:
    """
    获取 LLM 适配器
    
    Args:
        model: LLM 模型名称 (LiteLLM 格式)
               例如: gemini/gemini-3-pro-preview, openai/gpt-4-turbo
               如果不指定，使用配置中的默认值
    
    Returns:
        LLMAdapter: LiteLLM 适配器实例
    """
    # 解析回退模型
    fallback_models = None
    if settings.LLM_FALLBACK_MODELS:
        fallback_models = [m.strip() for m in settings.LLM_FALLBACK_MODELS.split(",")]
    
    return LiteLLMAdapter(
        model=model or settings.LLM_MODEL,
        fallback_models=fallback_models,
    )


def list_available_providers() -> List[str]:
    """
    列出可用的 LLM 提供商
    
    Returns:
        提供商名称列表
    """
    providers = set()
    
    if settings.GEMINI_API_KEY:
        providers.add("gemini")
    
    if settings.OPENAI_API_KEY:
        providers.add("openai")
    
    if settings.ANTHROPIC_API_KEY:
        providers.add("anthropic")
    
    if settings.OPENROUTER_API_KEY:
        providers.add("openrouter")
    
    if settings.AZURE_OPENAI_API_KEY:
        providers.add("azure")
    
    return list(providers)


def list_available_models() -> List[dict]:
    """
    列出所有可用的模型
    
    Returns:
        模型信息列表
    """
    return get_available_models()


def get_default_model() -> str:
    """
    获取默认模型
    
    Returns:
        默认模型名称
    """
    return settings.LLM_MODEL
