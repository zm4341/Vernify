"""
Vernify 配置管理
使用 Pydantic Settings 从环境变量加载配置
"""

from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """应用配置"""
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
    )
    
    # 基础配置
    VERSION: str = "0.1.0"
    DEBUG: bool = False
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    SECRET_KEY: str = "your-secret-key-change-in-production"
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:8000",
        "http://127.0.0.1:3000",
    ]
    
    # 数据库
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/vernify"
    
    # Supabase
    SUPABASE_URL: str = "http://localhost:54321"
    SUPABASE_ANON_KEY: str = ""
    SUPABASE_SERVICE_ROLE_KEY: str = ""
    JWT_SECRET: str = ""
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # Celery
    CELERY_BROKER_URL: str = "redis://localhost:6379/1"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/2"
    
    # ===========================================
    # LLM 配置 (使用 LiteLLM 统一管理)
    # ===========================================
    # 默认模型 (LiteLLM 格式: provider/model-name)
    # 支持: gemini/, openai/, anthropic/, azure/, openrouter/
    LLM_MODEL: str = "gemini/gemini-3-pro-preview"
    
    # 回退模型列表 (逗号分隔；OpenRouter 格式: openrouter/provider/model)
    LLM_FALLBACK_MODELS: str = "openrouter/openai/gpt-5.2,openrouter/openai/gpt-5.mini"
    
    # RAG 相关（为 Supabase pgvector / 检索增强预留）
    # Embedding 模型（LiteLLM 格式），用于向量化文本，写入 pgvector
    EMBEDDING_MODEL: str = "gemini/gemini-embedding-001"
    # Reranker 模型（用于检索结果重排序，提升 RAG 精度）
    RERANKER_MODEL: str = "gemini/gemini-2.5-flash-lite"
    
    # Google Gemini (AI Studio)
    GEMINI_API_KEY: str = ""
    
    # OpenAI
    OPENAI_API_KEY: str = ""
    
    # Anthropic
    ANTHROPIC_API_KEY: str = ""
    
    # OpenRouter (统一 API 访问多种模型)
    OPENROUTER_API_KEY: str = ""
    
    # Azure OpenAI
    AZURE_OPENAI_API_KEY: str = ""
    AZURE_OPENAI_ENDPOINT: str = ""
    
    # 内容目录（历史遗留，当前未使用；LaTeX 扫描仅在本地运行，Docker 中不挂载 content）
    CONTENT_DIR: str = "/app/content"


# 全局配置实例
settings = Settings()
