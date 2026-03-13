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
};

export default nextConfig;
