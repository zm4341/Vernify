import { getAllLessons } from '@/lib/content';
import HomeClient from '@/components/HomeClient';
import LandingClient from '@/components/LandingClient';
import { createClient } from '@/lib/supabase/server';
import { MdxText } from '@/lib/mdx';
import { landingContent } from '@/lib/landing-content';

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // 未登录：显示公开落地页（文案用 MDX 渲染，支持富文本）
  if (!user) {
    const heroSubtitle = <MdxText source={landingContent.heroSubtitle} />;
    const heroDesc = <MdxText source={landingContent.heroDesc} />;
    const problemTitle = <MdxText source={landingContent.problemTitle} />;
    const problemDesc = <MdxText source={landingContent.problemDesc} />;
    const featuresTitle = <MdxText source={landingContent.featuresTitle} />;
    const featureDescs: [React.ReactNode, React.ReactNode, React.ReactNode] = [
      <MdxText key="0" source={landingContent.featureDescs[0]} />,
      <MdxText key="1" source={landingContent.featureDescs[1]} />,
      <MdxText key="2" source={landingContent.featureDescs[2]} />,
    ];
    return (
      <LandingClient
        heroSubtitle={heroSubtitle}
        heroDesc={heroDesc}
        problemTitle={problemTitle}
        problemDesc={problemDesc}
        featuresTitle={featuresTitle}
        featureDescs={featureDescs}
      />
    );
  }

  const lessons = await getAllLessons();
  return <HomeClient lessons={lessons} />;
}
