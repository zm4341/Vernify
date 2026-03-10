/**
 * 服务端课程数据获取（用于 Server Components）
 * 与 API 层逻辑一致，供 courses 页面直接使用
 */
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/server';
import { CourseSchema, LessonSchema } from '@/lib/schemas';
import type { Course, Lesson, CourseQuestion } from '@/lib/schemas';

export async function getCoursesServer(): Promise<Course[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('courses')
    .select(`id, title, description, slug, cover_image, status, metadata, created_at, updated_at`)
    .eq('status', 'published')
    .order('created_at', { ascending: false });
  if (error) {
    console.error('Error fetching courses:', error);
    return [];
  }
  return (data || []).map((item) => CourseSchema.parse(item));
}

export async function getCourseServer(id: string): Promise<Course | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('courses')
    .select(`id, title, description, slug, cover_image, status, metadata, created_at, updated_at`)
    .eq('id', id)
    .single();
  if (error || !data) return null;
  return CourseSchema.parse(data);
}

export async function getCourseLessonsServer(courseId: string): Promise<Lesson[]> {
  const supabase = createAdminClient();
  const { data: course } = await supabase
    .from('courses')
    .select('id')
    .eq('id', courseId)
    .eq('status', 'published')
    .single();
  if (!course) return [];

  const { data, error } = await supabase
    .from('lessons')
    .select(`id, course_id, title, slug, description, content, order_index, duration, created_at, updated_at`)
    .eq('course_id', courseId)
    .order('order_index', { ascending: true });
  if (error) return [];
  return (data || []).map((item) => LessonSchema.parse(item));
}

export async function getCourseQuestionsServer(courseId: string): Promise<CourseQuestion[]> {
  const supabase = createAdminClient();
  const { data: course } = await supabase
    .from('courses')
    .select('id')
    .eq('id', courseId)
    .eq('status', 'published')
    .single();
  if (!course) return [];

  const { data: lessons } = await supabase
    .from('lessons')
    .select('id, slug, title, order_index')
    .eq('course_id', courseId)
    .order('order_index', { ascending: true });
  if (!lessons?.length) return [];

  const lessonMap = new Map(lessons.map((l) => [l.id, l]));
  const lessonIds = lessons.map((l) => l.id);

  const { data: questions, error } = await supabase
    .from('questions')
    .select('id, lesson_id, type, content, answer, points, order_index')
    .in('lesson_id', lessonIds)
    .order('order_index', { ascending: true });
  if (error) return [];

  return (questions || []).map((q) => {
    const lesson = lessonMap.get(q.lesson_id);
    const content = (q.content as { stem?: string; options?: string[] }) ?? {};
    const answer = (q.answer as { correct?: number; explanation?: string }) ?? {};
    return {
      id: q.id,
      lesson_id: q.lesson_id,
      lesson_slug: lesson?.slug ?? '',
      lesson_title: lesson?.title ?? '',
      lesson_order_index: lesson?.order_index ?? 999,
      type: q.type,
      stem: content.stem ?? '',
      options: content.options ?? [],
      points: q.points ?? 0,
      order_index: q.order_index ?? 0,
      correctIndex: typeof answer.correct === 'number' ? answer.correct : -1,
      explanation: answer.explanation ?? '',
    };
  });
}
