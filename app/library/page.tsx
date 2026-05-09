"use client";

import { useState } from "react";
import LibraryRoot, { PaletteId, FontPair, Mode } from "@/components/library/_lib/LibraryRoot";

// Lote 1
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

// Lote 2
import Pricing3TierComparison from "@/components/library/pricing/Pricing3TierComparison";
import StatsMetricsRow from "@/components/library/stats/StatsMetricsRow";
import LogosPressStrip from "@/components/library/logos/LogosPressStrip";
import ArticlesGrid3Col from "@/components/library/blog/ArticlesGrid3Col";
import ServicesNumberedExpanded from "@/components/library/services/ServicesNumberedExpanded";
import CtaBannerClosing from "@/components/library/cta/CtaBannerClosing";
import GalleryImageGrid from "@/components/library/gallery/GalleryImageGrid";
import ProcessVerticalTimeline from "@/components/library/process/ProcessVerticalTimeline";
import TestimonialsSingleNavigated from "@/components/library/testimonials/TestimonialsSingleNavigated";
import FooterWordmarkBold from "@/components/library/footer/FooterWordmarkBold";

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

const FONT_PAIRS: { id: FontPair; label: string; group: "free" | "premium" }[] = [
  // Free
  { id: "inter", label: "Inter", group: "free" },
  { id: "geist-inter", label: "Geist + Inter", group: "free" },
  { id: "fraunces-inter", label: "Fraunces + Inter", group: "free" },
  { id: "instrument-jakarta", label: "Instrument Serif + Plus Jakarta", group: "free" },
  { id: "space-inter", label: "Space Grotesk + Inter", group: "free" },
  { id: "cormorant-jakarta", label: "Cormorant + Plus Jakarta", group: "free" },
  { id: "manrope", label: "Manrope", group: "free" },
  { id: "newsreader-inter", label: "Newsreader + Inter", group: "free" },
  { id: "mono-inter", label: "JetBrains Mono + Inter", group: "free" },
  // Premium (fallback to curated free when license absent)
  { id: "sohne-tiempos", label: "Söhne + Tiempos (premium)", group: "premium" },
  { id: "founders-tight", label: "Founders Grotesk + Inter Tight (premium)", group: "premium" },
  { id: "editorial-inter", label: "PP Editorial + Inter (premium)", group: "premium" },
];

// ────── Sample content ──────
const SAMPLE = {
  // Lote 1
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
      { label: "Instagram" as const, href: "#" },
      { label: "LinkedIn" as const, href: "#" },
      { label: "Email" as const, href: "mailto:hello@example.com" },
    ],
    legalLinks: [
      { label: "Privacidade", href: "#" },
      { label: "Termos", href: "#" },
    ],
  },

  // Lote 2
  pricing: {
    eyebrow: "Pricing",
    headline: "Escolha o plano certo.",
    subheadline: "Pagamento único. Sem subscrições escondidas. Garantia de 14 dias.",
    tiers: [
      {
        name: "Starter",
        price: "€490",
        period: "uma vez",
        description: "Landing page única. Ideal para lançamentos.",
        features: ["1 página", "5-7 secções", "Mobile-first", "Entrega em 48-72h", "1 ronda de revisões"],
        ctaLabel: "Escolher Starter",
      },
      {
        name: "Studio",
        price: "€890",
        period: "uma vez",
        description: "Site completo até 5 páginas.",
        features: ["Até 5 páginas", "Copywriting incluído", "SEO básico configurado", "Mobile-first", "Entrega em 5 dias", "1 ronda de revisões"],
        ctaLabel: "Escolher Studio",
        highlighted: true,
        badge: "Mais popular",
      },
      {
        name: "Backoffice",
        price: "€1.490",
        period: "uma vez",
        description: "Site + ferramenta interna à medida.",
        features: ["Tudo no Studio", "Backoffice à medida", "Login e área privada", "Até 7 páginas", "Entrega em 10 dias"],
        ctaLabel: "Escolher Backoffice",
      },
    ],
    footnote: "Todos os planos incluem 14 dias de suporte pós-lançamento.",
  },
  stats: {
    eyebrow: "Em números",
    headline: "Confiança que se mede.",
    stats: [
      { value: "94%", label: "Clientes satisfeitos com a primeira entrega", bar: 94 },
      { value: "89%", label: "Projetos entregues dentro do prazo", bar: 89 },
      { value: "5", label: "Dias média do briefing ao live" },
      { value: "25+", label: "Indústrias servidas" },
    ],
  },
  logos: {
    eyebrow: "Confiam em nós",
    headline: "Equipas que escolhem trabalhar connosco.",
    logos: [
      { name: "Santa Justa" },
      { name: "Kech Pics" },
      { name: "SFBA" },
      { name: "Dental Crafters" },
      { name: "A Merendeira" },
      { name: "Herdade dos Moreiros" },
      { name: "Tech Fusion" },
      { name: "Informal Labs" },
      { name: "Deserve" },
      { name: "Studio X" },
    ],
    variant: "grid" as const,
  },
  articles: {
    eyebrow: "Journal",
    headline: "Notas da prática.",
    subheadline: "Como pensamos sobre design, processo, e o ofício.",
    articles: [
      {
        title: "O que torna um hero realmente eficaz",
        excerpt: "Três decisões que fazem o utilizador entender o que vendemos em 4 segundos.",
        imageUrl: "https://images.unsplash.com/photo-1559028012-481c04fa702d?auto=format&fit=crop&w=900&q=80",
        category: "Design",
        date: "Out 2026",
        readTime: "6 min",
        href: "#",
      },
      {
        title: "Token-driven design systems na prática",
        excerpt: "Como construir uma library que resiste a 50 marcas diferentes sem ramificar o código.",
        imageUrl: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=900&q=80",
        category: "Engineering",
        date: "Set 2026",
        readTime: "9 min",
        href: "#",
      },
      {
        title: "Por que recusamos 30% dos pedidos que recebemos",
        excerpt: "A diferença entre o cliente certo e o cliente urgente. Lições que custaram caro.",
        imageUrl: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=900&q=80",
        category: "Negócio",
        date: "Ago 2026",
        readTime: "4 min",
        href: "#",
      },
    ],
    viewAllLabel: "Ver todos",
    viewAllHref: "#",
  },
  servicesNumbered: {
    eyebrow: "Capacidades",
    headline: "Quatro áreas, integradas.",
    services: [
      {
        title: "Brand Strategy & Design",
        description: "Construímos sistemas visuais que aguentam crescimento. Logo, cor, tipografia, voz, e os princípios que mantêm tudo coerente quando a equipa cresce.",
        capabilities: ["Logo & wordmark", "Sistema de cor", "Tipografia", "Voz e tom", "Brand guidelines"],
        resources: [
          { label: "Caso: Santa Justa rebrand", meta: "Read · 6 min", href: "#" },
          { label: "Framework: Brand Sprint", meta: "Download · PDF", href: "#" },
        ],
      },
      {
        title: "Web Design & Build",
        description: "Sites à medida, mobile-first, otimizados para conversão e velocidade. Webflow, Framer ou código, conforme a necessidade.",
        capabilities: ["Wireframes", "UI design", "Webflow / Framer", "Performance audit", "SEO técnico"],
        resources: [
          { label: "Caso: SFBA Advogados", meta: "Read · 4 min", href: "#" },
          { label: "Template: Site Brief", meta: "Download · PDF", href: "#" },
        ],
      },
      {
        title: "Digital Product",
        description: "Backoffices, dashboards, e ferramentas internas que tornam operações repetitivas em fluxos automáticos.",
        capabilities: ["UX research", "Design system", "React + Next.js", "Auth & permissões", "Integrações API"],
        resources: [
          { label: "Caso: Tech Fusion CRM", meta: "Read · 8 min", href: "#" },
        ],
      },
      {
        title: "Ongoing Partnership",
        description: "Iteração contínua mensal — A/B tests, novos componentes, novas páginas, conforme o negócio cresce.",
        capabilities: ["Retainer mensal", "Roadmap partilhado", "A/B testing", "Performance monitoring"],
      },
    ],
  },
  cta: {
    eyebrow: "Pronto?",
    headline: "Vamos construir algo que vende.",
    subheadline: "3 minutos para configurar o briefing. Brief inicial em 24h. Site live em dias.",
    primaryCtaLabel: "Começar projeto",
    secondaryCtaLabel: "Marcar chamada",
    variant: "island" as const,
  },
  gallery: {
    eyebrow: "Trabalho selecionado",
    headline: "Projetos recentes.",
    subheadline: "Uma amostra de 60+ entregas.",
    items: [
      { imageUrl: "https://images.unsplash.com/photo-1521334884684-d80222895322?auto=format&fit=crop&w=1200&q=80", title: "Santa Justa", category: "Restauração", shape: "wide" as const, href: "#" },
      { imageUrl: "https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=900&q=80", title: "Kech Pics", category: "Fotografia", shape: "tall" as const, href: "#" },
      { imageUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=900&q=80", title: "SFBA", category: "Jurídico", shape: "square" as const, href: "#" },
      { imageUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=900&q=80", title: "Dental Crafters", category: "Saúde", shape: "square" as const, href: "#" },
      { imageUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=900&q=80", title: "A Merendeira", category: "Comércio", shape: "square" as const, href: "#" },
      { imageUrl: "https://images.unsplash.com/photo-1542621334-a254cf47733d?auto=format&fit=crop&w=1200&q=80", title: "Herdade dos Moreiros", category: "Hospitalidade", shape: "wide" as const, href: "#" },
    ],
    viewAllLabel: "Ver todos os projetos",
    viewAllHref: "#",
  },
  process: {
    eyebrow: "Como trabalhamos",
    headline: "Cinco passos do briefing ao live.",
    subheadline: "Sem reuniões inúteis. Cada passo tem um deliverable claro.",
    steps: [
      { title: "Briefing", meta: "Dia 1", description: "Define-se estilo, paleta, tom e referências em 30 minutos. Sem follow-ups." },
      { title: "Wireframe + Copy", meta: "Dia 2", description: "Estrutura de cada página com copywriting integrado. Aprovação assíncrona." },
      { title: "Design Visual", meta: "Dia 3-4", description: "Aplicação do sistema de design ao briefing. Mockups full-fidelity." },
      { title: "Build & QA", meta: "Dia 5-6", description: "Implementação técnica responsiva. Lighthouse > 90. Cross-browser tested." },
      { title: "Launch", meta: "Dia 7", description: "Push para live + 14 dias de suporte pós-lançamento." },
    ],
  },
  testimonialsSingle: {
    eyebrow: "Clientes",
    testimonials: [
      {
        quote: "Recomendámos a metade de Lisboa. Velocidade de execução sénior — coisa rara.",
        author: "Inês Garcia",
        role: "Owner",
        company: "Santa Justa",
        avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
      },
      {
        quote: "Em três dias entregaram um site melhor do que orçamentos de €8.000 que tínhamos recebido.",
        author: "Tiago Faria",
        role: "Sócio",
        company: "SFBA Advogados",
        avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80",
      },
      {
        quote: "O site passou a fazer o trabalho que três comerciais faziam. Pagou-se em duas semanas.",
        author: "André Pinto",
        role: "Diretor",
        company: "A Merendeira",
        avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
      },
    ],
  },
  footerWord: {
    brandName: "STUDIO",
    tagline: "Design e desenvolvimento à medida para negócios que querem avançar rápido. Lisboa · Porto · Remote.",
    columns: [
      {
        title: "Estúdio",
        links: [
          { label: "Trabalho", href: "#" },
          { label: "Serviços", href: "#" },
          { label: "Sobre", href: "#" },
        ],
      },
      {
        title: "Recursos",
        links: [
          { label: "Journal", href: "#" },
          { label: "Casos", href: "#" },
        ],
      },
      {
        title: "Contacto",
        links: [
          { label: "hello@studio.com", href: "mailto:hello@studio.com" },
          { label: "WhatsApp", href: "#" },
        ],
      },
    ],
    socialLinks: [
      { label: "Instagram" as const, href: "#" },
      { label: "LinkedIn" as const, href: "#" },
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
  const [fontPair, setFontPair] = useState<FontPair>("inter");

  return (
    <div style={{ background: "#0A0A0A", color: "#EDEDED", minHeight: "100vh" }}>
      <header
        className="sticky top-0 z-50 border-b border-[#1F1F1F]"
        style={{ background: "#0A0A0A" }}
      >
        <div className="max-w-[1400px] mx-auto px-5 sm:px-6 md:px-8 py-3 sm:py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <span className="text-xs uppercase tracking-[0.16em] text-[#888] font-semibold">Studio</span>
            <span className="text-sm sm:text-base text-[#EDEDED] ml-3">Component Library — 20 blocks (Lote 1 + 2)</span>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm">
            <Select label="Palette" value={palette} onChange={(v) => setPalette(v as PaletteId)} options={PALETTES} />
            <Select label="Mode" value={mode} onChange={(v) => setMode(v as Mode)} options={[{ id: "dark", label: "Dark" }, { id: "light", label: "Light" }]} />
            <FontSelect value={fontPair} onChange={setFontPair} />
          </div>
        </div>
      </header>

      <LibraryRoot palette={palette} mode={mode} fontPair={fontPair}>
        {/* ─── Lote 1 ─── */}
        <SectionLabel id="hero-centered-display" lote="1" />
        <HeroCenteredDisplay {...SAMPLE.hero} />

        <SectionLabel id="hero-split-image-text" lote="1" />
        <HeroSplitImageText {...SAMPLE.heroSplit} />

        <SectionLabel id="hero-bold-statement" lote="1" />
        <HeroBoldStatement {...SAMPLE.heroBold} />

        <SectionLabel id="services-grid-3col" lote="1" />
        <ServicesGrid3Col {...SAMPLE.servicesGrid} />

        <SectionLabel id="services-accordion" lote="1" />
        <ServicesAccordion {...SAMPLE.servicesAccordion} />

        <SectionLabel id="testimonials-rotating-quote" lote="1" />
        <TestimonialsRotatingQuote {...SAMPLE.testimonialsRotating} />

        <SectionLabel id="testimonials-marquee" lote="1" />
        <TestimonialsMarquee {...SAMPLE.testimonialsMarquee} />

        <SectionLabel id="about-portrait-bio" lote="1" />
        <AboutPortraitBio {...SAMPLE.about} />

        <SectionLabel id="contact-form-split" lote="1" />
        <ContactFormSplit {...SAMPLE.contact} />

        <SectionLabel id="footer-minimal-3col" lote="1" />
        <FooterMinimal3Col {...SAMPLE.footer} />

        {/* ─── Lote 2 ─── */}
        <SectionLabel id="pricing-3tier-comparison" lote="2" />
        <Pricing3TierComparison {...SAMPLE.pricing} />

        <SectionLabel id="stats-metrics-row" lote="2" />
        <StatsMetricsRow {...SAMPLE.stats} />

        <SectionLabel id="logos-press-strip" lote="2" />
        <LogosPressStrip {...SAMPLE.logos} />

        <SectionLabel id="articles-grid-3col" lote="2" />
        <ArticlesGrid3Col {...SAMPLE.articles} />

        <SectionLabel id="services-numbered-expanded" lote="2" />
        <ServicesNumberedExpanded {...SAMPLE.servicesNumbered} />

        <SectionLabel id="cta-banner-closing" lote="2" />
        <CtaBannerClosing {...SAMPLE.cta} />

        <SectionLabel id="gallery-image-grid" lote="2" />
        <GalleryImageGrid {...SAMPLE.gallery} />

        <SectionLabel id="process-vertical-timeline" lote="2" />
        <ProcessVerticalTimeline {...SAMPLE.process} />

        <SectionLabel id="testimonials-single-navigated" lote="2" />
        <TestimonialsSingleNavigated {...SAMPLE.testimonialsSingle} />

        <SectionLabel id="footer-wordmark-bold" lote="2" />
        <FooterWordmarkBold {...SAMPLE.footerWord} />
      </LibraryRoot>
    </div>
  );
}

function SectionLabel({ id, lote }: { id: string; lote: string }) {
  return (
    <div
      id={id}
      className="border-y border-lib-border bg-lib-surface/50 backdrop-blur-sm"
      style={{ paddingTop: 12, paddingBottom: 12 }}
    >
      <div className="max-w-[1200px] mx-auto px-5 sm:px-6 md:px-8 lg:px-10 flex items-center justify-between text-xs sm:text-sm">
        <div className="flex items-center gap-3">
          <span className="text-[10px] uppercase tracking-[0.16em] font-bold px-2 py-0.5 rounded-full bg-lib-accent/15 text-lib-accent">
            Lote {lote}
          </span>
          <code className="text-lib-muted font-mono">{id}</code>
        </div>
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

function FontSelect({
  value,
  onChange,
}: {
  value: FontPair;
  onChange: (v: FontPair) => void;
}) {
  const free = FONT_PAIRS.filter((p) => p.group === "free");
  const premium = FONT_PAIRS.filter((p) => p.group === "premium");
  return (
    <label className="inline-flex items-center gap-2">
      <span className="text-[#888]">Type</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as FontPair)}
        className="bg-[#131313] border border-[#2A2A2A] text-[#EDEDED] rounded-md px-2 py-1.5 outline-none focus:border-[#FAFAFA] cursor-pointer"
      >
        <optgroup label="Free">
          {free.map((o) => (
            <option key={o.id} value={o.id}>{o.label}</option>
          ))}
        </optgroup>
        <optgroup label="Premium (license needed)">
          {premium.map((o) => (
            <option key={o.id} value={o.id}>{o.label}</option>
          ))}
        </optgroup>
      </select>
    </label>
  );
}
