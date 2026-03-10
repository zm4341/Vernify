/**
 * 学习进度 API
 * GET /api/v1/quiz/progress/[courseId] - 获取课程学习进度
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
    
    // 验证用户身份
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: '请先登录' },
        { status: 401 }
      );
    }

    // 获取课程的所有课时
    const { data: lessons, error: lessonsError } = await supabase
      .from('lessons')
      .select('id, title, order_index')
      .eq('course_id', courseId)
      .order('order_index', { ascending: true });

    if (lessonsError) {
      console.error('Error fetching lessons:', lessonsError);
      return NextResponse.json(
        { error: '获取课程信息失败' },
        { status: 500 }
      );
    }

    const lessonIds = lessons?.map(l => l.id) || [];

    // 获取每个课时的题目数量
    const { data: questions, error: questionsError } = await supabase
      .from('questions')
      .select('lesson_id')
      .in('lesson_id', lessonIds);

    // 获取用户的提交记录
    const { data: submissions, error: submissionsError } = await supabase
      .from('submissions')
      .select('lesson_id, question_id, status, final_score')
      .eq('user_id', user.id)
      .in('lesson_id', lessonIds);

    if (questionsError || submissionsError) {
      console.error('Error fetching progress data:', questionsError || submissionsError);
      return NextResponse.json(
        { error: '获取进度数据失败' },
        { status: 500 }
      );
    }

    // 计算每个课时的进度
    const lessonProgress = lessons?.map(lesson => {
      const lessonQuestions = questions?.filter(q => q.lesson_id === lesson.id) || [];
      const lessonSubmissions = submissions?.filter(s => s.lesson_id === lesson.id) || [];
      
      const totalQuestions = lessonQuestions.length;
      const completedQuestions = new Set(lessonSubmissions.map(s => s.question_id)).size;
      const gradedSubmissions = lessonSubmissions.filter(
        s => s.status === 'graded' || s.status === 'reviewed'
      );
      const totalScore = gradedSubmissions.reduce((sum, s) => sum + (s.final_score || 0), 0);
      const maxScore = gradedSubmissions.length * 100; // 假设每题 100 分

      return {
        lesson_id: lesson.id,
        title: lesson.title,
        order_index: lesson.order_index,
        total_questions: totalQuestions,
        completed_questions: completedQuestions,
        progress_percentage: totalQuestions > 0 
          ? Math.round((completedQuestions / totalQuestions) * 100) 
          : 0,
        average_score: maxScore > 0 
          ? Math.round((totalScore / maxScore) * 100) 
          : null,
      };
    });

    // 计算总体进度
    const totalQuestions = questions?.length || 0;
    const completedQuestions = new Set(submissions?.map(s => s.question_id)).size;

    return NextResponse.json({
      course_id: courseId,
      total_lessons: lessons?.length || 0,
      total_questions: totalQuestions,
      completed_questions: completedQuestions,
      overall_progress: totalQuestions > 0 
        ? Math.round((completedQuestions / totalQuestions) * 100) 
        : 0,
      lessons: lessonProgress,
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}
