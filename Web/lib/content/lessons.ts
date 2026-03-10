/**
 * 课时数据访问（内容领域，纯 DB）
 */
import {
  getLessonBySlugFromDb,
  getAllLessonsFromDb,
  getLessonSlugsFromDb,
} from './lessons-db';

export type Lesson = {
  slug: string;
  id?: string;
  frontmatter: {
    title: string;
    duration?: string;
    [key: string]: unknown;
  };
  content: string;
};

export async function getLessonSlugs(courseSlug = 'circle-intro'): Promise<string[]> {
  return getLessonSlugsFromDb(courseSlug);
}

export async function getLessonBySlug(slug: string): Promise<Lesson | null> {
  const fromDb = await getLessonBySlugFromDb(slug);
  return fromDb as Lesson | null;
}

export async function getAllLessons(courseSlug = 'circle-intro'): Promise<Lesson[]> {
  return getAllLessonsFromDb(courseSlug);
}
