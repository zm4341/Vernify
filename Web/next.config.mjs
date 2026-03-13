/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['js', 'jsx', 'ts', 'tsx'],
  output: 'standalone',
  // Docker dev：使用 /tmp/.next 避免 frontend_next volume 权限问题
  distDir: process.env.NEXT_DIST_DIR || '.next',
  transpilePackages: ['next-mdx-remote'],
  turbopack: {
    root: process.cwd(),
  },
  // 允许 Caddy 反向代理地址（localhost:38080）访问 dev server（含 HMR WebSocket）
  // 避免 Next.js dev server 将来源验证收紧后导致 WebSocket 连接失败
  allowedDevOrigins: ['localhost:38080', '127.0.0.1:38080'],
  experimental: {
    // Next.js 16 默认将 dev 输出写到 .next/dev/（即 /app/.next/dev/，Docker volume）
    // Turbopack 监视 /app/** 时会检测到这些写操作并触发无限重编译循环
    // 禁用后 dev 输出回归到 distDir（即 /tmp/.next/），不在被监视的 /app/ 树内
    isolatedDevBuild: false,
  },
};

export default nextConfig;
