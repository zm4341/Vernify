/**
 * 单个课程 API
 * GET /api/v1/courses/[id] - 获取课程详情
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

    const { data: course, error } = await supabase
      .from('courses')
      .select(`
        id,
        title,
        description,
        slug,
        cover_image,
        status,
        metadata,
        created_at,
        updated_at
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: '课程不存在' },
          { status: 404 }
        );
      }
      console.error('Error fetching course:', error);
      return NextResponse.json(
        { error: '获取课程详情失败' },
        { status: 500 }
      );
    }

    return NextResponse.json(course);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}
