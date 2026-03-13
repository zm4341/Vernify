"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Circle,
  BookOpen,
  ArrowRight,
  Loader2,
  GraduationCap,
  LogOut,
  User,
  Sparkles,
  ChevronDown,
  ChevronRight,
  Calculator,
  BookMarked,
  Languages,
  Plus,
} from "lucide-react";
import { useAuthStore } from "@/lib/stores";
import { createClient } from "@/lib/supabase/client";
import type { Course } from "@/lib/schemas";
import type { ReactNode } from "react";

/** 学科配置：数学、语文、英语 */
const SUBJECTS = [
  { key: "math", label: "数学", icon: Calculator },
  { key: "chinese", label: "语文", icon: BookMarked },
  { key: "english", label: "英语", icon: Languages },
] as const;

/** 年级：四年级 → 高三 */
const GRADES = [
  { key: "4", label: "四年级" },
  { key: "5", label: "五年级" },
  { key: "6", label: "六年级" },
  { key: "7", label: "七年级" },
  { key: "8", label: "八年级" },
  { key: "9", label: "九年级" },
  { key: "10", label: "高一" },
  { key: "11", label: "高二" },
  { key: "12", label: "高三" },
] as const;

/** 初始化空的分组结构 */
function initEmptyGrouped() {
  const map = new Map<string, Map<string, Course[]>>();
  for (const subj of SUBJECTS) {
    map.set(subj.key, new Map());
    for (const g of GRADES) {
      map.get(subj.key)!.set(g.key, []);
    }
  }
  return map;
}

/** 将课程按 学科 > 年级 分组；grade 为空或不在 GRADES 的课程归入「其他课程」 */
function groupCoursesBySubjectAndGrade(courses: Course[]) {
  const map = initEmptyGrouped();
  const uncategorized: Course[] = [];
  const validGradeKeys = new Set<string>(GRADES.map((g) => g.key));

  for (const course of courses) {
    const meta = (course.metadata || {}) as { subject?: string; grade?: string };
    const subject = meta.subject?.toLowerCase() || "";
    const grade = meta.grade || "";

    if (!subject || !map.has(subject)) {
      uncategorized.push(course);
      continue;
    }
    if (!grade || !validGradeKeys.has(grade)) {
      uncategorized.push(course);
      continue;
    }
    const gradeMap = map.get(subject)!;
    if (!gradeMap.has(grade)) gradeMap.set(grade, []);
    gradeMap.get(grade)!.push(course);
  }

  return { grouped: map, uncategorized };
}

export interface CoursesPageClientProps {
  courses: Course[];
  descriptionNodes?: Record<string, ReactNode>;
}

export function CoursesPageClient({ courses, descriptionNodes = {} }: CoursesPageClientProps) {
  const router = useRouter();
  const { user, profile, isLoading: authLoading } = useAuthStore();
  const [expandedSubjects, setExpandedSubjects] = useState<Set<string>>(new Set());

  const toggleSubject = (subject: string) => {
    setExpandedSubjects((prev) => {
      const next = new Set(prev);
      if (next.has(subject)) next.delete(subject);
      else next.add(subject);
      return next;
    });
  };

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    useAuthStore.getState().clearAuth();
    router.push("/login");
    router.refresh();
  }

  const { grouped, uncategorized } = groupCoursesBySubjectAndGrade(courses);

  return (
    <main
      className="min-h-screen relative overflow-hidden"
      style={{
        fontFamily: "'LXGW WenKai', sans-serif",
        background: "linear-gradient(135deg, #0c0118 0%, #1a0a2e 25%, #16082a 50%, #0d0619 100%)",
      }}
    >
      {/* 背景 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute w-[800px] h-[800px] rounded-full blur-[120px] opacity-30"
          style={{
            background: "radial-gradient(circle, #7c3aed 0%, transparent 70%)",
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

      {/* 顶栏 */}
      <nav className="fixed top-0 w-full z-50 px-4 py-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/courses" className="flex items-center gap-3 cursor-pointer transition-opacity hover:opacity-90">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)",
                boxShadow: "0 4px 20px rgba(124, 58, 237, 0.4)",
              }}
            >
              <Circle size={18} className="text-white" strokeWidth={3} />
            </div>
            <span className="text-white/90 font-semibold text-lg">Vernify</span>
          </Link>
          <div className="flex items-center gap-2">
            {!authLoading && user ? (
              <>
                <Link
                  href="/admin"
                  className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-white/80 hover:text-white transition-colors"
                  style={{ background: "rgba(255,255,255,0.08)" }}
                >
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="" className="w-6 h-6 rounded-full object-cover" />
                  ) : (
                    <User size={16} />
                  )}
                  <span>超级管理员</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-white/80 hover:text-white transition-colors cursor-pointer"
                  style={{ background: "rgba(255,255,255,0.08)" }}
                >
                  <LogOut size={16} />
                  退出登录
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-full text-sm font-medium text-white/80 hover:text-white transition-colors"
                  style={{ background: "rgba(255,255,255,0.08)" }}
                >
                  登录
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 rounded-full text-sm font-medium text-white transition-all hover:opacity-90"
                  style={{
                    background: "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)",
                    boxShadow: "0 4px 20px rgba(124, 58, 237, 0.3)",
                  }}
                >
                  注册
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 sm:px-8 pt-28 sm:pt-32 pb-24 relative z-10">
        {/* Hero */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12 sm:mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 bg-purple-500/15">
            <Sparkles size={14} className="text-purple-400" />
            <span className="text-purple-300 text-sm font-medium">数学 · 语文 · 英语 · 四年级至高三</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">挑选课程</h1>
          <p className="text-base sm:text-lg text-white/50 max-w-2xl mx-auto leading-relaxed">
            选择学科与年级，通过动画演示与交互练习，开始你的学习之旅
          </p>
        </motion.section>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="space-y-4"
        >
          {SUBJECTS.map(({ key, label, icon: SubjectIcon }) => {
            const gradeMap = grouped.get(key) ?? new Map<string, Course[]>();
            const isExpanded = expandedSubjects.has(key);

            return (
              <section
                key={key}
                className="rounded-2xl overflow-hidden transition-all duration-300"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <button
                  type="button"
                  onClick={() => toggleSubject(key)}
                  className="w-full flex items-center gap-3 px-5 py-4 text-left cursor-pointer transition-colors hover:bg-white/5"
                >
                  <span className="text-white/70 transition-transform duration-200">
                    {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                  </span>
                  <SubjectIcon size={22} className="text-purple-400 flex-shrink-0" />
                  <span className="text-lg font-semibold text-white">{label}</span>
                  <span className="text-sm text-white/50 ml-auto">四年级 · 五年级 · … · 高三</span>
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-white/5 px-5 py-4">
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                          {GRADES.map(({ key: gradeKey, label: gradeLabel }) => {
                            const gradeCourses = gradeMap.get(gradeKey) ?? [];
                            return (
                              <GradeSlot
                                key={gradeKey}
                                subjectKey={key}
                                gradeKey={gradeKey}
                                gradeLabel={gradeLabel}
                                courses={gradeCourses}
                              />
                            );
                          })}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </section>
            );
          })}

          {uncategorized.length > 0 && (
            <section
              className="rounded-2xl overflow-hidden"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <div className="px-5 py-4 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <BookOpen size={18} className="text-white/50" />
                  <span className="text-sm font-medium text-white/60">其他课程</span>
                </div>
              </div>
              <div className="p-5 grid gap-4 sm:grid-cols-2">
                {uncategorized.map((course) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    descriptionNode={descriptionNodes[course.id]}
                  />
                ))}
              </div>
            </section>
          )}
        </motion.div>
      </div>

      <footer className="relative z-10 py-8 text-center">
        <div className="flex items-center justify-center gap-2 text-white/30 text-sm">
          <GraduationCap size={16} />
          <span>Vernify Learning System</span>
        </div>
      </footer>
    </main>
  );
}

function GradeSlot({
  subjectKey,
  gradeKey,
  gradeLabel,
  courses,
}: {
  subjectKey: string;
  gradeKey: string;
  gradeLabel: string;
  courses: Course[];
}) {
  return (
    <div
      className="rounded-xl overflow-hidden min-h-[140px]"
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div className="px-3 py-2 border-b border-white/5 flex items-center gap-2">
        <GraduationCap size={14} className="text-purple-400/80" />
        <span className="text-sm font-medium text-white/80">{gradeLabel}</span>
      </div>
      <div className="p-3 space-y-2">
        {courses.length > 0 ? (
          courses.map((course) => <CourseCard key={course.id} course={course} compact />)
        ) : (
          <EmptySlot subjectKey={subjectKey} gradeKey={gradeKey} gradeLabel={gradeLabel} />
        )}
      </div>
    </div>
  );
}

function EmptySlot({
  subjectKey,
  gradeKey,
  gradeLabel,
}: {
  subjectKey: string;
  gradeKey: string;
  gradeLabel: string;
}) {
  return (
    <div
      className="flex flex-col items-center justify-center py-6 rounded-lg transition-colors"
      style={{
        background: "rgba(255,255,255,0.02)",
        border: "1px dashed rgba(255,255,255,0.1)",
      }}
    >
      <Plus size={24} className="text-white/20 mb-2" />
      <p className="text-white/40 text-sm">暂无课程</p>
      <p className="text-white/30 text-xs mt-0.5">{gradeLabel}</p>
    </div>
  );
}

function CourseCard({
  course,
  compact,
  descriptionNode,
}: {
  course: Course;
  compact?: boolean;
  descriptionNode?: ReactNode;
}) {
  const meta = (course.metadata || {}) as { subject?: string; grade?: string };
  const gradeLabel = meta.grade
    ? GRADES.find((g) => g.key === meta.grade)?.label ?? meta.grade
    : "";

  if (compact) {
    return (
      <Link href={`/courses/${course.id}`} className="block cursor-pointer">
        <div
          className="group rounded-lg overflow-hidden transition-all duration-200 hover:bg-white/5 cursor-pointer"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div className="p-2 flex items-center justify-between">
            <h3 className="text-sm font-medium text-white line-clamp-1 group-hover:text-purple-200 transition-colors">
              {course.title}
            </h3>
            <ArrowRight size={12} className="text-purple-400/80 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/courses/${course.id}`} className="block cursor-pointer">
      <div
        className="group h-full rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.01]"
        style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 4px 24px rgba(0,0,0,0.2)",
        }}
      >
        <div className="aspect-video relative overflow-hidden">
          {course.cover_image ? (
            <img
              src={course.cover_image}
              alt={course.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, rgba(124,58,237,0.3) 0%, rgba(168,85,247,0.2) 100%)",
              }}
            >
              <BookOpen size={40} className="text-white/40" />
            </div>
          )}
          {gradeLabel && (
            <div className="absolute bottom-2 left-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium text-white/90 bg-black/30">
                <GraduationCap size={12} />
                {gradeLabel}
              </span>
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="text-base font-semibold text-white mb-1 line-clamp-2 group-hover:text-purple-200 transition-colors">
            {course.title}
          </h3>
          {(descriptionNode || course.description) && (
            <div className="text-white/50 text-sm line-clamp-2 mb-3 [&>span]:block">
              {descriptionNode ?? course.description}
            </div>
          )}
          <span className="inline-flex items-center gap-2 text-sm font-medium text-purple-300 group-hover:gap-3 transition-all">
            进入课程
            <ArrowRight size={14} />
          </span>
        </div>
      </div>
    </Link>
  );
}
