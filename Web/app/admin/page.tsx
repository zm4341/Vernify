"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { BookOpen, HelpCircle, Users, Circle } from "lucide-react";

/** Admin 统计 API 返回类型 */
type AdminStatsResponse = {
  totalUsers: number;
  totalCourses: number;
  totalQuestions: number;
  subjects: string[];
  groups: Array<{
    subject: string;
    grade: string;
    courses: number;
    questions: number;
  }>;
};

const INITIAL_STATS: AdminStatsResponse = {
  totalUsers: 0,
  totalCourses: 0,
  totalQuestions: 0,
  subjects: [],
  groups: [],
};

async function fetchStats(): Promise<AdminStatsResponse> {
  try {
    const res = await fetch("/api/v1/admin/stats");
    const data = await res.json();
    if (!res.ok) return INITIAL_STATS;
    return {
      totalUsers: data.totalUsers ?? 0,
      totalCourses: data.totalCourses ?? 0,
      totalQuestions: data.totalQuestions ?? 0,
      subjects: Array.isArray(data.subjects) ? data.subjects : [],
      groups: Array.isArray(data.groups) ? data.groups : [],
    };
  } catch {
    return INITIAL_STATS;
  }
}

/** 总览统计卡片（学科数、题目数、用户数） */
const STAT_CARDS = [
  { key: "subjects", label: "学科数", icon: BookOpen, color: "from-violet-500 to-purple-600" },
  { key: "totalQuestions", label: "题目数", icon: HelpCircle, color: "from-amber-500 to-orange-500" },
  { key: "totalUsers", label: "用户数", icon: Users, color: "from-emerald-500 to-teal-500" },
] as const;

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStatsResponse>(INITIAL_STATS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchStats().then((data) => {
      if (!cancelled) {
        setStats(data);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div
      className="mx-auto w-full max-w-5xl px-4 sm:px-6 md:px-8"
      style={{ fontFamily: "'LXGW WenKai', sans-serif" }}
    >
      <nav className="mb-6 flex items-center gap-4 text-white/70 text-sm">
        <Link href="/admin" className="text-white">
          超级管理员
        </Link>
        <span>/</span>
        <span>概览</span>
      </nav>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center gap-3 mb-2">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)",
              boxShadow: "0 4px 20px rgba(124, 58, 237, 0.35)",
            }}
          >
            <Circle size={18} className="text-white" strokeWidth={2.5} aria-hidden />
          </div>
          <h1 className="text-2xl font-bold text-white">概览</h1>
        </div>
        <p className="text-white/60 mb-8">
          超级管理员后台：查看统计、同步 LaTeX、解析 Manim 等。
        </p>
      </motion.div>

      <section aria-labelledby="stats-heading" className="mb-10">
        <h2 id="stats-heading" className="sr-only">
          统计数据
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {STAT_CARDS.map(({ key, label, icon: Icon, color }, i) => {
            const value =
              key === "subjects"
                ? stats.subjects.length
                : key === "totalQuestions"
                  ? stats.totalQuestions
                  : stats.totalUsers;
            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.05 * i }}
                className="rounded-xl p-5 border border-white/10 bg-white/5 backdrop-blur-sm transition-all hover:bg-white/[0.07]"
              >
                <div className="flex items-center justify-between">
                  <span className="text-white/70 text-sm font-medium">{label}</span>
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br ${color} opacity-90`}
                  >
                    <Icon size={20} className="text-white" aria-hidden />
                  </div>
                </div>
                <p className="mt-3 text-2xl font-bold text-white tabular-nums">
                  {loading ? "—" : value}
                </p>
                {key === "subjects" && stats.subjects.length > 0 && (
                  <p className="mt-2 text-white/60 text-sm line-clamp-3" title={stats.subjects.join("、")}>
                    {stats.subjects.join("、")}
                  </p>
                )}
              </motion.div>
            );
          })}
        </div>

        {stats.groups.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.2 }}
            className="mt-8"
          >
            <h3 id="groups-heading" className="text-white/80 text-sm font-medium mb-3">
              按学科·年级
            </h3>
            <div
              className="rounded-xl border border-white/10 bg-white/5 overflow-hidden"
              role="region"
              aria-labelledby="groups-heading"
            >
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-white/70">
                    <th scope="col" className="px-4 py-3 font-medium">
                      学科
                    </th>
                    <th scope="col" className="px-4 py-3 font-medium">
                      年级
                    </th>
                    <th scope="col" className="px-4 py-3 font-medium text-right">
                      课程数
                    </th>
                    <th scope="col" className="px-4 py-3 font-medium text-right">
                      题目数
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {stats.groups.map((g, idx) => (
                    <tr
                      key={`${g.subject}-${g.grade}-${idx}`}
                      className="border-b border-white/5 last:border-0"
                    >
                      <td className="px-4 py-3 text-white">{g.subject}</td>
                      <td className="px-4 py-3 text-white/90">{g.grade}</td>
                      <td className="px-4 py-3 text-white tabular-nums text-right">
                        {g.courses}
                      </td>
                      <td className="px-4 py-3 text-white tabular-nums text-right">
                        {g.questions}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </section>
    </div>
  );
}
