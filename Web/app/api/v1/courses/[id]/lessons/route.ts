/**
 * 课程课时列表 API
 * GET /api/v1/courses/[id]/lessons - 获取课程的所有课时（大题）
 * 使用 createAdminClient 绕过 RLS，与 questions API 一致，确保已发布课程的课时可被读取
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

    const { data: lessons, error } = await supabase
      .from('lessons')
      .select(`
        id,
        course_id,
        title,
        slug,
        description,
        content,
        order_index,
        duration,
        created_at,
        updated_at
      `)
      .eq('course_id', courseId)
      .order('order_index', { ascending: true });

    if (error) {
      console.error('Error fetching lessons:', error);
      return NextResponse.json(
        { error: '获取课时列表失败' },
        { status: 500 }
      );
    }

    return NextResponse.json(lessons || []);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}
