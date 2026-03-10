"""
LaTeX 解析服务
从 LaTeX 根路径或上传文件解析，提取章节与题目
"""

from app.services.latex_parser.parser import parse_content_root

__all__ = ["parse_content_root"]
