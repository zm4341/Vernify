"""
LaTeX → 数据库 同步 API
扫描 LaTeX 根路径下的 .tex 文件，解析题目并写入 Supabase
解析逻辑位于 app.services.latex_parser，Docker 与本地统一使用 backend 内解析模块
"""

import os
import shutil
from pathlib import Path
from typing import Any

import tempfile
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
import structlog
from supabase import create_client
from dotenv import load_dotenv

from app.services.latex_parser import parse_content_root

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL", "http://localhost:54321")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")

logger = structlog.get_logger(__name__)

router = APIRouter()


def _build_content_source_from_chapter(ch: dict[str, Any]) -> str:
    """从 LaTeX 解析的章节生成可渲染的课时正文（含 QuizBlock 占位）"""
    lines = [f"## {ch.get('title', ch.get('stem', ''))}", ""]
    for i, _ in enumerate(ch.get("questions", [])):
        lines.append(f"```quiz\nquiz_{i}\n```")
        lines.append("")
    return "\n".join(lines).strip()


def _get_supabase():
    if not SUPABASE_SERVICE_KEY or SUPABASE_SERVICE_KEY == "your-service-role-key":
        raise HTTPException(
            status_code=503,
            detail="SUPABASE_SERVICE_ROLE_KEY 未配置，无法同步数据库",
        )
    return create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)


def _latex_questions_to_db(questions: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """将 latex_parser_direct 的题目格式转换为 sync_questions 所需格式"""
    result = []
    type_map = {
        "choice": "choice",
        "fill": "fill_blank",
        "fill_blank": "fill_blank",
        "multi_choice": "multi_choice",
        "essay": "essay",
        "drawing": "drawing",
    }
    for i, q in enumerate(questions):
        q_type = type_map.get(q.get("type", "choice"), "choice")
        stem = q.get("stem", "")
        correct = q.get("correctIndex", -1)
        if "answer" in q:
            correct = q["answer"]
        content = {
            "stem": stem,
            "options": q.get("options", []),
            "image": q.get("image"),
            "figure_path": q.get("figure_path"),  # TikZ 路径引用（不 RAG）
        }
        result.append({
            "type": q_type,
            "content": content,
            "answer": {
                "correct": correct,
                "explanation": q.get("explanation", ""),
            },
            "points": q.get("points") or q.get("score", 4),
            "order_index": i,
        })
    return result


# ==================== 数据模型 ====================


class ScanResponse(BaseModel):
    """扫描结果"""
    content_root: str
    latex_root: str
    chapters: list[dict[str, Any]]
    figures: list[dict[str, Any]] = []
    svg_files: list[dict[str, Any]] = []
    scanned_files: list[dict[str, Any]] = []  # [{ path, content }] 文件名与内容预览


class SyncRequest(BaseModel):
    """同步请求"""
    course_slug: str = "circle-intro"
    course_title: str = "圆的初步认识"
    course_description: str = "四年级上册 · 几何小实验"
    content_root: str | None = None  # 本地路径，用于路径扫描同步；Docker 请用 sync-from-scan


class FileEntry(BaseModel):
    """上传的文件条目"""
    relativePath: str
    content: str


class ScanFromFilesRequest(BaseModel):
    """从上传文件扫描请求"""
    files: list[FileEntry]


class SyncFromScanRequest(BaseModel):
    """从已扫描数据同步请求"""
    scan_data: dict[str, Any]
    course_slug: str = "circle-intro"
    course_title: str = "圆的初步认识"
    course_description: str = "四年级上册 · 几何小实验"


class SyncResponse(BaseModel):
    """同步结果"""
    course_id: str
    lessons_synced: int
    questions_synced: int
    chapters: list[dict[str, Any]]


# ==================== API 端点 ====================


@router.get("/scan", response_model=ScanResponse)
async def scan_latex(
    content_root: str | None = Query(None, description="LaTeX 根路径，本地 backend 必填；Docker 请用 scan-from-files"),
):
    """
    扫描指定根路径下的 LaTeX，返回章节和题目预览
    不写入数据库。需提供 content_root 路径；Docker 环境请使用 scan-from-files 上传文件
    """
    if not content_root or not content_root.strip():
        raise HTTPException(
            status_code=400,
            detail="请提供 content_root 参数，或使用 scan-from-files 上传文件扫描",
        )
    try:
        root = Path(content_root)
        if not root.is_dir():
            raise HTTPException(status_code=400, detail=f"路径不存在或不是目录: {content_root}")
        data = parse_content_root(root)
        return ScanResponse(
            content_root=data["content_root"],
            latex_root=data["latex_root"],
            chapters=data["chapters"],
            figures=data.get("figures", []),
            svg_files=data.get("svg_files", []),
            scanned_files=data.get("scanned_files", []),
        )
    except Exception as e:
        logger.exception("LaTeX scan failed")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/sync", response_model=SyncResponse)
async def sync_latex_to_db(request: SyncRequest):
    """
    将 LaTeX 解析结果同步到 Supabase
    创建/更新 course、lessons、questions
    需提供 content_root 路径；Docker 环境请使用 sync-from-scan
    """
    if not request.content_root or not request.content_root.strip():
        raise HTTPException(
            status_code=400,
            detail="请提供 content_root 参数，或使用 sync-from-scan 配合已扫描数据",
        )
    try:
        supabase = _get_supabase()
        content_root = Path(request.content_root)
        if not content_root.is_dir():
            raise HTTPException(status_code=400, detail=f"路径不存在或不是目录: {request.content_root}")
        data = parse_content_root(content_root)
        assets_dir_str = os.getenv("LATEX_ASSETS_DIR", "").strip()
        if assets_dir_str:
            assets_dir = Path(assets_dir_str)
            assets_dir.mkdir(parents=True, exist_ok=True)
            for svg in data.get("svg_files", []):
                src = Path(svg["path"])
                if src.exists():
                    dest = assets_dir / src.name
                    shutil.copy2(src, dest)
                    logger.info("SVG copied", name=svg["name"], path=str(dest))

        # 1. 同步课程（LATEX_ASSETS_DIR 未设置时跳过 SVG 复制）
        course_result = supabase.table("courses").select("id").eq("slug", request.course_slug).single().execute()
        if course_result.data:
            course_id = course_result.data["id"]
            logger.info("Course exists", slug=request.course_slug, id=course_id)
        else:
            insert_result = supabase.table("courses").insert({
                "slug": request.course_slug,
                "title": request.course_title,
                "description": request.course_description,
                "status": "draft",
            }).execute()
            course_id = insert_result.data[0]["id"]
            logger.info("Course created", slug=request.course_slug, id=course_id)

        lessons_synced = 0
        questions_synced = 0

        # 2. 同步每个章节（课时）
        for ch in data["chapters"]:
            slug = ch["stem"]
            if slug.startswith("00_Cover"):
                continue  # 跳过封面

            # 从 LaTeX 解析结果生成可渲染的课时正文（含 QuizBlock 占位）
            content_source = _build_content_source_from_chapter(ch)
            lesson_data = {
                "slug": slug,
                "title": ch["title"],
                "description": "",
                "duration": "",
                "content_source": content_source,
                "content": {"type": "root", "components": []},
                "metadata": {},
                "order_index": ch["order"],
            }

            lesson_result = supabase.table("lessons").select("id").eq("course_id", course_id).eq("slug", slug).single().execute()
            if lesson_result.data:
                lesson_id = lesson_result.data["id"]
                supabase.table("lessons").update(lesson_data).eq("id", lesson_id).execute()
                logger.info("Lesson updated", slug=slug, id=lesson_id)
            else:
                insert_result = supabase.table("lessons").insert({**lesson_data, "course_id": course_id}).execute()
                lesson_id = insert_result.data[0]["id"]
                logger.info("Lesson created", slug=slug, id=lesson_id)

            lessons_synced += 1

            # 3. 同步题目
            questions = _latex_questions_to_db(ch.get("questions", []))
            if questions:
                supabase.table("questions").delete().eq("lesson_id", lesson_id).execute()
                for q in questions:
                    q["lesson_id"] = lesson_id
                supabase.table("questions").insert(questions).execute()
                questions_synced += len(questions)

        # 4. 更新课程状态
        supabase.table("courses").update({"status": "published"}).eq("id", course_id).execute()

        return SyncResponse(
            course_id=course_id,
            lessons_synced=lessons_synced,
            questions_synced=questions_synced,
            chapters=data["chapters"],
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("LaTeX sync failed")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/scan-from-files", response_model=ScanResponse)
async def scan_from_files(request: ScanFromFilesRequest):
    """
    从前端上传的文件内容扫描 LaTeX
    适用于 Docker 或本地，解析逻辑在 backend 内，无需 compiler 包
    """
    if not request.files:
        raise HTTPException(status_code=400, detail="files 不能为空")
    tmpdir = tempfile.mkdtemp(prefix="vernify_latex_")
    try:
        for entry in request.files:
            fp = Path(tmpdir) / entry.relativePath
            fp.parent.mkdir(parents=True, exist_ok=True)
            fp.write_text(entry.content, encoding="utf-8")
        data = parse_content_root(Path(tmpdir))
        return ScanResponse(
            content_root=data["content_root"],
            latex_root=data["latex_root"],
            chapters=data["chapters"],
            figures=data.get("figures", []),
            svg_files=data.get("svg_files", []),
            scanned_files=data.get("scanned_files", []),
        )
    except Exception as e:
        logger.exception("LaTeX scan-from-files failed")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        shutil.rmtree(tmpdir, ignore_errors=True)


@router.post("/sync-from-scan", response_model=SyncResponse)
async def sync_from_scan(request: SyncFromScanRequest):
    """
    使用已扫描数据同步到 Supabase
    不重新解析，直接使用 scan_data 中的 chapters
    """
    try:
        supabase = _get_supabase()
        data = request.scan_data
        chapters = data.get("chapters", [])
        if not chapters:
            raise HTTPException(status_code=400, detail="scan_data.chapters 为空")

        course_slug = request.course_slug
        course_title = request.course_title
        course_description = request.course_description

        course_result = supabase.table("courses").select("id").eq("slug", course_slug).single().execute()
        if course_result.data:
            course_id = course_result.data["id"]
            logger.info("Course exists", slug=course_slug, id=course_id)
        else:
            insert_result = supabase.table("courses").insert({
                "slug": course_slug,
                "title": course_title,
                "description": course_description,
                "status": "draft",
            }).execute()
            course_id = insert_result.data[0]["id"]
            logger.info("Course created", slug=course_slug, id=course_id)

        lessons_synced = 0
        questions_synced = 0

        for ch in chapters:
            slug = ch.get("stem", "")
            if slug.startswith("00_Cover"):
                continue

            content_source = _build_content_source_from_chapter(ch)
            lesson_data = {
                "slug": slug,
                "title": ch.get("title", slug),
                "description": "",
                "duration": "",
                "content_source": content_source,
                "content": {"type": "root", "components": []},
                "metadata": {},
                "order_index": ch.get("order", 0),
            }

            lesson_result = supabase.table("lessons").select("id").eq("course_id", course_id).eq("slug", slug).single().execute()
            if lesson_result.data:
                lesson_id = lesson_result.data["id"]
                supabase.table("lessons").update(lesson_data).eq("id", lesson_id).execute()
                logger.info("Lesson updated", slug=slug, id=lesson_id)
            else:
                insert_result = supabase.table("lessons").insert({**lesson_data, "course_id": course_id}).execute()
                lesson_id = insert_result.data[0]["id"]
                logger.info("Lesson created", slug=slug, id=lesson_id)

            lessons_synced += 1

            questions = _latex_questions_to_db(ch.get("questions", []))
            if questions:
                supabase.table("questions").delete().eq("lesson_id", lesson_id).execute()
                for q in questions:
                    q["lesson_id"] = lesson_id
                supabase.table("questions").insert(questions).execute()
                questions_synced += len(questions)

        supabase.table("courses").update({"status": "published"}).eq("id", course_id).execute()

        return SyncResponse(
            course_id=course_id,
            lessons_synced=lessons_synced,
            questions_synced=questions_synced,
            chapters=chapters,
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("LaTeX sync-from-scan failed")
        raise HTTPException(status_code=500, detail=str(e))
