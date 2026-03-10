import { getCoursesServer } from '@/lib/course/server';
import { MdxText } from '@/lib/mdx';
import { CoursesPageClient } from './_components/CoursesPageClient';

/**
 * 课程列表页（Server Component）
 * 服务端获取课程并用 MDX 渲染描述，传递给客户端展示
 */
export default async function CoursesPage() {
  const courses = await getCoursesServer();
  const descriptionNodes: Record<string, React.ReactNode> = {};
  for (const c of courses) {
    if (c.description?.trim()) {
      descriptionNodes[c.id] = <MdxText source={c.description} />;
    }
  }
  return <CoursesPageClient courses={courses} descriptionNodes={descriptionNodes} />;
}
