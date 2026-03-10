"use client";

import { useState, useEffect } from "react";

const STORAGE_KEY = "vernify-admin-latex-scan";
const PATH_STORAGE_KEY = "vernify-admin-latex-path";

function loadPathFromStorage(): { dirPath: string; selectedDirName: string | null } {
  if (typeof window === "undefined") return { dirPath: "", selectedDirName: null };
  try {
    const raw = sessionStorage.getItem(PATH_STORAGE_KEY);
    if (!raw) return { dirPath: "", selectedDirName: null };
    const parsed = JSON.parse(raw) as unknown;
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      const o = parsed as { dirPath?: unknown; selectedDirName?: unknown };
      const dirPath = typeof o.dirPath === "string" ? o.dirPath : "";
      const selectedDirName =
        o.selectedDirName === null || o.selectedDirName === undefined
          ? null
          : String(o.selectedDirName);
      return { dirPath: dirPath.trim(), selectedDirName };
    }
  } catch {
    // ignore
  }
  return { dirPath: "", selectedDirName: null };
}

function savePathToStorage(dirPath: string, selectedDirName: string | null) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(
      PATH_STORAGE_KEY,
      JSON.stringify({ dirPath: dirPath.trim(), selectedDirName })
    );
  } catch {
    // ignore
  }
}

import {
  Database,
  Loader2,
  CheckCircle2,
  AlertCircle,
  FolderOpen,
  Code2,
  ChevronDown,
  ChevronRight,
  FileText,
  Image,
  FileCode,
} from "lucide-react";
import { api } from "@/lib/api/client";

/** 支持递归读取的扩展名 */
const SUPPORTED_EXT = [".tex", ".py"];

/** File System Access API 扩展类型（部分环境 TypeScript 未包含 entries） */
interface DirHandleWithEntries extends FileSystemDirectoryHandle {
  entries(): AsyncIterableIterator<[string, FileSystemHandle]>;
}

/** 从 showDirectoryPicker 递归收集 .tex 与 .py 文件内容 */
async function collectFilesFromDir(
  dirHandle: FileSystemDirectoryHandle,
  basePath = ""
): Promise<{ relativePath: string; content: string }[]> {
  const result: { relativePath: string; content: string }[] = [];
  const dh = dirHandle as DirHandleWithEntries;
  for await (const [name, handle] of dh.entries()) {
    const rel = basePath ? `${basePath}/${name}` : name;
    if (handle.kind === "file") {
      const ext = name.substring(name.lastIndexOf(".")).toLowerCase();
      if (SUPPORTED_EXT.includes(ext)) {
        try {
          const file = await (handle as FileSystemFileHandle).getFile();
          const content = await file.text();
          result.push({ relativePath: rel, content });
        } catch {
          // 跳过无法读取的文件
        }
      }
    } else if (handle.kind === "directory") {
      const sub = await collectFilesFromDir(
        handle as DirHandleWithEntries,
        rel
      );
      result.push(...sub);
    }
  }
  return result;
}

/** 题目类型标签映射 */
const QUESTION_TYPE_LABELS: Record<string, string> = {
  choice: "选择",
  fill_blank: "填空",
  fill: "填空",
  essay: "简答",
  drawing: "作图",
  multi_choice: "多选",
};

/**
 * LaTeX/Manim 解析与同步面板
 * 选择文件夹 → 显示路径 + 扫描 → 展示内容 → 同步到数据库
 */
export default function LatexSyncPage() {
  const [scanData, setScanData] = useState<
    Record<string, unknown> | null
  >(() => {
    if (typeof window === "undefined") return null;
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as unknown;
      return parsed && typeof parsed === "object" && !Array.isArray(parsed)
        ? (parsed as Record<string, unknown>)
        : null;
    } catch {
      return null;
    }
  });
  const [syncResult, setSyncResult] = useState<Record<string, unknown> | null>(
    null
  );
  const [loading, setLoading] = useState<"scan" | "sync" | "pick" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dirPath, setDirPath] = useState(() => loadPathFromStorage().dirPath);
  const [selectedDirName, setSelectedDirName] = useState<string | null>(
    () => loadPathFromStorage().selectedDirName
  );
  /** 选择文件夹后收集的文件（.tex/.py），用于后续扫描 */
  const [collectedFiles, setCollectedFiles] = useState<
    { relativePath: string; content: string }[] | null
  >(null);
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(
    new Set()
  );
  const [expandedFiles, setExpandedFiles] = useState<Set<string>>(new Set());
  const [hasDirectoryPicker] = useState(() =>
    typeof window !== "undefined" && "showDirectoryPicker" in window
  );

  /** 持久化路径显示：dirPath 或 selectedDirName 变更时写入 sessionStorage */
  useEffect(() => {
    savePathToStorage(dirPath, selectedDirName);
  }, [dirPath, selectedDirName]);

  /** 选择文件夹（不扫描，仅收集文件）；选择后立即显示文件夹名，不等待扫描 */
  const handlePickFolder = async () => {
    if (!hasDirectoryPicker) {
      setError("当前浏览器不支持 showDirectoryPicker，请使用路径输入框（本地 backend）");
      return;
    }
    setLoading("pick");
    setError(null);
    setSyncResult(null);
    try {
      const dirHandle = await (
        window as unknown as {
          showDirectoryPicker: (opts?: { mode?: "read" | "readwrite" }) => Promise<FileSystemDirectoryHandle>;
        }
      ).showDirectoryPicker({ mode: "read" });
      // 立即显示：选择后马上更新 UI，不等待文件收集完成；同时持久化到 sessionStorage
      setDirPath("");
      setSelectedDirName(dirHandle.name);
      setScanData(null);
      sessionStorage.removeItem(STORAGE_KEY);
      savePathToStorage("", dirHandle.name);
      const files = await collectFilesFromDir(dirHandle);
      if (files.length === 0) {
        setError("所选目录中未找到 .tex 或 .py 文件");
        setCollectedFiles(null);
        return;
      }
      setCollectedFiles(files);
    } catch (e) {
      if ((e as Error).name === "AbortError") {
        setError(null);
      } else {
        setError(e instanceof Error ? e.message : "选择文件夹失败");
      }
      setCollectedFiles(null);
    } finally {
      setLoading(null);
    }
  };

  /** 扫描（使用已收集的文件或后端路径） */
  const handleScan = async () => {
    setLoading("scan");
    setError(null);
    setSyncResult(null);
    try {
      if (collectedFiles && collectedFiles.length > 0) {
        const data = await api.latex.scanFromFiles(collectedFiles);
        const scan = data as Record<string, unknown>;
        setScanData(scan);
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(scan));
      } else {
        const root = dirPath.trim() || undefined;
        if (!root) {
          setError("请先选择文件夹或输入本地路径");
          setLoading(null);
          return;
        }
        const data = await api.latex.scan(root);
        const scan = data as Record<string, unknown>;
        setScanData(scan);
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(scan));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "扫描失败");
      setScanData(null);
    } finally {
      setLoading(null);
    }
  };

  const toggleChapter = (stem: string) => {
    setExpandedChapters((prev) => {
      const next = new Set(prev);
      if (next.has(stem)) next.delete(stem);
      else next.add(stem);
      return next;
    });
  };

  const toggleFile = (path: string) => {
    setExpandedFiles((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  };

  /** 同步到数据库（使用已扫描的数据，避免重复解析） */
  const handleSync = async () => {
    if (!scanData) return;
    setLoading("sync");
    setError(null);
    try {
      const result = await api.latex.syncFromScan(scanData, {
        course_slug: "circle-intro",
        course_title: "圆的初步认识",
        course_description: "四年级上册 · 几何小实验",
      });
      setSyncResult(result as Record<string, unknown>);
    } catch (e) {
      setError(e instanceof Error ? e.message : "同步失败");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div
      className="mx-auto w-full max-w-4xl px-4 sm:px-6 md:px-8"
      style={{ fontFamily: "'LXGW WenKai', sans-serif" }}
    >
      <nav className="mb-6 flex items-center gap-4 text-white/70 text-sm">
        <a href="/admin" className="hover:text-white">
          超级管理员
        </a>
        <span>/</span>
        <span className="text-white">LaTeX/Manim 解析与同步</span>
      </nav>

      <h1 className="text-2xl font-bold text-white mb-2">
        LaTeX/Manim 解析与同步
      </h1>
      <p className="text-white/60 mb-8">
        选择本机文件夹（.tex/.py）或输入本地路径，解析题目并同步到 Supabase。Docker
        环境请使用「选择文件夹」。
      </p>

      {/* 选择文件夹 / 路径输入 */}
      <div
        className="rounded-xl p-6 mb-6 border border-white/10 bg-white/5 backdrop-blur-sm"
      >
        <h2 className="text-sm font-medium text-white/80 mb-4">
          选择或输入目录
        </h2>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* 来源指定：选择 / 输入 */}
          <div className="flex flex-wrap items-center gap-2">
            {hasDirectoryPicker && (
              <button
                type="button"
                onClick={handlePickFolder}
                disabled={loading !== null}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-white transition-all duration-200 disabled:opacity-50 cursor-pointer hover:opacity-90"
                style={{
                  background:
                    "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)",
                  boxShadow: "0 4px 20px rgba(124, 58, 237, 0.3)",
                }}
              >
                {loading === "pick" ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <FolderOpen size={18} />
                )}
                {selectedDirName ? `已选: ${selectedDirName}` : "选择文件夹"}
              </button>
            )}
            {(!hasDirectoryPicker || dirPath) && (
              <button
                type="button"
                onClick={() => {
                  const path = window.prompt(
                    "输入本地 backend 路径（如 /path/to/latex）",
                    dirPath || ""
                  );
                  if (path != null) {
                    setDirPath(path.trim());
                    if (path.trim()) {
                      setSelectedDirName(null);
                      setCollectedFiles(null);
                    }
                  }
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white/80 transition-all duration-200 hover:bg-white/10 border border-white/15 cursor-pointer"
              >
                {dirPath ? "修改路径" : "输入路径"}
              </button>
            )}
          </div>
          {/* 扫描操作 */}
          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={handleScan}
              disabled={
                loading !== null ||
                !(
                  (collectedFiles && collectedFiles.length > 0) ||
                  dirPath.trim()
                )
              }
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-white/90 transition-all duration-200 disabled:opacity-50 cursor-pointer"
              style={{
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.15)",
              }}
            >
              {loading === "scan" ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Code2 size={18} />
              )}
              扫描
            </button>
          </div>
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="flex gap-4 mb-8">
        <button
          onClick={handleSync}
          disabled={loading !== null || !scanData}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-white/90 transition-all duration-200 disabled:opacity-50 cursor-pointer"
          style={{
            background: "rgba(255,255,255,0.1)",
            border: "1px solid rgba(255,255,255,0.15)",
          }}
        >
          {loading === "sync" ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Database size={18} />
          )}
          同步到数据库
        </button>
      </div>

      {error && (
        <div
          className="flex items-center gap-2 p-4 rounded-xl mb-6"
          style={{
            background: "rgba(239,68,68,0.1)",
            border: "1px solid rgba(239,68,68,0.2)",
          }}
        >
          <AlertCircle size={20} className="text-red-400 flex-shrink-0" />
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {syncResult && (
        <div
          className="flex items-center gap-2 p-4 rounded-xl mb-6"
          style={{
            background: "rgba(34,197,94,0.1)",
            border: "1px solid rgba(34,197,94,0.2)",
          }}
        >
          <CheckCircle2 size={20} className="text-green-400 flex-shrink-0" />
          <p className="text-green-400">
            同步成功：
            {(syncResult as { lessons_synced?: number }).lessons_synced ?? 0}{" "}
            课时，
            {(syncResult as { questions_synced?: number }).questions_synced ?? 0}{" "}
            题
          </p>
        </div>
      )}

      {/* 扫描结果：LaTeX 章节、题目、SVG、Manim */}
      {scanData && (
        <div
          className="rounded-2xl p-6 mb-6"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <h2 className="text-lg font-semibold text-white mb-4">扫描结果</h2>

          {/* LaTeX 章节与题目 */}
          <section className="mb-6">
            <h3 className="flex items-center gap-2 text-white/90 font-medium mb-3">
              <FileText size={18} />
              LaTeX 章节与题目
            </h3>
            <div className="space-y-2">
              {(
                (scanData.chapters as Record<string, unknown>[]) ?? []
              ).map((ch: Record<string, unknown>) => {
                const stem = String(ch.stem ?? "");
                const expanded = expandedChapters.has(stem);
                const questions = (ch.questions as Record<string, unknown>[]) ?? [];
                return (
                  <div
                    key={stem}
                    className="rounded-xl overflow-hidden"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => toggleChapter(stem)}
                      className="w-full flex items-center gap-2 p-4 text-left cursor-pointer hover:bg-white/5 transition-colors duration-200"
                    >
                      {expanded ? (
                        <ChevronDown size={18} className="text-white/60 shrink-0" />
                      ) : (
                        <ChevronRight size={18} className="text-white/60 shrink-0" />
                      )}
                      <span className="font-medium text-white truncate">
                        {String(ch.title ?? stem)}
                      </span>
                      <span className="text-white/40 text-sm shrink-0">
                        {stem}
                      </span>
                      {questions.length > 0 && (
                        <span className="text-purple-300/90 text-sm shrink-0 ml-auto">
                          {questions.length} 题
                        </span>
                      )}
                    </button>
                    {expanded && (
                      <div className="border-t border-white/5 px-4 py-3 space-y-3">
                        {questions.length === 0 ? (
                          <p className="text-white/40 text-sm">无题目</p>
                        ) : (
                          questions.map((q: Record<string, unknown>, idx: number) => (
                            <div
                              key={idx}
                              className="pl-4 py-2 rounded-lg"
                              style={{
                                background: "rgba(255,255,255,0.03)",
                                borderLeft: "3px solid rgba(124, 58, 237, 0.5)",
                              }}
                            >
                              <span className="inline-block px-1.5 py-0.5 rounded text-xs font-medium text-purple-300 bg-purple-500/20 mb-2">
                                {QUESTION_TYPE_LABELS[String(q.type ?? "choice")] ?? String(q.type)}
                              </span>
                              <p className="text-white/80 text-sm line-clamp-2">
                                {String(q.stem ?? "(无题干)")}
                              </p>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* Figures (TikZ) */}
          {Array.isArray(scanData.figures) && scanData.figures.length > 0 && (
            <section className="mb-6">
              <h3 className="flex items-center gap-2 text-white/90 font-medium mb-3">
                <Image size={18} />
                TikZ 图形
              </h3>
              <div className="flex flex-wrap gap-2">
                {(scanData.figures as Record<string, unknown>[]).map(
                  (f: Record<string, unknown>, i: number) => (
                    <div
                      key={i}
                      className="px-3 py-2 rounded-lg text-sm"
                      style={{
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.08)",
                      }}
                    >
                      {String(f.name ?? f.path ?? `figure-${i}`)}
                    </div>
                  )
                )}
              </div>
            </section>
          )}

          {/* SVG 文件 */}
          {Array.isArray(scanData.svg_files) && scanData.svg_files.length > 0 && (
            <section className="mb-6">
              <h3 className="flex items-center gap-2 text-white/90 font-medium mb-3">
                <Image size={18} />
                SVG 文件
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {(scanData.svg_files as Record<string, unknown>[]).map(
                  (s: Record<string, unknown>, i: number) => (
                    <div
                      key={i}
                      className="rounded-lg overflow-hidden"
                      style={{
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.08)",
                      }}
                    >
                      <div className="aspect-square bg-white/5 flex items-center justify-center p-2">
                        <span className="text-white/40 text-xs truncate w-full text-center">
                          {String(s.name ?? "")}
                        </span>
                      </div>
                      <p className="p-2 text-white/50 text-xs truncate" title={String(s.path ?? "")}>
                        {String(s.path ?? "").split("/").pop() ?? "-"}
                      </p>
                    </div>
                  )
                )}
              </div>
            </section>
          )}

          {/* Manim / .py 文件（来自已收集文件，无 scanned_files 时回退） */}
          {!Array.isArray(scanData.scanned_files) ||
          scanData.scanned_files.length === 0
            ? collectedFiles &&
              (() => {
                const pyFiles = collectedFiles.filter((f) =>
                  f.relativePath.toLowerCase().endsWith(".py")
                );
                return pyFiles.length > 0 ? (
                  <section>
                    <h3 className="flex items-center gap-2 text-white/90 font-medium mb-3">
                      <FileCode size={18} />
                      Manim / Python 文件
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {pyFiles.map((f, i) => (
                        <div
                          key={i}
                          className="px-3 py-2 rounded-lg text-sm"
                          style={{
                            background: "rgba(255,255,255,0.04)",
                            border: "1px solid rgba(255,255,255,0.08)",
                          }}
                        >
                          {f.relativePath}
                        </div>
                      ))}
                    </div>
                    <p className="text-white/40 text-xs mt-2">
                      当前仅展示已选文件夹中的 .py 文件，后端暂未解析 Manim 内容
                    </p>
                  </section>
                ) : null;
              })()
            : null}

          {/* 扫描文件列表与内容预览 */}
          {Array.isArray(scanData.scanned_files) &&
            scanData.scanned_files.length > 0 && (
              <section className="mt-6 pt-6 border-t border-white/10">
                <h3 className="flex items-center gap-2 text-white/90 font-medium mb-3">
                  <FileText size={18} />
                  扫描文件（{scanData.scanned_files.length} 个）
                </h3>
                <div className="space-y-2">
                  {(scanData.scanned_files as { path: string; content: string }[]).map(
                    (f) => {
                      const expanded = expandedFiles.has(f.path);
                      return (
                        <div
                          key={f.path}
                          className="rounded-xl overflow-hidden"
                          style={{
                            background: "rgba(255,255,255,0.04)",
                            border: "1px solid rgba(255,255,255,0.06)",
                          }}
                        >
                          <button
                            type="button"
                            onClick={() => toggleFile(f.path)}
                            className="w-full flex items-center gap-2 p-4 text-left cursor-pointer hover:bg-white/5 transition-colors duration-200"
                          >
                            {expanded ? (
                              <ChevronDown
                                size={18}
                                className="text-white/60 shrink-0"
                              />
                            ) : (
                              <ChevronRight
                                size={18}
                                className="text-white/60 shrink-0"
                              />
                            )}
                            <FileCode
                              size={18}
                              className="text-white/50 shrink-0"
                            />
                            <span className="font-medium text-white truncate">
                              {f.path}
                            </span>
                          </button>
                          {expanded && (
                            <div className="border-t border-white/5 px-4 py-3">
                              <pre
                                className="text-sm text-white/80 overflow-x-auto max-h-96 overflow-y-auto rounded-lg p-4 whitespace-pre-wrap break-words"
                                style={{
                                  background: "rgba(0,0,0,0.2)",
                                  fontFamily:
                                    "'LXGW WenKai Mono', 'LXGW WenKai', monospace",
                                }}
                              >
                                {f.content || "(空文件)"}
                              </pre>
                            </div>
                          )}
                        </div>
                      );
                    }
                  )}
                </div>
              </section>
            )}
        </div>
      )}
    </div>
  );
}
