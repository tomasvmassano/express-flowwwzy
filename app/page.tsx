import Hero from "@/components/Hero";
import ProblemAgitation from "@/components/ProblemAgitation";
import HowItWorks from "@/components/HowItWorks";
import Benefits from "@/components/Benefits";
import Portfolio from "@/components/Portfolio";
import Founder from "@/components/Founder";
import WhoFor from "@/components/WhoFor";
import FAQ from "@/components/FAQ";
import Pricing from "@/components/Pricing";
import FinalCTA from "@/components/FinalCTA";
import Configurator from "@/components/Configurator";
import PreviewScreen from "@/components/PreviewScreen";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

// Section order follows the landing-page-builder skill:
// Hero → Problem → Solution → Benefits → Proof → Objections → Offer → Final CTA
export default function HomePage() {
  return (
    <>
      <main>
        <Hero />
        <ProblemAgitation />
        <HowItWorks />
        <Benefits />
        <Portfolio />
        <Founder />
        <WhoFor />
        <FAQ />
        <Pricing />
        <FinalCTA />
        <Configurator />
        <PreviewScreen />
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
