/**
 * 待批改列表 API
 * GET /api/v1/grading/pending - 获取待人工审核的提交
 */
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // 验证用户身份（需要教师/管理员权限）
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: '请先登录' },
        { status: 401 }
      );
    }

    // TODO: 检查用户权限（教师/管理员）

    const searchParams = request.nextUrl.searchParams;
    const courseId = searchParams.get('course_id');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
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
        created_at,
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
      .eq('status', 'ai_graded')
      .order('created_at', { ascending: true })
      .range(offset, offset + limit - 1);

    // 如果指定了课程 ID，过滤
    if (courseId) {
      const { data: lessons } = await supabase
        .from('lessons')
        .select('id')
        .eq('course_id', courseId);
      
      const lessonIds = lessons?.map(l => l.id) || [];
      if (lessonIds.length > 0) {
        query = query.in('lesson_id', lessonIds);
      }
    }

    const { data: submissions, error } = await query;

    if (error) {
      console.error('Error fetching pending submissions:', error);
      return NextResponse.json(
        { error: '获取待批改列表失败' },
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
