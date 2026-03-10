"""
Supabase 客户端
"""

from functools import lru_cache
from supabase import create_client, Client

from app.core.config import settings


@lru_cache()
def get_supabase_client() -> Client:
    """
    获取 Supabase 客户端 (单例模式)
    使用 service_role key 以获得完整权限
    """
    return create_client(
        settings.SUPABASE_URL,
        settings.SUPABASE_SERVICE_ROLE_KEY,
    )


def get_supabase_anon_client() -> Client:
    """
    获取 Supabase 匿名客户端
    用于前端请求转发等场景
    """
    return create_client(
        settings.SUPABASE_URL,
        settings.SUPABASE_ANON_KEY,
    )
