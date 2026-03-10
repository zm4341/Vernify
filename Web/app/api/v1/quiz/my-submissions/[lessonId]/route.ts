/**
 * 我的提交记录 API
 * GET /api/v1/quiz/my-submissions/[lessonId] - 获取某课时的提交记录
 */
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  try {
    const { lessonId } = await params;
    const supabase = await createClient();
    
    // 验证用户身份
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: '请先登录' },
        { status: 401 }
      );
    }

    const { data: submissions, error } = await supabase
      .from('submissions')
      .select(`
        id,
        question_id,
        answer,
        status,
        ai_score,
        ai_feedback,
        human_score,
        human_feedback,
        final_score,
        time_spent_seconds,
        created_at,
        graded_at
      `)
      .eq('user_id', user.id)
      .eq('lesson_id', lessonId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching submissions:', error);
      return NextResponse.json(
        { error: '获取提交记录失败' },
        { status: 500 }
      );
    }

    return NextResponse.json(submissions || []);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}
