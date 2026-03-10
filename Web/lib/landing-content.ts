/**
 * 落地页富文本内容（支持 MDX / Markdown）
 * 在 app/page.tsx 中用 MdxText 渲染后传递给 LandingClient
 */
export const landingContent = {
  /** Hero 副标题 */
  heroSubtitle: '语文 · 数学 · 英语 · 多学科学习',

  /** Hero 描述（支持 Markdown 与内联 span 高亮） */
  heroDesc: '从<span className="text-purple-400">四年级</span>到<span className="text-blue-400">高三</span>，按学科与年级自由选择<br />动画演示、<span className="text-pink-400">交互练习</span>与学习进度，助你系统提升',

  /** Problem 标题 */
  problemTitle: '学习枯燥？进度跟不上？',

  /** Problem 描述 */
  problemDesc: '传统刷题难以理解，知识点分散难串联。Lattice 用动画与交互，让抽象概念看得见。',

  /** Features 区块标题 */
  featuresTitle: '多学科 · 多年级 · 系统学习',

  /** 三个特性卡片描述（按 FEATURES 顺序） */
  featureDescs: ['语文 数学 英语', '小四至高三', '视频与练习'] as const,
} as const;
