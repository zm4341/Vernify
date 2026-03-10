import type { ImgHTMLAttributes, ReactNode } from 'react';
import { getLessonBySlug } from '@/lib/content';
import { getQuestionsForLessonFromDb } from '@/lib/lessons-db';

// 课时内容含客户端组件（GeoGebra、图片查看器等），需动态渲染
export const dynamic = 'force-dynamic';
import { MDXRemote } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import { ManimPlayer } from '@/components/ManimPlayer';
import { LockedVideo } from '@/components/LockedVideo';
import { InteractiveImage } from '@/components/InteractiveImage';
import { GeoGebraBoard } from '@/components/GeoGebraBoard';
import { QuizBlock, QuizProvider } from '@/components/QuizBlock';
import { QuizPaginator } from '@/components/QuizPaginator';
import { FillInBlank } from '@/components/FillInBlank';
import { LessonLayout } from '@/components/LessonLayout';
import { QuestionWithFigure } from '@/components/QuestionWithFigure';
import { EnhancedImage } from '@/components/EnhancedImage';
import { FadeIn, LetterByLetter, SlideUp } from '@/components/ContentAnimation';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

// --- Shim Components for LaTeX Environments ---
const Center = ({ children }: { children: ReactNode }) => (
  <div className="flex flex-col items-center justify-center text-center my-6 w-full">
    {children}
  </div>
);

/** 课时页为 force-dynamic，构建时无请求上下文，无法调 DB。返回 [] 由动态渲染处理路由 */
export async function generateStaticParams() {
  return [];
}

// 课时内容中的 img 使用 EnhancedImage 展示
const ContentImg = (props: ImgHTMLAttributes<HTMLImageElement>) => {
  const src = typeof props.src === 'string' ? props.src : undefined;
  if (!src) return <img {...props} />;
  return <EnhancedImage src={src} alt={props.alt} className={props.className} />;
};

/** MDX 组件白名单：支持 Markdown + JSX，可按块使用 FadeIn / LetterByLetter / SlideUp 等动画 */
const mdxComponents = {
  ManimPlayer,
  LockedVideo,
  InteractiveImage,
  GeoGebraBoard,
  QuizBlock,
  QuizPaginator,
  FillInBlank,
  LessonLayout,
  QuestionWithFigure,
  EnhancedImage,
  FadeIn,
  LetterByLetter,
  SlideUp,
  img: ContentImg,
  Center,
  code({ node, className, children, ...props }: { node?: unknown; className?: string; children?: ReactNode }) {
    const match = /language-(\w+)/.exec(className ?? '');
    const lang = match?.[1];
    const codeContent = String(children ?? '').replace(/\n$/, '');
    if (lang === 'quiz' && codeContent) {
      return <QuizBlock id={codeContent} />;
    }
    return (
      <code className={className} {...props}>
        {children}
      </code>
    );
  },
};

export default async function LessonPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const lesson = await getLessonBySlug(slug);

  if (!lesson) {
    notFound();
  }

  // 题目数据：从数据库 questions 表读取
  let quizData: Array<{ id: string; question: string; options: string[]; score: number; correctIndex: number; explanation: string }> = [];
  if (lesson.id) {
    quizData = await getQuestionsForLessonFromDb(lesson.id);
  }

  const contentSource = lesson.content?.trim() ?? '';

  const mdxContent = contentSource
    ? await MDXRemote({
        source: contentSource,
        options: { mdxOptions: { remarkPlugins: [remarkGfm] } },
        components: mdxComponents,
      })
    : null;

  return (
    <QuizProvider data={quizData}>
      {/* Floating Header */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 pointer-events-none">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
             <Link 
                href="/" 
                className="pointer-events-auto flex items-center gap-2 px-4 py-2 rounded-full bg-surface/50 backdrop-blur-md border border-white/10 hover:bg-surface/80 transition-colors text-sm font-medium text-gray-200 shadow-lg"
             >
               <ChevronLeft size={16} />
               返回目录
             </Link>
             
             <div className="pointer-events-auto px-6 py-2 rounded-full bg-black/40 backdrop-blur-md border border-white/5 text-sm font-medium text-gray-400 hidden md:block font-heading tracking-wide">
                {lesson.frontmatter.title}
             </div>
             
             <div className="w-[100px]" /> {/* Spacer for balance */}
        </div>
      </nav>

      {/* Content */}
      {mdxContent || (
        <div className="max-w-2xl mx-auto py-16 text-center text-white/50">
          <p>本课时暂无内容</p>
          <p className="text-sm mt-2">可在 Admin 页面通过 LaTeX 同步导入</p>
        </div>
      )}
    </QuizProvider>
  );
}
