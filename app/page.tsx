import Navbar from "@/components/navbar";
import Hero from "@/components/hero";
import Features from "@/components/features";
import Stats from "@/components/stats";
import CTA from "@/components/cta";
import LightningBackground from "@/components/LightningBackground";

export default function Page() {
  return (
    <>
      <LightningBackground />
      <Navbar />
      <main className="relative z-10">
        <Hero />
        <Features />
        <Stats />
        <CTA />
      </main>
    </>
  );
}
