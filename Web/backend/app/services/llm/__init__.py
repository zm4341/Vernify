"""
LLM 适配器模块
支持多种 LLM 提供商
"""

from app.services.llm.base import LLMAdapter, GradingResult
from app.services.llm.factory import get_llm_adapter

__all__ = ["LLMAdapter", "GradingResult", "get_llm_adapter"]
