-- 课时正文列重命名为 content_source（见 Web/docs/CONTENT-SOURCE-MIGRATION.md）

ALTER TABLE public.lessons
  RENAME COLUMN mdx_source TO content_source;

COMMENT ON COLUMN public.lessons.content_source IS '课时正文（Markdown 或兼容格式）';
