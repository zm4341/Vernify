/**
 * 课时题目 API
 * GET /api/v1/lessons/[id]/questions - 获取课时的所有题目
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

    const { data: questions, error } = await supabase
      .from('questions')
      .select(`
        id,
        type,
        content,
        correct_answer,
        rubric,
        max_points,
        order_index
      `)
      .eq('lesson_id', id)
      .order('order_index', { ascending: true });

    if (error) {
      console.error('Error fetching questions:', error);
      return NextResponse.json(
        { error: '获取题目列表失败' },
        { status: 500 }
      );
    }

    return NextResponse.json(questions || []);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}
