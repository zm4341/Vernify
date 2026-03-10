/**
 * 从数据库读取课时内容（内容领域）
 * 当 sync_to_db 已同步后，网页优先从数据库读取
 */
import { createClient } from '@/lib/supabase/server';

export type LessonFromDb = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  content_source: string | null;
  content: Record<string, unknown> | null;
  duration: string | null;
  order_index: number;
  metadata: Record<string, unknown> | null;
};

export type LessonForPage = {
  slug: string;
  id?: string;
  frontmatter: {
    title: string;
    description?: string;
    duration?: string;
    [key: string]: unknown;
  };
  content: string;
};

/** QuizBlock 所需格式 */
export type QuizItem = {
  id: string;
  type?: 'choice' | 'fill_blank' | 'essay' | 'drawing' | 'multi_choice';
  question: string;
  options: string[];
  score: number;
  correctIndex: number;
  explanation: string;
};

export async function getLessonBySlugFromDb(slug: string): Promise<LessonForPage | null> {
  const supabase = await createClient();
  const { data: lesson, error } = await supabase
    .from('lessons')
    .select('id, slug, title, description, content_source, duration, metadata')
    .eq('slug', slug)
    .limit(1)
    .maybeSingle();

  if (error || !lesson) return null;

  const source = lesson.content_source ?? '';
  return {
    id: lesson.id,
    slug: lesson.slug,
    frontmatter: {
      title: lesson.title,
      description: lesson.description ?? undefined,
      duration: lesson.duration ?? undefined,
      ...(lesson.metadata as Record<string, unknown> ?? {}),
    },
    content: source,
  };
}

export async function getLessonSlugsFromDb(courseSlug = 'circle-intro'): Promise<string[]> {
  const supabase = await createClient();
  const { data: course } = await supabase
    .from('courses')
    .select('id')
    .eq('slug', courseSlug)
    .eq('status', 'published')
    .single();

  if (!course) return [];

  const { data: lessons } = await supabase
    .from('lessons')
    .select('slug')
    .eq('course_id', course.id)
    .order('order_index', { ascending: true });

  return (lessons ?? []).map((l) => l.slug);
}

export async function getAllLessonsFromDb(courseSlug = 'circle-intro'): Promise<LessonForPage[]> {
  const slugs = await getLessonSlugsFromDb(courseSlug);
  const lessons: LessonForPage[] = [];
  for (const slug of slugs) {
    const lesson = await getLessonBySlugFromDb(slug);
    if (lesson) lessons.push(lesson);
  }
  return lessons;
}

export async function getQuestionsForLessonFromDb(lessonId: string): Promise<QuizItem[]> {
  const supabase = await createClient();
  const { data: rows } = await supabase
    .from('questions')
    .select('id, type, content, answer, points, order_index')
    .eq('lesson_id', lessonId)
    .order('order_index', { ascending: true });

  if (!rows) return [];

  return rows.map((q, i) => {
    const content = (q.content as { stem?: string; options?: string[] }) ?? {};
    const answer = (q.answer as { correct?: number } | null) ?? {};
    const correctIndex = typeof answer.correct === 'number' ? answer.correct : -1;
    return {
      id: `quiz_${i}`,
      type: (q.type as QuizItem['type']) ?? 'choice',
      question: content.stem ?? '',
      options: content.options ?? [],
      score: q.points ?? 4,
      correctIndex,
      explanation: (q.answer as { explanation?: string })?.explanation ?? '',
    };
  });
}
