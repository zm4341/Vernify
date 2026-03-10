/**
 * 共享 MDX 工具
 * - MdxText：用于课程描述等短文本的 MDX 渲染（Server Component）
 */
import { MDXRemote } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import type { ReactNode } from 'react';

/** 课程描述、落地页等短文本的轻量级 MDX 组件 */
const simpleMdxComponents = {
  p: ({ children }: { children?: ReactNode }) => (
    <span className="inline">{children}</span>
  ),
  br: () => <br />,
};

/** 服务端渲染短文本为 MDX（课程描述等） */
export async function MdxText({ source }: { source: string }) {
  const s = (source || '').trim();
  if (!s) return null;
  return (
    <MDXRemote
      source={s}
      options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }}
      components={simpleMdxComponents}
    />
  );
}
