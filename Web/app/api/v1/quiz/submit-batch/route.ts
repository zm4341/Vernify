/**
 * 批量答题提交 API
 * POST /api/v1/quiz/submit-batch - 批量提交答案
 */
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const batchSubmitSchema = z.object({
  submissions: z.array(z.object({
    question_id: z.string().uuid(),
    answer: z.any(),
    time_spent_seconds: z.number().optional(),
  })),
  lesson_id: z.string().uuid(),
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
    const validationResult = batchSubmitSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: '请求参数无效', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const { submissions, lesson_id } = validationResult.data;

    // 获取所有题目信息
    const questionIds = submissions.map(s => s.question_id);
    const { data: questions, error: questionsError } = await supabase
      .from('questions')
      .select('id, type, content, correct_answer, rubric, max_points')
      .in('id', questionIds);

    if (questionsError) {
      console.error('Error fetching questions:', questionsError);
      return NextResponse.json(
        { error: '获取题目信息失败' },
        { status: 500 }
      );
    }

    const questionMap = new Map(questions?.map(q => [q.id, q]));
    const results = [];

    // 处理每个提交
    for (const sub of submissions) {
      const question = questionMap.get(sub.question_id);
      if (!question) {
        results.push({
          question_id: sub.question_id,
          error: '题目不存在',
        });
        continue;
      }

      // 创建提交记录
      const { data: submission, error: submitError } = await supabase
        .from('submissions')
        .insert({
          user_id: user.id,
          question_id: sub.question_id,
          lesson_id,
          answer: sub.answer,
          time_spent_seconds: sub.time_spent_seconds,
          status: 'pending',
        })
        .select()
        .single();

      if (submitError) {
        results.push({
          question_id: sub.question_id,
          error: '提交失败',
        });
        continue;
      }

      // 自动判分（选择题/填空题）
      if (question.type === 'multiple_choice' || question.type === 'fill_in_blank') {
        const isCorrect = JSON.stringify(sub.answer) === JSON.stringify(question.correct_answer);
        const score = isCorrect ? question.max_points : 0;

        await supabase
          .from('submissions')
          .update({
            status: 'graded',
            ai_score: score,
            ai_feedback: isCorrect ? '回答正确！' : '回答错误。',
            graded_at: new Date().toISOString(),
          })
          .eq('id', submission.id);

        results.push({
          id: submission.id,
          question_id: sub.question_id,
          status: 'graded',
          score,
          is_correct: isCorrect,
        });
      } else {
        // 主观题需要 AI 批改
        results.push({
          id: submission.id,
          question_id: sub.question_id,
          status: 'pending',
          message: '等待 AI 批改',
        });
      }
    }

    return NextResponse.json({
      total: submissions.length,
      results,
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}
