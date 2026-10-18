import { Intro } from "@/components/Intro";
import { SiteHeader } from "@/components/SiteHeader";
import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Compare } from "@/components/landing/Compare";
import { Trust } from "@/components/landing/Trust";
import { Retailers } from "@/components/landing/Retailers";
import { Faq } from "@/components/landing/Faq";
import { Footer } from "@/components/landing/Footer";
import { Modal } from "@/components/landing/Modal";

export default function Home() {
  return (
    <>
      <Intro />
      <SiteHeader />
      <main id="main">
        <Hero />
        <HowItWorks />
        <Compare />
        <Trust />
        <Retailers />
        <Faq />
      </main>
      <Footer />
      <Modal />
    </>
  );
}
