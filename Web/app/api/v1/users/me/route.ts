/**
 * 用户信息 API
 * GET /api/v1/users/me - 获取当前用户信息
 * PATCH /api/v1/users/me - 更新当前用户信息
 */
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

export async function GET() {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: '请先登录' },
        { status: 401 }
      );
    }

    // 获取用户资料
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Error fetching profile:', profileError);
    }

    return NextResponse.json({
      id: user.id,
      email: user.email,
      ...profile,
      created_at: user.created_at,
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}

const updateProfileSchema = z.object({
  full_name: z.string().optional(),
  avatar_url: z.string().url().optional(),
  preferences: z.record(z.string(), z.any()).optional(),
});

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: '请先登录' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validationResult = updateProfileSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: '请求参数无效', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        ...validationResult.data,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error updating profile:', error);
      return NextResponse.json(
        { error: '更新资料失败' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      id: user.id,
      email: user.email,
      ...profile,
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}
