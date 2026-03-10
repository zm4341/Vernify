r"""
LaTeX 解析器
解析指定根路径下的 LaTeX 文件，提取章节与题目（choice/fill_blank）

格式约定：
- 选择题：\begin{enumerate}...\begin{tasks}...\end{tasks}...\end{enumerate}
- 填空题：\begin{enumerate}...\item ...\underline{\hspace{...}}...\score{4}...
- 分数：\score{4} 或 \score{6}
"""

import re
from pathlib import Path
from typing import Any


PREVIEW_MAX_LEN = 4000  # 单文件内容预览最大字符数


def parse_content_root(root: Path) -> dict[str, Any]:
    """
    扫描给定根目录下的 LaTeX 文件，解析章节与题目。

    Args:
        root: 内容根路径（可来自本地目录或临时写入的上传文件）

    Returns:
        {
            "content_root": str,
            "latex_root": str,
            "chapters": [ { stem, title, order, questions } ],
            "figures": [],
            "svg_files": [],
            "scanned_files": [ { path, content } ]  # 文件名(相对路径)与内容预览
        }
    """
    root = Path(root).resolve()
    content_root = str(root)
    tex_files: list[Path] = []
    svg_files: list[dict[str, Any]] = []
    scanned_files: list[dict[str, Any]] = []

    for p in root.rglob("*"):
        if p.is_file():
            ext = p.suffix.lower()
            if ext == ".tex":
                tex_files.append(p)
            elif ext == ".svg":
                svg_files.append({
                    "name": p.name,
                    "path": str(p),
                })
            elif ext == ".py":
                # Manim/Python 文件：收集到 scanned_files
                try:
                    text = p.read_text(encoding="utf-8", errors="replace")
                    rel = str(p.relative_to(root))
                    scanned_files.append({
                        "path": rel,
                        "content": text[:PREVIEW_MAX_LEN] + ("…" if len(text) > PREVIEW_MAX_LEN else ""),
                    })
                except Exception:
                    pass

    tex_files.sort(key=lambda p: str(p))

    # latex_root: 包含 .tex 的最近公共父目录，若无则用 content_root
    if tex_files:
        common = Path(tex_files[0]).parent
        for t in tex_files[1:]:
            common = _common_parent(common, t.parent)
        latex_root = str(common)
    else:
        latex_root = content_root

    chapters: list[dict[str, Any]] = []
    for i, fp in enumerate(tex_files):
        try:
            text = fp.read_text(encoding="utf-8", errors="replace")
            rel = str(fp.relative_to(root))
            scanned_files.append({
                "path": rel,
                "content": text[:PREVIEW_MAX_LEN] + ("…" if len(text) > PREVIEW_MAX_LEN else ""),
            })
        except Exception:
            continue
        ch = _parse_chapter_tex(text, fp.stem, i)
        if ch:
            chapters.append(ch)

    scanned_files.sort(key=lambda x: x["path"])

    return {
        "content_root": content_root,
        "latex_root": latex_root,
        "chapters": chapters,
        "figures": [],
        "svg_files": svg_files,
        "scanned_files": scanned_files,
    }


def _common_parent(a: Path, b: Path) -> Path:
    """返回两个路径的最近公共父目录"""
    parts_a = a.parts
    parts_b = b.parts
    common = []
    for x, y in zip(parts_a, parts_b):
        if x == y:
            common.append(x)
        else:
            break
    return Path(*common) if common else Path(".")


def _parse_chapter_tex(text: str, stem: str, order: int) -> dict[str, Any] | None:
    """
    解析单章 .tex 内容。
    返回 { stem, title, order, questions } 或 None（若无可提取内容）
    """
    title = _extract_chapter_title(text) or stem
    questions: list[dict[str, Any]] = []

    # 选择题：\begin{tasks}...\end{tasks} 或 \begin{enumerate}...\begin{tasks}...\end{tasks}...\end{enumerate}
    choice_qs = _extract_choice_questions(text)
    questions.extend(choice_qs)

    # 填空题：enumerate + item + underline + score
    fill_qs = _extract_fill_blank_questions(text)
    questions.extend(fill_qs)

    return {
        "stem": stem,
        "title": title,
        "order": order,
        "questions": questions,
    }


def _extract_chapter_title(text: str) -> str | None:
    """提取 \\chapter{...} 或 \\section{...} 标题"""
    m = re.search(r"\\chapter\*?\s*\{([^}]*)\}", text)
    if m:
        return m.group(1).strip()
    m = re.search(r"\\section\*?\s*\{([^}]*)\}", text)
    if m:
        return m.group(1).strip()
    return None


def _extract_choice_questions(text: str) -> list[dict[str, Any]]:
    """
    提取 tasks 环境中的选择题。
    格式：tasks 块，\task 题干，\task 选项，\task! 表示正确选项。
    """
    result: list[dict[str, Any]] = []
    pattern = re.compile(
        r"\\begin\{tasks\}(?:\[[^\]]*\])?(?:\([0-9]+\))?\s*(.*?)\\end\{tasks\}",
        re.DOTALL,
    )
    for block in pattern.finditer(text):
        body = block.group(1)
        # 分割 \task 和 \task!，保留分隔符位置
        parts = re.split(r"\\task(!?)\s*", body)
        # parts = [before_first, "!"|"", content1, "!"|"", content2, ...]
        tokens: list[tuple[bool, str]] = []
        i = 1
        while i < len(parts):
            is_correct = parts[i] == "!"
            i += 1
            content = parts[i] if i < len(parts) else ""
            content = _clean_latex_text(content.strip())
            if content:
                tokens.append((is_correct, content))
            i += 1
        if not tokens:
            continue
        stem = ""
        options: list[str] = []
        correct_index = -1
        for is_correct, c in tokens:
            if not options and len(tokens) > 1:
                stem = c
            else:
                options.append(c)
                if is_correct:
                    correct_index = len(options) - 1
        if not stem and options:
            stem = options.pop(0)
            if correct_index >= 0:
                correct_index -= 1
        if stem or options:
            result.append({
                "type": "choice",
                "stem": stem or "选择题",
                "options": options or [],
                "correctIndex": max(0, correct_index) if options else 0,
                "explanation": "",
                "score": 4,
            })
    return result


def _extract_fill_blank_questions(text: str) -> list[dict[str, Any]]:
    """
    提取填空题：enumerate 中的 item，含 underline，含 score。排除含 tasks 的块。
    """
    result: list[dict[str, Any]] = []
    # 匹配 \begin{enumerate}...\end{enumerate}，排除含 tasks 的块
    pattern = re.compile(
        r"\\begin\{enumerate\}(.*?)\\end\{enumerate\}",
        re.DOTALL,
    )
    for block in pattern.finditer(text):
        body = block.group(1)
        if "\\begin{tasks}" in body:
            continue
        # 按 \item 分割
        items = re.split(r"\\item\s*", body)
        for item in items[1:]:  # 跳过 items[0]（\item 之前）
            item = item.strip()
            if not item:
                continue
            if "\\underline" not in item and "\\underline{" not in item:
                continue
            stem = _clean_latex_text(item)
            if not stem:
                continue
            score = 4
            m = re.search(r"\\score\s*\{([0-9]+)\}", item)
            if m:
                score = int(m.group(1))
            result.append({
                "type": "fill_blank",
                "stem": stem,
                "options": [],
                "answer": 0,
                "explanation": "",
                "score": score,
            })
    return result


def _clean_latex_text(s: str) -> str:
    """简单清理 LaTeX 文本，去除部分命令"""
    s = s.strip()
    s = re.sub(r"\\label\{[^}]*\}", "", s)
    s = re.sub(r"\\ref\{[^}]*\}", "?", s)
    s = re.sub(r"\\underline\{\\hspace\{[^}]*\}\}", "______", s)
    s = re.sub(r"\\hspace\{[^}]*\}", " ", s)
    s = re.sub(r"\\score\s*\{[0-9]+\}", "", s)
    s = re.sub(r"\\par\b", "\n", s)
    s = re.sub(r"\\\\", "\n", s)
    s = re.sub(r"\s+", " ", s)
    return s.strip()
