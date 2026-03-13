/**
 * 确保超级管理员账号存在且密码正确
 * 邮箱: admin@vernify.local
 * 密码: .Withlxf911,（末尾有英文逗号）
 *
 * 使用方式（在 Web 目录下）:
 *   node -r ./scripts/load-env.js scripts/ensure-super-admin.js
 *
 * 要求: .env 中配置 NEXT_PUBLIC_SUPABASE_URL（或 SUPABASE_URL）和 SUPABASE_SERVICE_ROLE_KEY
 * 本地 Docker 时 URL 一般为 http://127.0.0.1:38080 或 http://localhost:38080
 */

require('./load-env.js');

const { createClient } = require('@supabase/supabase-js');

const ADMIN_EMAIL = 'admin@vernify.local';
const ADMIN_PASSWORD = '.Withlxf911,';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) {
  console.error('缺少环境变量: 请在 Web/.env 中配置 NEXT_PUBLIC_SUPABASE_URL 和 SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}
if (serviceRoleKey === 'your-service-role-key' || serviceRoleKey.length < 40) {
  console.error('SUPABASE_SERVICE_ROLE_KEY 未填写或无效。请从 Supabase 项目（或自建 GoTrue 的 JWT 配置）中获取 service_role key 并填入 Web/.env');
  process.exit(1);
}

const supabase = createClient(url, serviceRoleKey, { auth: { persistSession: false } });

async function findUserByEmail(email) {
  const { data: { users }, error } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  if (error) {
    if (error.message === 'User not allowed' || error.message?.includes('not allowed')) {
      throw new Error('listUsers 失败: GoTrue 拒绝了 Admin 请求。请确认 Web/.env 中 SUPABASE_SERVICE_ROLE_KEY 为有效的 service_role key（非 anon key），且与当前 Supabase/GoTrue 的 JWT_SECRET 一致。');
    }
    throw new Error(`listUsers 失败: ${error.message}`);
  }
  return users.find((u) => u.email === email) || null;
}

async function main() {
  console.log('查找超级管理员:', ADMIN_EMAIL);

  let user = await findUserByEmail(ADMIN_EMAIL);

  if (user) {
    console.log('已存在该用户，重置密码并确保角色为 admin...');
    const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
      password: ADMIN_PASSWORD,
    });
    if (updateError) {
      console.error('更新密码失败:', updateError.message);
      process.exit(1);
    }
    console.log('密码已更新。');
  } else {
    console.log('用户不存在，创建超级管理员...');
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      email_confirm: true,
    });
    if (createError) {
      console.error('创建用户失败:', createError.message);
      process.exit(1);
    }
    user = newUser.user;
    console.log('用户已创建，id:', user.id);
  }

  const { error: profileError } = await supabase
    .from('profiles')
    .update({ role: 'admin' })
    .eq('id', user.id);

  if (profileError) {
    console.error('更新 profiles 角色失败（可能 trigger 尚未创建 profile）:', profileError.message);
    process.exit(1);
  }
  console.log('profiles.role 已设为 admin。');
  console.log('完成。请使用以下凭据登录:', ADMIN_EMAIL, ' / 密码: .Withlxf911,（末尾有逗号）');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
