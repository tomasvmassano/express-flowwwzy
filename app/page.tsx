import Hero from "@/components/Hero";
import ProblemAgitation from "@/components/ProblemAgitation";
import HowItWorks from "@/components/HowItWorks";
import Portfolio from "@/components/Portfolio";
import Pricing from "@/components/Pricing";
import WhoFor from "@/components/WhoFor";
import FAQ from "@/components/FAQ";
import Configurator from "@/components/Configurator";
import PreviewScreen from "@/components/PreviewScreen";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

export default function HomePage() {
  return (
    <>
      <main>
        <Hero />
        <ProblemAgitation />
        <HowItWorks />
        <Portfolio />
        <Pricing />
        <WhoFor />
        <FAQ />
        <Configurator />
        <PreviewScreen />
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
