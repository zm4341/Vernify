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
};

export default nextConfig;
