-- PostgREST 需要 anon/authenticated 角色对表的 GRANT，否则会报 permission denied for table
-- RLS 策略仍然生效，这里只是授予表级 SELECT 权限

-- anon 角色（PGRST 在无 JWT 或 anon key 时可能使用）
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    GRANT USAGE ON SCHEMA public TO anon;
    GRANT SELECT ON public.courses TO anon;
    GRANT SELECT ON public.lessons TO anon;
    GRANT SELECT ON public.questions TO anon;
    GRANT SELECT ON public.profiles TO anon;
  END IF;
END $$;

-- authenticated 角色（用户登录后 JWT 中的 role）
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    GRANT USAGE ON SCHEMA public TO authenticated;
    GRANT SELECT ON public.courses TO authenticated;
    GRANT SELECT ON public.lessons TO authenticated;
    GRANT SELECT ON public.questions TO authenticated;
    GRANT SELECT ON public.profiles TO authenticated;
    GRANT SELECT, INSERT ON public.submissions TO authenticated;
    GRANT SELECT ON public.gradings TO authenticated;
    GRANT ALL ON public.progress TO authenticated;
  END IF;
END $$;
