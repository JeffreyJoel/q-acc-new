'use client';

import About from '@/components/discover/About';
import { Blog } from '@/components/discover/Blog';
import FAQs from '@/components/discover/FAQs';
import HeroSection from '@/components/discover/HeroSection';
import Projects from '@/components/discover/projects';

export default function Home() {
  return (
    <>
      <HeroSection />
      <Projects />
      <About />
      <Blog />
    </>
  );
}
