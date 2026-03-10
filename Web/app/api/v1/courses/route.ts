/**
 * 课程 API
 * GET /api/v1/courses - 获取课程列表
 */
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();

    const { data: courses, error } = await supabase
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
      .eq('status', 'published')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching courses:', error);
      return NextResponse.json(
        { error: '获取课程列表失败' },
        { status: 500 }
      );
    }

    return NextResponse.json(courses || []);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}
