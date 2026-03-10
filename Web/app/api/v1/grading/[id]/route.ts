/**
 * 批改详情 API
 * GET /api/v1/grading/[id] - 获取批改详情
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
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: '请先登录' },
        { status: 401 }
      );
    }

    const { data: submission, error } = await supabase
      .from('submissions')
      .select(`
        id,
        user_id,
        question_id,
        lesson_id,
        answer,
        status,
        ai_score,
        ai_feedback,
        human_score,
        human_feedback,
        final_score,
        reviewed_by,
        reviewed_at,
        created_at,
        graded_at,
        questions (
          id,
          type,
          content,
          correct_answer,
          rubric,
          max_points
        ),
        profiles (
          full_name
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: '提交记录不存在' },
          { status: 404 }
        );
      }
      console.error('Error fetching submission:', error);
      return NextResponse.json(
        { error: '获取批改详情失败' },
        { status: 500 }
      );
    }

    return NextResponse.json(submission);

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}
