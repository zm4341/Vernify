-- 为 profiles 添加 subjects 字段
-- 存储用户选择的学科：语文(chinese)、数学(math)、英语(english)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS subjects TEXT[] DEFAULT '{}';

-- 添加索引便于查询
CREATE INDEX IF NOT EXISTS idx_profiles_subjects ON public.profiles USING GIN(subjects);
