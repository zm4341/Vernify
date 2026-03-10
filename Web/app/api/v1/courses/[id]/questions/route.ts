/**
 * 课程题目 API
 * GET /api/v1/courses/[id]/questions - 获取课程下所有题目（含课时信息）
 * 使用 createAdminClient 绕过 RLS，确保能读取已发布课程下的题目
 */
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: courseId } = await params;
    const supabase = createAdminClient();

    const { data: course } = await supabase
      .from('courses')
      .select('id')
      .eq('id', courseId)
      .eq('status', 'published')
      .single();
    if (!course) {
      return NextResponse.json([]);
    }

    const { data: lessons } = await supabase
      .from('lessons')
      .select('id, slug, title')
      .eq('course_id', courseId)
      .order('order_index', { ascending: true });

    if (!lessons?.length) {
      return NextResponse.json([]);
    }

    const lessonIds = lessons.map((l) => l.id);
    const lessonMap = new Map(lessons.map((l) => [l.id, l]));
    const lessonOrderMap = new Map(lessons.map((l, i) => [l.id, i]));

    const { data: questions, error } = await supabase
      .from('questions')
      .select('id, lesson_id, type, content, answer, points, order_index')
      .in('lesson_id', lessonIds)
      .order('order_index', { ascending: true });

    if (error) {
      console.error('Error fetching questions:', error);
      return NextResponse.json(
        { error: '获取题目列表失败' },
        { status: 500 }
      );
    }

    const items = (questions || []).map((q) => {
      const lesson = lessonMap.get(q.lesson_id);
      const content = (q.content as { stem?: string; options?: string[] }) ?? {};
      const answer = (q.answer as { correct?: number; explanation?: string }) ?? {};
      return {
        id: q.id,
        lesson_id: q.lesson_id,
        lesson_slug: lesson?.slug ?? '',
        lesson_title: lesson?.title ?? '',
        lesson_order_index: lessonOrderMap.get(q.lesson_id) ?? 999,
        type: q.type,
        stem: content.stem ?? '',
        options: content.options ?? [],
        points: q.points ?? 0,
        order_index: q.order_index ?? 0,
        correctIndex: typeof answer.correct === 'number' ? answer.correct : -1,
        explanation: answer.explanation ?? '',
      };
    });

    return NextResponse.json(items);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}
