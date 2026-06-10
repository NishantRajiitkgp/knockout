import { Nav } from "@/components/landing/Nav";
import { Hero } from "@/components/landing/Hero";
import { MarqueeBand } from "@/components/landing/MarqueeBand";
import { Pain } from "@/components/landing/Pain";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { FlowDiagram } from "@/components/landing/FlowDiagram";
import { TryItDemo } from "@/components/landing/TryItDemo";
import { Features } from "@/components/landing/Features";
import { ClosingCTA, Footer } from "@/components/landing/Footer";

export default function Home() {
  return (
    <main className="relative">
      <Nav />
      <Hero />
      <MarqueeBand />
      <Pain />
      <HowItWorks />
      <FlowDiagram />
      <TryItDemo />
      <Features />
      <ClosingCTA />
      <Footer />
    </main>
  );
}
