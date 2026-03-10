"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Circle,
  BookOpen,
  GraduationCap,
  Clock,
  Sparkles,
  Play,
  FileText,
  AlertCircle,
  LogOut,
  PenTool,
  ChevronRight,
  ListOrdered,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Course, Lesson, CourseQuestion } from "@/lib/schemas";
import type { ReactNode } from "react";

function parseDurationMinutes(d: string | null | undefined): number {
  if (!d || typeof d !== "string") return 0;
  const m = d.match(/\d+/);
  return m ? parseInt(m[0], 10) : 0;
}

function formatDuration(d: string | null | undefined): string {
  const mins = parseDurationMinutes(d);
  return mins > 0 ? `${mins} 分钟` : "";
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: (i = 0) => ({
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: i * 0.05 },
  }),
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

export interface CourseDetailClientProps {
  course: Course;
  lessons: Lesson[];
  questions: CourseQuestion[];
  descriptionNode: ReactNode;
}

export function CourseDetailClient({
  course,
  lessons,
  questions,
  descriptionNode,
}: CourseDetailClientProps) {
  const router = useRouter();
  const catalogRef = useRef<HTMLDivElement>(null);
  const [showNotes, setShowNotes] = useState(false);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    (await import("@/lib/stores")).useAuthStore.getState().clearAuth();
    router.push("/login");
    router.refresh();
  }

  const meta = (course.metadata || {}) as { subject?: string; grade?: string; series?: string };
  const GRADE_LABELS: Record<string, string> = {
    "4": "四年级", "5": "五年级", "6": "六年级",
    "7": "七年级", "8": "八年级", "9": "九年级",
    "10": "高一", "11": "高二", "12": "高三",
  };
  const gradeLabel = meta.grade ? (GRADE_LABELS[meta.grade] ?? meta.grade) : "";
  const seriesLabel = meta.series || "几何小实验";
  const tagText = gradeLabel ? `${gradeLabel}上册 · ${seriesLabel}` : seriesLabel;

  const lessonCount = lessons?.length ?? 0;
  const questionCount = questions?.length ?? 0;
  const totalMins = lessons?.reduce((acc, l) => acc + parseDurationMinutes(l.duration), 0) ?? 0;
  const firstLesson = lessons && lessons.length > 0 ? lessons[0] : null;
  const scrollToCatalog = () => catalogRef.current?.scrollIntoView({ behavior: "smooth" });

  const sortedLessons = [...(lessons ?? [])].sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));

  return (
    <main
      className="min-h-screen relative overflow-hidden font-sans"
      style={{
        background: "linear-gradient(135deg, var(--color-bg-start) 0%, var(--color-bg-mid) 25%, #16082a 50%, var(--color-bg-end) 100%)",
      }}
    >
      {/* 背景光晕 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden>
        <div
          className="absolute w-[800px] h-[800px] rounded-full blur-[120px] opacity-30"
          style={{
            background: "radial-gradient(circle, var(--color-primary) 0%, transparent 70%)",
            top: "-20%",
            right: "-10%",
          }}
        />
        <div
          className="absolute w-[600px] h-[600px] rounded-full blur-[100px] opacity-20"
          style={{
            background: "radial-gradient(circle, #3b82f6 0%, transparent 70%)",
            bottom: "10%",
            left: "-10%",
          }}
        />
      </div>

      {/* 顶栏：固定、留出安全区 */}
      <nav className="fixed top-4 left-4 right-4 z-50 mx-auto max-w-6xl px-4 sm:px-6" aria-label="主导航">
        <div
          className="flex items-center justify-between rounded-2xl px-4 py-3 transition-colors duration-200"
          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <Link
            href="/courses"
            className="flex items-center gap-3 rounded-lg p-1 -m-1 transition-colors duration-200 hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-purple-400/50 cursor-pointer"
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{
                background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)",
                boxShadow: "0 4px 20px rgba(124, 58, 237, 0.4)",
              }}
            >
              <Circle size={18} className="text-white" strokeWidth={3} aria-hidden />
            </div>
            <span className="text-white/90 font-semibold text-lg">Lattice</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/courses"
              className="px-4 py-2 rounded-full text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition-colors duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-400/50"
            >
              关于课程
            </Link>
            <button
              onClick={handleLogout}
              type="button"
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition-colors duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-400/50"
            >
              <LogOut size={16} aria-hidden />
              退出登录
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-8 pt-32 sm:pt-36 pb-24 relative z-10">
        {/* 标题区：层次清晰，类型尺度一致 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14 sm:mb-20"
          aria-labelledby="course-title"
        >
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-5 bg-white/[0.08] border border-white/[0.12]"
            style={{ fontFamily: "'LXGW WenKai', sans-serif" }}
          >
            <Sparkles size={14} className="text-purple-400 shrink-0" aria-hidden />
            <span className="text-purple-300 text-sm font-medium">{tagText}</span>
          </div>

          <h1
            id="course-title"
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-5 tracking-tight leading-tight"
            style={{ fontFamily: "'LXGW WenKai', sans-serif" }}
          >
            {course.title}
          </h1>

          <div
            className="text-base sm:text-lg text-white/75 max-w-2xl mx-auto leading-relaxed mb-8 [&_a]:text-purple-300 [&_a]:underline [&_a:hover]:text-purple-200"
            style={{ fontFamily: "'LXGW WenKai', sans-serif" }}
          >
            {descriptionNode}
          </div>

          {/* CTA：主次分明，过渡 150–300ms */}
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mb-10">
            {firstLesson && (
              <Link
                href={`/lessons/${firstLesson.slug}`}
                className="flex items-center gap-2 px-6 py-3 sm:px-8 sm:py-4 rounded-2xl font-semibold text-white transition-all duration-200 hover:opacity-95 hover:scale-[1.02] active:scale-[0.98] cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent focus:ring-purple-400"
                style={{
                  background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)",
                  boxShadow: "0 8px 32px rgba(124, 58, 237, 0.4)",
                }}
              >
                <Play size={20} aria-hidden />
                开始学习 →
              </Link>
            )}
            <button
              type="button"
              onClick={scrollToCatalog}
              className="flex items-center gap-2 px-6 py-3 sm:px-8 sm:py-4 rounded-2xl font-medium text-white/75 hover:text-white hover:bg-white/10 transition-colors duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-400/50"
            >
              <FileText size={18} aria-hidden />
              查看大纲
            </button>
            <button
              type="button"
              onClick={() => setShowNotes(true)}
              className="flex items-center gap-2 px-6 py-3 sm:px-8 sm:py-4 rounded-2xl font-medium text-white/75 hover:text-white hover:bg-white/10 transition-colors duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-400/50"
            >
              <AlertCircle size={18} aria-hidden />
              注意事项
            </button>
          </div>

          {/* 统计：独立卡片区块，易扫读 */}
          <div
            className="inline-flex flex-wrap justify-center gap-8 sm:gap-12 py-5 px-6 rounded-2xl border border-white/[0.08]"
            style={{ background: "rgba(255,255,255,0.06)" }}
          >
            <div className="flex flex-col items-center gap-2">
              <BookOpen size={24} className="text-purple-400/80" aria-hidden />
              <span className="text-sm font-medium text-white/80">{lessonCount} 节课程</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <PenTool size={24} className="text-purple-400/80" aria-hidden />
              <span className="text-sm font-medium text-white/80">{questionCount} 道练习</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Clock size={24} className="text-purple-400/80" aria-hidden />
              <span className="text-sm font-medium text-white/80">{totalMins} 分钟</span>
            </div>
          </div>
        </motion.section>

        {/* 课程目录：h2 层级、卡片 hover 微动、stagger 动画 */}
        <motion.section
          ref={catalogRef}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-14"
          aria-labelledby="catalog-heading"
        >
          <h2
            id="catalog-heading"
            className="flex items-center gap-2 text-xl font-semibold text-white/95 mb-5"
            style={{ fontFamily: "'LXGW WenKai', sans-serif" }}
          >
            <ListOrdered size={22} className="text-purple-400 shrink-0" aria-hidden />
            课程目录
          </h2>
          {sortedLessons.length > 0 ? (
            <motion.ul
              className="flex flex-col gap-3 list-none p-0 m-0"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {sortedLessons.map((lesson, idx) => (
                <motion.li key={lesson.id} variants={itemVariants}>
                  <Link
                    href={`/lessons/${lesson.slug}`}
                    className="group flex items-center justify-between gap-4 p-4 rounded-xl transition-all duration-200 hover:bg-white/[0.08] hover:scale-[1.01] cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:ring-offset-2 focus:ring-offset-transparent"
                    style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.06)" }}
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <span className="inline-flex shrink-0 w-8 h-8 rounded-lg bg-purple-500/20 text-purple-300 text-sm font-semibold items-center justify-center">
                        {idx + 1}
                      </span>
                      <div className="min-w-0">
                        <span className="text-base font-semibold text-white/95 group-hover:text-white block truncate">
                          {lesson.title}
                        </span>
                        {lesson.duration && (
                          <span className="text-sm text-white/55 mt-0.5 block">
                            {formatDuration(lesson.duration)}
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronRight size={20} className="text-white/40 group-hover:text-white/70 shrink-0 transition-colors duration-200" aria-hidden />
                  </Link>
                </motion.li>
              ))}
            </motion.ul>
          ) : (
            <div
              className="rounded-xl py-12 text-center border border-white/[0.06]"
              style={{ background: "rgba(255,255,255,0.06)" }}
            >
              <p className="text-white/50 text-sm">暂无课时</p>
            </div>
          )}
        </motion.section>

        {/* 配套练习：与目录视觉一致 */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="mb-12"
          aria-labelledby="practice-heading"
        >
          <h2
            id="practice-heading"
            className="flex items-center gap-2 text-xl font-semibold text-white/95 mb-5"
            style={{ fontFamily: "'LXGW WenKai', sans-serif" }}
          >
            <PenTool size={20} className="text-purple-400 shrink-0" aria-hidden />
            配套练习
          </h2>
          {questions && questions.length > 0 ? (
            <ul className="flex flex-col gap-3 list-none p-0 m-0">
              {(() => {
                const byLesson = questions.reduce<Record<string, CourseQuestion[]>>((acc, q) => {
                  const key = q.lesson_slug || q.lesson_id;
                  if (!acc[key]) acc[key] = [];
                  acc[key].push(q);
                  return acc;
                }, {});
                const entries = Object.entries(byLesson).sort(
                  (a, b) => (a[1][0]?.lesson_order_index ?? 999) - (b[1][0]?.lesson_order_index ?? 999)
                );
                return entries.map(([slug, items]) => {
                  const firstQ = items[0];
                  const title = firstQ?.lesson_title || "练习";
                  return (
                    <li key={slug}>
                      <Link
                        href={firstQ ? `/lessons/${firstQ.lesson_slug}` : "#"}
                        className="flex items-center justify-between p-4 rounded-xl transition-all duration-200 hover:bg-white/[0.08] hover:scale-[1.01] cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:ring-offset-2 focus:ring-offset-transparent"
                        style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.06)" }}
                      >
                        <span className="text-base font-semibold text-violet-300">{title}</span>
                        <span className="text-sm text-white/60">{items.length} 题</span>
                      </Link>
                    </li>
                  );
                });
              })()}
            </ul>
          ) : (
            <div
              className="rounded-xl py-10 text-center border border-white/[0.06]"
              style={{ background: "rgba(255,255,255,0.06)" }}
            >
              <p className="text-white/50 text-sm">暂无题目</p>
            </div>
          )}
        </motion.section>
      </div>

      {/* 注意事项弹层：对比度与焦点 */}
      {showNotes && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.65)" }}
          onClick={() => setShowNotes(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="notes-title"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="max-w-md w-full rounded-2xl p-6 cursor-default"
            style={{
              background: "linear-gradient(135deg, rgba(26,10,46,0.98) 0%, rgba(13,6,25,0.98) 100%)",
              border: "1px solid rgba(255,255,255,0.12)",
            }}
          >
            <h3 id="notes-title" className="text-lg font-semibold text-white mb-4">
              注意事项
            </h3>
            <ul className="text-white/80 text-sm leading-relaxed space-y-2 mb-6">
              <li>· 请按课时顺序学习，确保知识连贯</li>
              <li>· 完成每课练习可巩固所学内容</li>
              <li>· 学习过程中可随时暂停，进度会自动保存</li>
            </ul>
            <button
              onClick={() => setShowNotes(false)}
              className="w-full py-2.5 rounded-xl font-medium text-white cursor-pointer transition-colors duration-200 hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-transparent"
              style={{
                background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)",
              }}
            >
              知道了
            </button>
          </motion.div>
        </div>
      )}

      <footer className="relative z-10 py-8 text-center">
        <div className="flex items-center justify-center gap-2 text-white/30 text-sm">
          <GraduationCap size={16} aria-hidden />
          <span>Lattice Learning System</span>
        </div>
      </footer>
    </main>
  );
}
