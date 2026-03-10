/**
 * 批改统计 API
 * GET /api/v1/grading/stats/[courseId] - 获取课程批改统计
 */
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params;
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: '请先登录' },
        { status: 401 }
      );
    }

    // TODO: 检查用户权限（教师/管理员）

    // 获取课程的所有课时
    const { data: lessons } = await supabase
      .from('lessons')
      .select('id')
      .eq('course_id', courseId);

    const lessonIds = lessons?.map(l => l.id) || [];

    if (lessonIds.length === 0) {
      return NextResponse.json({
        course_id: courseId,
        total_submissions: 0,
        pending: 0,
        ai_graded: 0,
        reviewed: 0,
        disputed: 0,
      });
    }

    // 统计各状态的提交数量
    const { data: submissions } = await supabase
      .from('submissions')
      .select('status')
      .in('lesson_id', lessonIds);

    const stats = {
      total_submissions: submissions?.length || 0,
      pending: submissions?.filter(s => s.status === 'pending').length || 0,
      ai_graded: submissions?.filter(s => s.status === 'ai_graded').length || 0,
      reviewed: submissions?.filter(s => s.status === 'reviewed').length || 0,
      disputed: submissions?.filter(s => s.status === 'disputed').length || 0,
      graded: submissions?.filter(s => s.status === 'graded').length || 0,
    };

    return NextResponse.json({
      course_id: courseId,
      ...stats,
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}
