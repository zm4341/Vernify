"""
扩展基类
所有扩展必须继承此类
"""

from abc import ABC, abstractmethod
from typing import Optional

from fastapi import APIRouter


class Extension(ABC):
    """
    扩展基类
    
    所有扩展必须实现:
    - name: 扩展名称
    - version: 扩展版本
    - get_router(): 返回 API 路由 (可选)
    - on_load(): 加载时调用
    
    扩展可以:
    - 添加新的 API 端点
    - 注册后台任务
    - 扩展批改逻辑
    - 集成外部服务
    """
    
    name: str = "unnamed"
    version: str = "0.0.0"
    description: str = ""
    
    @abstractmethod
    def get_router(self) -> Optional[APIRouter]:
        """
        返回扩展的 API 路由
        如果扩展不需要 API，返回 None
        """
        pass
    
    @abstractmethod
    async def on_load(self) -> None:
        """
        扩展加载时调用
        可用于初始化资源、验证配置等
        """
        pass
    
    async def on_unload(self) -> None:
        """
        扩展卸载时调用 (可选)
        可用于清理资源
        """
        pass
