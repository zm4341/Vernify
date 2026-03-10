/**
 * Admin 统计 API
 * GET /api/v1/admin/stats - 按学科(subject)、年级(grade)聚合课程数、题目数，以及总用户数
 * 学科/年级来自 courses.metadata
 * 使用 createAdminClient 绕过 RLS
 */
import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export type StatsGroup = {
  subject: string;
  grade: string;
  courses: number;
  questions: number;
};

export type AdminStatsResponse = {
  totalUsers: number;
  totalCourses: number;
  totalQuestions: number;
  /** 学科列表（去重） */
  subjects: string[];
  groups: StatsGroup[];
};

export async function GET() {
  try {
    const supabase = createAdminClient();

    // 1. 用户总数
    const { count: usersCount, error: usersError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });
    if (usersError) {
      console.error('Error fetching users count:', usersError);
    }
    const totalUsers = usersError ? 0 : (usersCount ?? 0);

    // 2. 课程（含 metadata）
    const { data: courses, error: coursesError } = await supabase
      .from('courses')
      .select('id, metadata');
    if (coursesError) {
      console.error('Error fetching courses:', coursesError);
      return NextResponse.json(
        { error: '获取课程数据失败' },
        { status: 500 }
      );
    }

    if (!courses?.length) {
      return NextResponse.json({
        totalUsers,
        totalCourses: 0,
        totalQuestions: 0,
        subjects: [],
        groups: [],
      } satisfies AdminStatsResponse);
    }

    const courseIds = courses.map((c) => c.id);

    // 3. 课时 -> 课程 映射
    const { data: lessons, error: lessonsError } = await supabase
      .from('lessons')
      .select('id, course_id')
      .in('course_id', courseIds);
    if (lessonsError) {
      console.error('Error fetching lessons:', lessonsError);
      return NextResponse.json(
        { error: '获取课时数据失败' },
        { status: 500 }
      );
    }

    const lessonIds = lessons?.map((l) => l.id) ?? [];
    const lessonToCourse = new Map<string, string>();
    lessons?.forEach((l) => lessonToCourse.set(l.id, l.course_id));

    // 4. 题目数（按 lesson_id）
    let totalQuestions = 0;
    const questionCountByLesson = new Map<string, number>();
    if (lessonIds.length > 0) {
      const { data: questions, error: questionsError } = await supabase
        .from('questions')
        .select('lesson_id')
        .in('lesson_id', lessonIds);
      if (!questionsError && questions?.length) {
        questions.forEach((q) => {
          const c = questionCountByLesson.get(q.lesson_id) ?? 0;
          questionCountByLesson.set(q.lesson_id, c + 1);
        });
        totalQuestions = questions.length;
      }
    }

    // 5. 按 course 汇总题目数
    const questionCountByCourse = new Map<string, number>();
    lessonToCourse.forEach((courseId, lessonId) => {
      const qc = questionCountByLesson.get(lessonId) ?? 0;
      const cur = questionCountByCourse.get(courseId) ?? 0;
      questionCountByCourse.set(courseId, cur + qc);
    });

    // 6. 按 (subject, grade) 分组聚合
    const groupKey = (s: string, g: string) => `${s}\0${g}`;
    const groupMap = new Map<string, { courses: number; questions: number }>();

    courses.forEach((c) => {
      const meta = (c.metadata as Record<string, unknown>) ?? {};
      const subject = String(meta.subject ?? '').trim() || '未分类';
      const grade = String(meta.grade ?? '').trim() || '未指定';
      const key = groupKey(subject, grade);
      const cur = groupMap.get(key) ?? { courses: 0, questions: 0 };
      cur.courses += 1;
      cur.questions += questionCountByCourse.get(c.id) ?? 0;
      groupMap.set(key, cur);
    });

    const groups: StatsGroup[] = Array.from(groupMap.entries())
      .map(([key, val]) => {
        const [subject, grade] = key.split('\0');
        return { subject, grade, courses: val.courses, questions: val.questions };
      })
      .sort((a, b) => {
        if (a.subject !== b.subject) return a.subject.localeCompare(b.subject);
        return a.grade.localeCompare(b.grade);
      });

    const totalCourses = courses.length;
    const subjects = [...new Set(groups.map((g) => g.subject))].sort((a, b) => a.localeCompare(b));

    return NextResponse.json({
      totalUsers,
      totalCourses,
      totalQuestions,
      subjects,
      groups,
    } satisfies AdminStatsResponse);
  } catch (error) {
    console.error('Unexpected error in admin stats:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}
