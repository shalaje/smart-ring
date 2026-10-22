import { useEffect } from "react";
import { useLocation } from "react-router";
import type { Route } from "./+types/home";
import { pageMeta } from "~/lib/site";
import { ExperienceProvider, useTier } from "~/lib/experience";
import { scrollToId } from "~/lib/scroll";
import { overlay } from "~/lib/sceneState";
import { Nav } from "~/components/Nav";
import { SceneLayer } from "~/components/SceneLayer";
import { Controller } from "~/components/Controller";
import { Hero } from "~/components/sections/Hero";
import { Heart } from "~/components/sections/Heart";
import { Sleep } from "~/components/sections/Sleep";
import { Temperature } from "~/components/sections/Temperature";
import { Readiness } from "~/components/sections/Readiness";
import { Breathe } from "~/components/sections/Breathe";
import { RingSection } from "~/components/sections/RingSection";
import { AppSection } from "~/components/sections/App";
import { Privacy, SensorLabels } from "~/components/sections/Privacy";
import { Faq } from "~/components/sections/Faq";
import { HowItsMade } from "~/components/sections/HowItsMade";
import { Footer } from "~/components/Footer";

export const meta: Route.MetaFunction = () => pageMeta("Sela: your body, quietly understood (concept)");

function HashSync() {
  const tier = useTier();
  const { hash } = useLocation();
  useEffect(() => {
    if (tier === "pending" || !hash) return;
    const t = setTimeout(() => scrollToId(hash.slice(1)), 300);
    return () => clearTimeout(t);
  }, [tier, hash]);
  return null;
}

function Labels() {
  const tier = useTier();
  if (tier !== "full") return null;
  return <SensorLabels register={(i, el) => void (overlay.sensorLabels[i] = el)} />;
}

export default function Home() {
  return (
    <ExperienceProvider>
      <Controller />
      <HashSync />
      <Nav />
      <SceneLayer />
      <Labels />
      <main id="main" className="relative z-10">
        <Hero />
        <Heart />
        <Sleep />
        <Temperature />
        <Readiness />
        <Breathe />
        <RingSection />
        <AppSection />
        <Privacy />
        <Faq />
        <HowItsMade />
      </main>
      <Footer />
    </ExperienceProvider>
  );
}
