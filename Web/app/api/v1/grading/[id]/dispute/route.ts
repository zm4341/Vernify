/**
 * 申诉 API
 * POST /api/v1/grading/[id]/dispute - 提交申诉
 */
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const disputeSchema = z.object({
  reason: z.string().min(1, '请填写申诉理由'),
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

    const body = await request.json();
    const validationResult = disputeSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: '请求参数无效', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const { reason } = validationResult.data;

    // 验证提交记录属于当前用户
    const { data: submission, error: fetchError } = await supabase
      .from('submissions')
      .select('id, user_id, status')
      .eq('id', id)
      .single();

    if (fetchError || !submission) {
      return NextResponse.json(
        { error: '提交记录不存在' },
        { status: 404 }
      );
    }

    if (submission.user_id !== user.id) {
      return NextResponse.json(
        { error: '无权操作此记录' },
        { status: 403 }
      );
    }

    // 更新状态为申诉中
    const { data: updated, error: updateError } = await supabase
      .from('submissions')
      .update({
        status: 'disputed',
        dispute_reason: reason,
        disputed_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating submission:', updateError);
      return NextResponse.json(
        { error: '提交申诉失败' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      id: updated.id,
      status: 'disputed',
      message: '申诉已提交，请等待审核',
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}
