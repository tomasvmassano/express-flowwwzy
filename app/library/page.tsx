"use client";

import { useState } from "react";
import LibraryRoot, { PaletteId, FontPair, Mode } from "@/components/library/_lib/LibraryRoot";

import HeroCenteredDisplay from "@/components/library/heroes/HeroCenteredDisplay";
import HeroSplitImageText from "@/components/library/heroes/HeroSplitImageText";
import HeroBoldStatement from "@/components/library/heroes/HeroBoldStatement";
import ServicesGrid3Col from "@/components/library/services/ServicesGrid3Col";
import ServicesAccordion from "@/components/library/services/ServicesAccordion";
import TestimonialsRotatingQuote from "@/components/library/testimonials/TestimonialsRotatingQuote";
import TestimonialsMarquee from "@/components/library/testimonials/TestimonialsMarquee";
import AboutPortraitBio from "@/components/library/about/AboutPortraitBio";
import ContactFormSplit from "@/components/library/contact/ContactFormSplit";
import FooterMinimal3Col from "@/components/library/footer/FooterMinimal3Col";

const PALETTES: { id: PaletteId; label: string }[] = [
  { id: "default", label: "Default" },
  { id: "black-cream", label: "Black & Cream" },
  { id: "forest", label: "Forest" },
  { id: "coastal", label: "Coastal" },
  { id: "warm-sand", label: "Warm Sand" },
  { id: "bold-red", label: "Bold Red" },
  { id: "royal", label: "Royal" },
  { id: "mono-plus", label: "Mono Plus" },
  { id: "sunset", label: "Sunset" },
];

const FONT_PAIRS: { id: FontPair; label: string }[] = [
  { id: "default", label: "Inter" },
  { id: "sans-pair", label: "Geist + Inter" },
  { id: "serif-sans", label: "Fraunces + Inter" },
  { id: "display-body", label: "PP Editorial + Inter" },
];

// Sample content for the demo. The real generator fills slots from form data.
const SAMPLE = {
  hero: {
    eyebrow: "Productized web design",
    headline: "Sites profissionais, prontos em dias.",
    subheadline:
      "Design à medida, feito por uma equipa sénior. Sem reuniões, sem propostas eternas, sem esperar três meses.",
    primaryCtaLabel: "Começar projeto",
    secondaryCtaLabel: "Ver trabalho",
  },
  heroSplit: {
    eyebrow: "Studio",
    headline: "Espaços que respiram, sites que vendem.",
    subheadline:
      "Trabalhamos com pequenos negócios que querem uma presença online à altura do que oferecem em pessoa.",
    imageUrl:
      "https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=1200&q=80",
    primaryCtaLabel: "Conhecer estúdio",
    secondaryCtaLabel: "Ver projetos",
  },
  heroBold: {
    eyebrow: "Manifesto",
    statement: "Built to sell. Designed to last.",
    accentWord: "sell",
    byline:
      "Cada projeto é desenhado para converter, não para impressionar designers. Resultados primeiro, prémios depois.",
    primaryCtaLabel: "Falar connosco",
  },
  servicesGrid: {
    eyebrow: "Serviços",
    headline: "O que entregamos.",
    subheadline: "Três caminhos. Um padrão de qualidade.",
    services: [
      { title: "Web Design", description: "Sites à medida com foco em conversão e clareza editorial.", label: "01" },
      { title: "Branding", description: "Sistemas visuais que crescem com o negócio sem perder coerência.", label: "02" },
      { title: "Webflow & Shopify", description: "Implementação técnica que clientes podem manter sozinhos.", label: "03" },
    ],
  },
  servicesAccordion: {
    eyebrow: "O processo",
    headline: "Cinco passos do briefing ao lançamento.",
    items: [
      { title: "Direção criativa", description: "Definimos o estilo, a paleta e o tom em conjunto. 30 minutos." },
      { title: "Wireframe e copy", description: "Estrutura de cada página + copywriting com ângulo claro." },
      { title: "Design visual", description: "Aplicação do sistema de design ao briefing concreto." },
      { title: "Build e responsivo", description: "Implementação técnica com performance > 90 em Lighthouse." },
      { title: "Lançamento e suporte", description: "Push to live + 14 dias de suporte pós-lançamento." },
    ],
  },
  testimonialsRotating: {
    eyebrow: "Clientes",
    testimonials: [
      { quote: "Mudaram a forma como as pessoas chegam ao restaurante. As reservas online dispararam.", author: "Inês Garcia", role: "Owner, Santa Justa" },
      { quote: "Em três dias tínhamos um site melhor do que orçamentos de 8 mil euros que tínhamos recebido.", author: "Tiago Faria", role: "Sócio, SFBA Advogados" },
      { quote: "Voltariam a trabalhar com eles amanhã. Sénior, rápido, sem dramas.", author: "Marta Sousa", role: "Diretora, Dental Crafters" },
    ],
  },
  testimonialsMarquee: {
    eyebrow: "60+ projetos entregues",
    headline: "O que dizem os clientes.",
    testimonials: [
      { quote: "Dobramos a base de clientes em três meses.", author: "Omar Abouzrar", role: "Kech Pics" },
      { quote: "O site faz o trabalho que três comerciais faziam.", author: "André Pinto", role: "A Merendeira" },
      { quote: "Nunca um projeto correu tão dentro do prazo.", author: "Sofia Ramos", role: "Herdade dos Moreiros" },
      { quote: "Recomendámos a meio Lisboa.", author: "Pedro Lima", role: "Tech Fusion" },
      { quote: "A primeira agência que entregou exatamente o que prometeu.", author: "Carla Mendes", role: "Informal Labs" },
    ],
  },
  about: {
    eyebrow: "Quem está por trás",
    name: "Tomás Massano",
    role: "Founder · Design Lead",
    bio: "Construí o estúdio depois de ver demasiados negócios bons presos com sites que não os representavam. O que entrego é trabalho de estúdio sem o calendário de estúdio. Cada projeto passa por mim antes de sair.",
    portraitUrl:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=80",
    portraitAlt: "Retrato do founder",
    stats: [
      { value: "60+", label: "Projetos" },
      { value: "8 anos", label: "Experiência" },
      { value: "15+", label: "Indústrias" },
    ],
    ctaLabel: "Marcar conversa",
  },
  contact: {
    eyebrow: "Vamos conversar",
    headline: "Conte-nos sobre o seu projeto.",
    subheadline: "Respondemos em 24h úteis. Sem pitches enlatados.",
    imageUrl:
      "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Espaço do estúdio",
    contactLines: [
      { label: "Email", value: "hello@example.com", href: "mailto:hello@example.com" },
      { label: "Lisboa", value: "Avenida da Liberdade 110, 1250-146" },
      { label: "Porto", value: "Rua do Almada 200, 4050-038" },
    ],
  },
  footer: {
    brandName: "Studio",
    tagline: "Design e desenvolvimento à medida para negócios que querem avançar rápido.",
    columns: [
      {
        title: "Estúdio",
        links: [
          { label: "Trabalho", href: "#" },
          { label: "Serviços", href: "#" },
          { label: "Sobre", href: "#" },
          { label: "Contacto", href: "#" },
        ],
      },
      {
        title: "Recursos",
        links: [
          { label: "Blog", href: "#" },
          { label: "Casos de estudo", href: "#" },
          { label: "Newsletter", href: "#" },
        ],
      },
    ],
    socialLinks: [
      { label: "Instagram", href: "#" } as const,
      { label: "LinkedIn", href: "#" } as const,
      { label: "Email", href: "mailto:hello@example.com" } as const,
    ],
    legalLinks: [
      { label: "Privacidade", href: "#" },
      { label: "Termos", href: "#" },
    ],
  },
};

export default function LibraryDemoPage() {
  const [palette, setPalette] = useState<PaletteId>("default");
  const [mode, setMode] = useState<Mode>("dark");
  const [fontPair, setFontPair] = useState<FontPair>("default");

  return (
    <div style={{ background: "#0A0A0A", color: "#EDEDED", minHeight: "100vh" }}>
      {/* Sticky control bar (NOT inside lib-theme — it's a meta UI) */}
      <header
        className="sticky top-0 z-50 border-b border-[#1F1F1F]"
        style={{ background: "#0A0A0A" }}
      >
        <div className="max-w-[1400px] mx-auto px-5 sm:px-6 md:px-8 py-3 sm:py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <span className="text-xs uppercase tracking-[0.16em] text-[#888] font-semibold">Studio</span>
            <span className="text-sm sm:text-base text-[#EDEDED] ml-3">Component Library — Lote 1 (10 blocks)</span>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm">
            <Select label="Palette" value={palette} onChange={(v) => setPalette(v as PaletteId)} options={PALETTES} />
            <Select label="Mode" value={mode} onChange={(v) => setMode(v as Mode)} options={[{ id: "dark", label: "Dark" }, { id: "light", label: "Light" }]} />
            <Select label="Type" value={fontPair} onChange={(v) => setFontPair(v as FontPair)} options={FONT_PAIRS} />
          </div>
        </div>
      </header>

      {/* Render every block under one shared LibraryRoot so the theme applies uniformly */}
      <LibraryRoot palette={palette} mode={mode} fontPair={fontPair}>
        <BlockLabel id="hero-centered-display" />
        <HeroCenteredDisplay {...SAMPLE.hero} />

        <BlockLabel id="hero-split-image-text" />
        <HeroSplitImageText {...SAMPLE.heroSplit} />

        <BlockLabel id="hero-bold-statement" />
        <HeroBoldStatement {...SAMPLE.heroBold} />

        <BlockLabel id="services-grid-3col" />
        <ServicesGrid3Col {...SAMPLE.servicesGrid} />

        <BlockLabel id="services-accordion" />
        <ServicesAccordion {...SAMPLE.servicesAccordion} />

        <BlockLabel id="testimonials-rotating-quote" />
        <TestimonialsRotatingQuote {...SAMPLE.testimonialsRotating} />

        <BlockLabel id="testimonials-marquee" />
        <TestimonialsMarquee {...SAMPLE.testimonialsMarquee} />

        <BlockLabel id="about-portrait-bio" />
        <AboutPortraitBio {...SAMPLE.about} />

        <BlockLabel id="contact-form-split" />
        <ContactFormSplit {...SAMPLE.contact} />

        <BlockLabel id="footer-minimal-3col" />
        <FooterMinimal3Col {...SAMPLE.footer} />
      </LibraryRoot>
    </div>
  );
}

function BlockLabel({ id }: { id: string }) {
  return (
    <div
      className="border-y border-lib-border bg-lib-surface/50 backdrop-blur-sm"
      style={{ paddingTop: 12, paddingBottom: 12 }}
    >
      <div className="max-w-[1200px] mx-auto px-5 sm:px-6 md:px-8 lg:px-10 flex items-center justify-between text-xs sm:text-sm">
        <code className="text-lib-muted font-mono">{id}</code>
        <a
          href={`#${id}`}
          className="text-lib-muted hover:text-lib-accent transition-colors"
          aria-label={`Anchor for ${id}`}
        >
          #
        </a>
      </div>
    </div>
  );
}

function Select<T extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: T;
  onChange: (v: T) => void;
  options: { id: T; label: string }[];
}) {
  return (
    <label className="inline-flex items-center gap-2">
      <span className="text-[#888]">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="bg-[#131313] border border-[#2A2A2A] text-[#EDEDED] rounded-md px-2 py-1.5 outline-none focus:border-[#FAFAFA] cursor-pointer"
      >
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
