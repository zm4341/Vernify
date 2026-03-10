/**
 * 答题提交 API
 * POST /api/v1/quiz/submit - 提交单个答案
 */
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

// AI 服务地址
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://backend:8000';

// 请求验证
const submitSchema = z.object({
  question_id: z.string().uuid(),
  answer: z.any(),
  time_spent_seconds: z.number().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // 验证用户身份
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: '请先登录' },
        { status: 401 }
      );
    }

    // 解析并验证请求体
    const body = await request.json();
    const validationResult = submitSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: '请求参数无效', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const { question_id, answer, time_spent_seconds } = validationResult.data;

    // 获取题目信息
    const { data: question, error: questionError } = await supabase
      .from('questions')
      .select('id, type, content, correct_answer, rubric, max_points, lesson_id')
      .eq('id', question_id)
      .single();

    if (questionError || !question) {
      return NextResponse.json(
        { error: '题目不存在' },
        { status: 404 }
      );
    }

    // 创建提交记录
    const { data: submission, error: submitError } = await supabase
      .from('submissions')
      .insert({
        user_id: user.id,
        question_id,
        lesson_id: question.lesson_id,
        answer,
        time_spent_seconds,
        status: 'pending',
      })
      .select()
      .single();

    if (submitError) {
      console.error('Error creating submission:', submitError);
      return NextResponse.json(
        { error: '提交失败' },
        { status: 500 }
      );
    }

    // 对于选择题和填空题，可以直接判分
    if (question.type === 'multiple_choice' || question.type === 'fill_in_blank') {
      const isCorrect = JSON.stringify(answer) === JSON.stringify(question.correct_answer);
      const score = isCorrect ? question.max_points : 0;

      // 更新提交状态
      await supabase
        .from('submissions')
        .update({
          status: 'graded',
          ai_score: score,
          ai_feedback: isCorrect ? '回答正确！' : '回答错误，请查看正确答案。',
          graded_at: new Date().toISOString(),
        })
        .eq('id', submission.id);

      return NextResponse.json({
        id: submission.id,
        status: 'graded',
        score,
        is_correct: isCorrect,
        feedback: isCorrect ? '回答正确！' : '回答错误，请查看正确答案。',
      });
    }

    // 对于主观题，调用 AI 服务进行批改
    try {
      const gradeResponse = await fetch(`${AI_SERVICE_URL}/api/v1/ai/grade`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submission_id: submission.id,
          question_type: question.type,
          question_content: question.content,
          user_answer: answer,
          correct_answer: question.correct_answer,
          rubric: question.rubric,
          max_points: question.max_points,
        }),
      });

      if (gradeResponse.ok) {
        const gradeResult = await gradeResponse.json();
        
        // 更新提交记录
        await supabase
          .from('submissions')
          .update({
            status: 'ai_graded',
            ai_score: gradeResult.score,
            ai_feedback: gradeResult.feedback,
            graded_at: new Date().toISOString(),
          })
          .eq('id', submission.id);

        return NextResponse.json({
          id: submission.id,
          status: 'ai_graded',
          score: gradeResult.score,
          feedback: gradeResult.feedback,
          needs_review: true,
        });
      }
    } catch (aiError) {
      console.error('AI grading error:', aiError);
      // AI 服务不可用时，标记为待人工批改
    }

    // AI 服务不可用，返回待批改状态
    return NextResponse.json({
      id: submission.id,
      status: 'pending',
      message: '已提交，等待批改',
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}
