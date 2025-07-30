"use client";

import HeroSection from "@/components/discover/HeroSection";
import Projects from "@/components/discover/projects";
import About from "@/components/discover/About";
import FAQs from "@/components/discover/FAQs";
import { Blog } from "@/components/discover/Blog";

export default function Home() {

  return (
    <>
      <HeroSection />
      <Projects />
      <About />
      <FAQs />
      {/* <Blog /> */}
    </>
  );
}
