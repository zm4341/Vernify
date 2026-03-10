"""
扩展系统
支持动态加载外部插件
"""

import importlib
import os
from pathlib import Path
from typing import List

from fastapi import FastAPI
import structlog

from app.extensions.base import Extension
from app.core.config import settings

logger = structlog.get_logger(__name__)

# 已加载的扩展
loaded_extensions: List[Extension] = []


async def load_extensions(app: FastAPI) -> None:
    """
    加载所有扩展
    扫描 extensions/plugins 目录，加载所有符合规范的扩展
    """
    plugins_dir = Path(__file__).parent / "plugins"
    
    if not plugins_dir.exists():
        logger.info("No plugins directory found")
        return
    
    for plugin_path in plugins_dir.iterdir():
        if plugin_path.is_dir() and (plugin_path / "__init__.py").exists():
            try:
                # 动态导入插件模块
                module_name = f"app.extensions.plugins.{plugin_path.name}"
                module = importlib.import_module(module_name)
                
                # 查找 Extension 子类
                for attr_name in dir(module):
                    attr = getattr(module, attr_name)
                    if (
                        isinstance(attr, type) 
                        and issubclass(attr, Extension) 
                        and attr is not Extension
                    ):
                        # 实例化并加载扩展
                        extension = attr()
                        await extension.on_load()
                        
                        # 注册路由
                        router = extension.get_router()
                        if router:
                            app.include_router(
                                router, 
                                prefix=f"/api/ext/{extension.name}",
                                tags=[f"ext:{extension.name}"]
                            )
                        
                        loaded_extensions.append(extension)
                        logger.info(
                            "Extension loaded",
                            name=extension.name,
                            version=extension.version
                        )
                        
            except Exception as e:
                logger.error(
                    "Failed to load extension",
                    plugin=plugin_path.name,
                    error=str(e)
                )


def get_loaded_extensions() -> List[Extension]:
    """获取已加载的扩展列表"""
    return loaded_extensions
