import { notFound } from 'next/navigation';
import { getCourseServer, getCourseLessonsServer, getCourseQuestionsServer } from '@/lib/course/server';
import { MdxText } from '@/lib/mdx';
import { CourseDetailClient } from './_components/CourseDetailClient';

/**
 * 课程详情页（Server Component）
 * 服务端获取课程、课时、题目，用 MDX 渲染描述，传递给客户端展示
 */
export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [course, lessons, questions] = await Promise.all([
    getCourseServer(id),
    getCourseLessonsServer(id),
    getCourseQuestionsServer(id),
  ]);

  if (!course) {
    notFound();
  }

  const descriptionNode = course.description?.trim() ? (
    <MdxText source={course.description} />
  ) : (
    <span>通过动画演示和交互练习，探索课程内容。</span>
  );

  return (
    <CourseDetailClient
      course={course}
      lessons={lessons}
      questions={questions}
      descriptionNode={descriptionNode}
    />
  );
}
