-- Lattice LMS 数据库初始化
-- 创建核心表结构

-- 启用 UUID 扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===========================================
-- 1. 课程表 (Courses)
-- ===========================================
CREATE TABLE IF NOT EXISTS public.courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    cover_image TEXT,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    created_by UUID REFERENCES auth.users(id)
);

-- 课程索引
CREATE INDEX idx_courses_slug ON public.courses(slug);
CREATE INDEX idx_courses_status ON public.courses(status);

-- ===========================================
-- 2. 课时表 (Lessons)
-- ===========================================
CREATE TABLE IF NOT EXISTS public.lessons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    slug TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    content JSONB,                    -- 结构化内容 (编译后的组件树)
    mdx_source TEXT,                  -- 原始 MDX 源码
    duration TEXT,                    -- 建议时长
    order_index INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(course_id, slug)
);

-- 课时索引
CREATE INDEX idx_lessons_course ON public.lessons(course_id);
CREATE INDEX idx_lessons_order ON public.lessons(course_id, order_index);

-- ===========================================
-- 3. 题目表 (Questions)
-- ===========================================
CREATE TABLE IF NOT EXISTS public.questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('choice', 'multi_choice', 'fill_blank', 'drawing', 'essay', 'geogebra')),
    content JSONB NOT NULL,           -- 题目内容 (题干、选项等)
    answer JSONB,                     -- 标准答案
    rubric JSONB,                     -- 评分规则 (供 AI 批改使用)
    points INTEGER DEFAULT 0,
    order_index INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 题目索引
CREATE INDEX idx_questions_lesson ON public.questions(lesson_id);
CREATE INDEX idx_questions_type ON public.questions(type);

-- ===========================================
-- 4. 用户答题记录 (Submissions)
-- ===========================================
CREATE TABLE IF NOT EXISTS public.submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    answer JSONB NOT NULL,            -- 用户答案
    is_correct BOOLEAN,               -- 是否正确 (选择题自动判断)
    submitted_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, question_id)      -- 每用户每题只保留最后一次提交
);

-- 答题记录索引
CREATE INDEX idx_submissions_user ON public.submissions(user_id);
CREATE INDEX idx_submissions_question ON public.submissions(question_id);
CREATE INDEX idx_submissions_lesson ON public.submissions(lesson_id);

-- ===========================================
-- 5. AI 批改记录 (Gradings)
-- ===========================================
CREATE TABLE IF NOT EXISTS public.gradings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    submission_id UUID NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
    
    -- AI 批改结果
    ai_score DECIMAL(5, 2),
    ai_feedback TEXT,
    ai_model TEXT,                    -- 使用的模型 (gpt-4, claude-3, etc.)
    ai_confidence DECIMAL(3, 2),      -- AI 置信度 (0-1)
    ai_graded_at TIMESTAMPTZ,
    
    -- 人工复核
    human_score DECIMAL(5, 2),
    human_feedback TEXT,
    human_reviewer_id UUID REFERENCES auth.users(id),
    human_reviewed_at TIMESTAMPTZ,
    
    -- 最终分数 (优先人工，其次 AI)
    final_score DECIMAL(5, 2) GENERATED ALWAYS AS (
        COALESCE(human_score, ai_score)
    ) STORED,
    
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'ai_graded', 'human_reviewed', 'disputed')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 批改记录索引
CREATE INDEX idx_gradings_submission ON public.gradings(submission_id);
CREATE INDEX idx_gradings_status ON public.gradings(status);
CREATE INDEX idx_gradings_reviewer ON public.gradings(human_reviewer_id);

-- ===========================================
-- 6. 学习进度 (Progress)
-- ===========================================
CREATE TABLE IF NOT EXISTS public.progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    
    completed BOOLEAN DEFAULT false,
    score DECIMAL(5, 2),              -- 该课时总分
    time_spent INTEGER DEFAULT 0,     -- 花费时间 (秒)
    
    started_at TIMESTAMPTZ DEFAULT now(),
    completed_at TIMESTAMPTZ,
    last_accessed_at TIMESTAMPTZ DEFAULT now(),
    
    UNIQUE(user_id, lesson_id)
);

-- 进度索引
CREATE INDEX idx_progress_user ON public.progress(user_id);
CREATE INDEX idx_progress_course ON public.progress(course_id);
CREATE INDEX idx_progress_completed ON public.progress(completed);

-- ===========================================
-- 7. 用户资料扩展 (Profiles)
-- ===========================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE,
    display_name TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'student' CHECK (role IN ('student', 'teacher', 'admin')),
    grade TEXT,                       -- 年级
    class_name TEXT,                  -- 班级
    student_id TEXT,                  -- 学号
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ===========================================
-- 8. 触发器: 自动更新 updated_at
-- ===========================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 应用触发器
CREATE TRIGGER update_courses_updated_at
    BEFORE UPDATE ON public.courses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_lessons_updated_at
    BEFORE UPDATE ON public.lessons
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_gradings_updated_at
    BEFORE UPDATE ON public.gradings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ===========================================
-- 9. 触发器: 自动创建用户资料
-- ===========================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id)
    VALUES (NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ===========================================
-- 10. RLS 策略 (Row Level Security)
-- ===========================================

-- 启用 RLS
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gradings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 课程: 所有人可读已发布课程
CREATE POLICY "Published courses are viewable by everyone"
    ON public.courses FOR SELECT
    USING (status = 'published');

CREATE POLICY "Admins and teachers can manage courses"
    ON public.courses FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('admin', 'teacher')
        )
    );

-- 课时: 随课程权限
CREATE POLICY "Lessons follow course visibility"
    ON public.lessons FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.courses
            WHERE id = lesson.course_id AND status = 'published'
        )
    );

-- 答题: 用户只能看自己的记录
CREATE POLICY "Users can view own submissions"
    ON public.submissions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own submissions"
    ON public.submissions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- 批改: 学生看自己的，老师看所有
CREATE POLICY "Users can view own gradings"
    ON public.gradings FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.submissions
            WHERE id = grading.submission_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Teachers can view all gradings"
    ON public.gradings FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('admin', 'teacher')
        )
    );

-- 进度: 用户只能看自己的
CREATE POLICY "Users can manage own progress"
    ON public.progress FOR ALL
    USING (auth.uid() = user_id);

-- 资料: 公开可读，自己可改
CREATE POLICY "Profiles are viewable by everyone"
    ON public.profiles FOR SELECT
    USING (true);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);
