/**
 * 人工审核 API
 * POST /api/v1/grading/[id]/review - 提交人工审核结果
 */
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const reviewSchema = z.object({
  human_score: z.number().min(0).max(100),
  human_feedback: z.string().optional(),
});

export async function POST(
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

    // TODO: 检查用户权限（教师/管理员）

    const body = await request.json();
    const validationResult = reviewSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: '请求参数无效', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const { human_score, human_feedback } = validationResult.data;

    // 获取原提交记录
    const { data: submission, error: fetchError } = await supabase
      .from('submissions')
      .select('ai_score, questions(max_points)')
      .eq('id', id)
      .single();

    if (fetchError) {
      return NextResponse.json(
        { error: '提交记录不存在' },
        { status: 404 }
      );
    }

    // 计算最终分数（以人工审核为准）
    const maxPoints = (submission.questions as any)?.max_points || 100;
    const finalScore = Math.min(human_score, maxPoints);

    // 更新提交记录
    const { data: updated, error: updateError } = await supabase
      .from('submissions')
      .update({
        status: 'reviewed',
        human_score,
        human_feedback,
        final_score: finalScore,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating submission:', updateError);
      return NextResponse.json(
        { error: '更新批改记录失败' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      id: updated.id,
      status: 'reviewed',
      human_score,
      human_feedback,
      final_score: finalScore,
      reviewed_at: updated.reviewed_at,
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}
