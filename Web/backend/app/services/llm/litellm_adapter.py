"""
LiteLLM 统一适配器
使用 LiteLLM 框架统一管理所有 LLM 提供商
支持 100+ 模型，内置重试、回退、负载均衡
"""

import json
from typing import Any, Optional, List

import litellm
from litellm import acompletion
from tenacity import retry, stop_after_attempt, wait_exponential

from app.core.config import settings
from app.services.llm.base import LLMAdapter, GradingResult


# 配置 LiteLLM
litellm.set_verbose = settings.DEBUG
litellm.num_retries = 3
litellm.request_timeout = 60


class LiteLLMAdapter(LLMAdapter):
    """
    LiteLLM 统一适配器
    
    支持的模型格式:
    - OpenAI: openai/gpt-4, openai/gpt-4-turbo
    - Anthropic: anthropic/claude-3-opus-20240229, anthropic/claude-3-sonnet
    - Google Gemini: gemini/gemini-pro, gemini/gemini-3-pro-preview
    - Azure: azure/gpt-4-deployment
    - OpenRouter: openrouter/anthropic/claude-3.5-sonnet
    - 更多: https://docs.litellm.ai/docs/providers
    """
    
    name = "litellm"
    
    def __init__(
        self,
        model: Optional[str] = None,
        fallback_models: Optional[List[str]] = None,
    ):
        """
        初始化 LiteLLM 适配器
        
        Args:
            model: 主模型名称，如 "gemini/gemini-3-pro-preview"
            fallback_models: 回退模型列表
        """
        self.model = model or settings.LLM_MODEL
        self.fallback_models = fallback_models or self._get_fallback_models()
        
        # 设置各提供商 API Keys
        self._setup_api_keys()
    
    def _setup_api_keys(self):
        """设置各提供商的 API Keys"""
        import os
        
        # OpenAI
        if settings.OPENAI_API_KEY:
            os.environ["OPENAI_API_KEY"] = settings.OPENAI_API_KEY
        
        # Anthropic
        if settings.ANTHROPIC_API_KEY:
            os.environ["ANTHROPIC_API_KEY"] = settings.ANTHROPIC_API_KEY
        
        # Google Gemini
        if settings.GEMINI_API_KEY:
            os.environ["GEMINI_API_KEY"] = settings.GEMINI_API_KEY
        
        # OpenRouter
        if settings.OPENROUTER_API_KEY:
            os.environ["OPENROUTER_API_KEY"] = settings.OPENROUTER_API_KEY
        
        # Azure
        if settings.AZURE_OPENAI_API_KEY:
            os.environ["AZURE_API_KEY"] = settings.AZURE_OPENAI_API_KEY
            os.environ["AZURE_API_BASE"] = settings.AZURE_OPENAI_ENDPOINT
    
    def _get_fallback_models(self) -> List[str]:
        """获取回退模型列表"""
        fallbacks = []
        
        # 根据配置的 API Keys 添加可用的回退模型
        if settings.OPENAI_API_KEY:
            fallbacks.append("openai/gpt-4-turbo")
        
        if settings.ANTHROPIC_API_KEY:
            fallbacks.append("anthropic/claude-3-5-sonnet-20241022")
        
        if settings.GEMINI_API_KEY and "gemini" not in self.model:
            fallbacks.append("gemini/gemini-2.0-flash")
        
        return fallbacks
    
    @retry(stop=stop_after_attempt(3), wait=wait_exponential(min=1, max=10))
    async def grade(
        self,
        question_type: str,
        question_content: dict[str, Any],
        user_answer: dict[str, Any],
        correct_answer: Optional[dict[str, Any]] = None,
        rubric: Optional[dict[str, Any]] = None,
        max_points: int = 100,
    ) -> GradingResult:
        """使用 LiteLLM 批改答题"""
        
        prompt = self._build_grading_prompt(
            question_type=question_type,
            question_content=question_content,
            user_answer=user_answer,
            correct_answer=correct_answer,
            rubric=rubric,
            max_points=max_points,
        )
        
        messages = [
            {
                "role": "system",
                "content": "你是一位专业、耐心的小学数学教师。请用简洁、鼓励性的语言进行批改。请严格以 JSON 格式输出结果。"
            },
            {"role": "user", "content": prompt}
        ]
        
        try:
            response = await acompletion(
                model=self.model,
                messages=messages,
                temperature=0.3,
                max_tokens=500,
                response_format={"type": "json_object"} if self._supports_json_mode() else None,
                fallbacks=self.fallback_models,
                num_retries=3,
            )
            
            content = response.choices[0].message.content
            model_used = response.model
            
            # 解析 JSON 响应
            result = self._parse_json_response(content)
            
            return GradingResult(
                score=result.get("score", 0),
                feedback=result.get("feedback", ""),
                confidence=result.get("confidence", 0.8),
                model=model_used,
                raw_response={"content": content},
            )
            
        except Exception as e:
            # 记录错误并返回默认结果
            return GradingResult(
                score=0,
                feedback=f"批改时出现错误: {str(e)}",
                confidence=0,
                model=self.model,
                raw_response={"error": str(e)},
            )
    
    @retry(stop=stop_after_attempt(3), wait=wait_exponential(min=1, max=10))
    async def chat(
        self,
        messages: list[dict[str, str]],
        system_prompt: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 1000,
    ) -> str:
        """通用聊天"""
        
        chat_messages = []
        if system_prompt:
            chat_messages.append({"role": "system", "content": system_prompt})
        chat_messages.extend(messages)
        
        response = await acompletion(
            model=self.model,
            messages=chat_messages,
            temperature=temperature,
            max_tokens=max_tokens,
            fallbacks=self.fallback_models,
            num_retries=3,
        )
        
        return response.choices[0].message.content
    
    def _supports_json_mode(self) -> bool:
        """检查模型是否支持 JSON 模式"""
        json_mode_models = [
            "gpt-4", "gpt-4-turbo", "gpt-4o",
            "gpt-3.5-turbo",
            "claude-3", "claude-3.5",
            "gemini-1.5", "gemini-2", "gemini-3",
        ]
        return any(m in self.model.lower() for m in json_mode_models)
    
    def _parse_json_response(self, content: str) -> dict:
        """解析 JSON 响应，处理可能的 markdown 代码块"""
        try:
            # 尝试直接解析
            return json.loads(content)
        except json.JSONDecodeError:
            pass
        
        # 尝试移除 markdown 代码块
        if "```" in content:
            # 提取代码块内容
            import re
            json_match = re.search(r'```(?:json)?\s*([\s\S]*?)```', content)
            if json_match:
                try:
                    return json.loads(json_match.group(1).strip())
                except json.JSONDecodeError:
                    pass
        
        # 尝试找到 JSON 对象
        import re
        json_match = re.search(r'\{[\s\S]*\}', content)
        if json_match:
            try:
                return json.loads(json_match.group())
            except json.JSONDecodeError:
                pass
        
        # 返回默认结构
        return {
            "score": 0,
            "feedback": content,
            "confidence": 0.5
        }


def get_available_models() -> List[dict]:
    """
    获取可用的模型列表
    
    Returns:
        模型信息列表，包含名称、提供商、描述
    """
    models = []
    
    if settings.GEMINI_API_KEY:
        models.extend([
            {"id": "gemini/gemini-3-pro-preview", "provider": "google", "name": "Gemini 3 Pro Preview", "default": True},
            {"id": "gemini/gemini-2.0-flash", "provider": "google", "name": "Gemini 2.0 Flash"},
            {"id": "gemini/gemini-1.5-pro", "provider": "google", "name": "Gemini 1.5 Pro"},
        ])
    
    if settings.OPENAI_API_KEY:
        models.extend([
            {"id": "openai/gpt-4-turbo", "provider": "openai", "name": "GPT-4 Turbo"},
            {"id": "openai/gpt-4o", "provider": "openai", "name": "GPT-4o"},
            {"id": "openai/gpt-3.5-turbo", "provider": "openai", "name": "GPT-3.5 Turbo"},
        ])
    
    if settings.ANTHROPIC_API_KEY:
        models.extend([
            {"id": "anthropic/claude-3-5-sonnet-20241022", "provider": "anthropic", "name": "Claude 3.5 Sonnet"},
            {"id": "anthropic/claude-3-opus-20240229", "provider": "anthropic", "name": "Claude 3 Opus"},
        ])
    
    if settings.OPENROUTER_API_KEY:
        models.extend([
            {"id": "openrouter/anthropic/claude-3.5-sonnet", "provider": "openrouter", "name": "Claude 3.5 Sonnet (OpenRouter)"},
            {"id": "openrouter/google/gemini-pro", "provider": "openrouter", "name": "Gemini Pro (OpenRouter)"},
        ])
    
    return models
