/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['js', 'jsx', 'ts', 'tsx'],
  output: 'standalone',
  // Turbopack 要求 distDir 在 projectPath 内，不能用 ../next-dist
  // Docker dev 下用命名 volume 挂载 /app/.next，覆盖宿主机绑定挂载
  // Turbopack 自动将 distDir 排除在文件监视之外，不会产生无限重编译循环
  distDir: '.next',
  transpilePackages: ['next-mdx-remote'],
  turbopack: {
    root: process.cwd(),
  },
  // 允许 Caddy 反向代理地址（localhost:38080）访问 dev server（含 HMR WebSocket）
  allowedDevOrigins: ['localhost:38080', '127.0.0.1:38080'],
  experimental: {
    // isolatedDevBuild: false 防止 Next.js 16 将 dev 输出写到 distDir/dev/ 子目录
    isolatedDevBuild: false,
  },
};

export default nextConfig;
