import Navbar from "@/components/navbar";
// 注意：hero.tsx 文件不存在或不是有效的模块，请检查文件路径或创建该文件
import Hero from "@/components/hero";
import Features from "@/components/features";
import Stats from "@/components/stats";
import CTA from "@/components/cta";

export default function Page() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Features />
        <Stats />
        <CTA />
      </main>
    </>
  );
}
