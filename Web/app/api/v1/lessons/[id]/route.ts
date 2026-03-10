/**
 * 课时 API
 * GET /api/v1/lessons/[id] - 获取课时详情
 */
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { data: lesson, error } = await supabase
      .from('lessons')
      .select(`
        id,
        title,
        slug,
        description,
        content,
        order_index,
        duration_minutes,
        course_id,
        created_at,
        updated_at,
        questions (
          id,
          type,
          content,
          correct_answer,
          rubric,
          max_points,
          order_index
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: '课时不存在' },
          { status: 404 }
        );
      }
      console.error('Error fetching lesson:', error);
      return NextResponse.json(
        { error: '获取课时详情失败' },
        { status: 500 }
      );
    }

    return NextResponse.json(lesson);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}
