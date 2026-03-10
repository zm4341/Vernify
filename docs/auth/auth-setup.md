# 认证配置说明

> **运行方式**：Vernify 前后端均在 Docker 中运行。访问地址为 `http://127.0.0.1:38080/`（经 Caddy 统一入口），非 `localhost:3000`。

## 主页访问逻辑

- **未登录**：访问 `/` 显示公开落地页（Vernify 学习方案介绍 + 登录/注册按钮）
- **已登录未完成 onboarding**：访问 `/` 重定向到 `/onboarding`（选择学科与年级）
- **已登录已完成 onboarding**：访问 `/` 显示课程列表
- **未登录访问受保护路径**（如 `/lessons/*`）：重定向到 `/login?next=xxx`

## Docker 环境无法访问主页

若在 Docker 中运行，主页或登录后出现白屏/500，多半是 **Supabase 连接失败**。Next.js 服务端在容器内发起请求时，`NEXT_PUBLIC_SUPABASE_URL=http://localhost:38080` 会解析到容器自身，导致连接失败。

**处理方式**：在 `docker-compose.dev.yml` 中已为 frontend 配置 `SUPABASE_SERVER_URL=http://caddy:38080`，服务端会通过该地址访问 Supabase。

1. 确认 Docker 已启动：`cd Web && docker compose -f docker-compose.yml -f docker-compose.dev.yml -p vernify up -d`
2. 查看 frontend 日志：`docker logs Vernify-frontend -f`
3. 若仍异常，重启所有服务：`cd Web && docker compose -p vernify down && docker compose -f docker-compose.yml -f docker-compose.dev.yml -p vernify up -d`

## 注册验证码

注册流程使用 Supabase `signInWithOtp` 发送 6 位数字验证码到用户邮箱。要让 Supabase 发送 OTP 而非魔法链接，需要在 Supabase 控制台配置邮件模板。

### 配置步骤（Supabase Cloud）

1. 打开 [Supabase Dashboard](https://supabase.com/dashboard) → 选择项目
2. 进入 **Authentication** → **Email Templates**
3. 编辑 **Magic Link** 模板
4. 在邮件内容中使用 `{{ .Token }}` 显示 6 位验证码

示例模板：

```
<h2>验证码</h2>
<p>您的验证码是：<strong>{{ .Token }}</strong></p>
<p>验证码 10 分钟内有效。</p>
```

> 说明：Supabase 默认使用 `{{ .ConfirmationURL }}` 发送魔法链接。改用 `{{ .Token }}` 后，邮件会显示 6 位 OTP，用户需在注册页输入验证码完成注册。

### 本地开发（supabase CLI）

本地使用 `supabase start` 时，Inbucket 会接收所有邮件。可在 http://localhost:54324 查看收件箱获取验证码。

### Docker 自建：收不到验证码邮件

当前使用 **Docker Compose 自建**（非 Supabase Cloud、非 `supabase start`）时，GoTrue **默认没有配置 SMTP**，因此：

- 点击「发送验证码」后接口会成功，但**邮件不会发到你的真实邮箱**（如 hotmail、icloud）。
- 要收到邮件，必须在 `.env` 中配置 SMTP，并重启 `supabase-auth` 容器。

**配置步骤：**

1. 在 `Web/.env` 中填写（示例为 SMTP 通用项，请换成你的发信服务）：
   ```bash
   GOTRUE_SMTP_HOST=smtp.example.com
   GOTRUE_SMTP_PORT=587
   GOTRUE_SMTP_USER=your-smtp-user
   GOTRUE_SMTP_PASS=your-smtp-password
   GOTRUE_SMTP_ADMIN_EMAIL=no-reply@yourdomain.com
   GOTRUE_SMTP_SENDER_NAME=Vernify
   ```
2. 可选发信服务：Gmail/Outlook（需应用专用密码）、[Resend](https://resend.com)、[SendGrid](https://sendgrid.com)、[Brevo](https://brevo.com) 等，使用其提供的 SMTP 地址与凭据。
3. 重启 Auth 使配置生效：
   ```bash
   cd Web && docker compose up -d supabase-auth
   ```

配置完成后，用注册页再次向你的邮箱（如 zm4341@hotmail.com）发送验证码，即可在收件箱中收到。

## Kong 与验证码「Invalid authentication credentials」

在 Docker 中，前端请求会经 Caddy → Kong → GoTrue。Kong 的 key-auth 插件需要用与前端一致的 `SUPABASE_ANON_KEY` 校验请求。

- **原因**：原先挂载的 `kong.yml` 里写的是字面量 `${SUPABASE_ANON_KEY}`，Kong 不会做环境变量替换，导致校验失败。
- **处理**：已改为使用自定义 Kong 镜像（`supabase/Dockerfile.kong`），启动时用 `kong-entrypoint.sh` 从 `kong.yml.template` 生成 `kong.yml`，将占位符替换为环境变量；`docker-compose.yml` 中已为 `supabase-kong` 传入 `SUPABASE_ANON_KEY` 和 `SUPABASE_SERVICE_ROLE_KEY`。
- **操作**：确保 `.env` 中配置了 `SUPABASE_ANON_KEY` 和 `SUPABASE_SERVICE_ROLE_KEY`（与前端使用的 anon key 一致），然后重新构建并启动：  
  `docker compose build supabase-kong && docker compose up -d`

### 前端 anon key 与 Caddy 代理

- **前端 anon key**：Docker 构建时通过 build-arg 将 `SUPABASE_ANON_KEY` 注入为 `NEXT_PUBLIC_SUPABASE_ANON_KEY`，保证浏览器与 Kong 使用同一 key。`.dockerignore` 已排除 `.env`，避免占位符覆盖。
- **Supabase 请求路径**：浏览器访问 `http://127.0.0.1:38080` 时，前端请求的 Supabase 基址为同源（默认 `http://127.0.0.1:38080`）。Caddy 将 `/auth/v1*`、`/rest/v1*`、`/storage/v1*` 反向代理到 Kong，验证码等请求才能正常通过。

### 登录显示 "Failed to fetch"

- **原因 1**：`NEXT_PUBLIC_SUPABASE_ANON_KEY` 仍为占位符 `your-anon-key`。浏览器请求会因 Kong 校验失败或网络异常而报错。
- **处理**：在 `.env` 中设置 `NEXT_PUBLIC_SUPABASE_ANON_KEY` 与 `SUPABASE_ANON_KEY` 相同的 JWT 值。
- **原因 2**：`NEXT_PUBLIC_SUPABASE_URL` 与访问页不同源（如通过 `http://vernify.local:38080` 访问，但 URL 配置为 `http://localhost:38080`），导致 CORS 或连接失败。
- **处理**：`NEXT_PUBLIC_SUPABASE_URL` 需与访问页同源，例如通过 vernify.local 访问则设为 `http://vernify.local:38080`。
