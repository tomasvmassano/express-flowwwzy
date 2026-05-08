"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Logo from "@/components/Logo";
import Footer from "@/components/Footer";
import { useEffect } from "react";
import { track } from "@/lib/analytics";

const upsells = [
  { name: "Copywriting profissional", desc: "Cada palavra do site escrita pela nossa equipa.", price: 200 },
  { name: "Páginas extra", desc: "Adicione mais páginas ao seu site quando precisar.", price: 150, suffix: " /página" },
  { name: "Sistema de blog", desc: "Blog totalmente integrado, pronto para SEO.", price: 300 },
  { name: "Setup de email marketing", desc: "Configuração completa em Brevo, Mailchimp ou ConvertKit.", price: 250 },
];

export default function ThankYou() {
  useEffect(() => {
    track("Purchase");
  }, []);

  const eta = (() => {
    const d = new Date();
    let added = 0;
    while (added < 5) {
      d.setDate(d.getDate() + 1);
      if (d.getDay() !== 0 && d.getDay() !== 6) added++;
    }
    return d.toLocaleDateString("pt-PT", { day: "numeric", month: "long" });
  })();

  return (
    <>
      <main className="min-h-screen pt-12 md:pt-16 pb-16">
        <div className="container-x flex items-center justify-between mb-16">
          <div className="flex items-baseline gap-2">
            <Logo />
            <span className="text-gray-500 text-sm">Express</span>
          </div>
          <Link href="/" className="text-gray-500 text-body-sm hover:text-white link-underline">
            ← Voltar ao início
          </Link>
        </div>

        <div className="container-x spotlight pt-10 pb-20">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.165, 0.84, 0.44, 1] }}
            className="max-w-[800px]"
          >
            <span className="label">Confirmado</span>
            <h1 className="mt-3">
              Recebemos o seu projeto.<br /><span className="italic-accent">Vamos começar.</span>
            </h1>

            <div className="mt-12 card-dark p-7 md:p-9">
              <p className="text-gray-300 text-body-lg mb-6">Em breve vai receber:</p>
              <ul className="space-y-4 text-base text-gray-300">
                <Item>Email de confirmação com todos os detalhes</Item>
                <Item>Brief inicial do projeto (em 24h)</Item>
                <Item>Data de entrega prevista: <span className="text-white">{eta}</span></Item>
                <Item>Link para o canal de comunicação direto com a equipa</Item>
              </ul>
            </div>

            <div className="mt-14">
              <h2 className="text-3xl md:text-h2" style={{ fontWeight: 500, letterSpacing: "-0.02em" }}>
                Entretanto, pode <span className="italic-accent">adicionar:</span>
              </h2>
              <div className="mt-8 grid md:grid-cols-2 gap-5">
                {upsells.map((u) => (
                  <div key={u.name} className="card-dark p-6 flex flex-col">
                    <div className="flex items-baseline justify-between gap-3 mb-2">
                      <h3 className="text-h3" style={{ fontWeight: 500 }}>{u.name}</h3>
                      <span className="text-cream font-medium whitespace-nowrap">+€{u.price}{u.suffix || ""}</span>
                    </div>
                    <p className="text-gray-500 text-body-sm flex-1">{u.desc}</p>
                    <a
                      href="mailto:hello@flowwwzy.com?subject=Adicionar%20ao%20projeto"
                      className="btn-dark mt-5 self-start"
                    >
                      Adicionar →
                    </a>
                  </div>
                ))}
              </div>
            </div>

            <p className="mt-14 text-gray-300">
              Tem dúvidas? Responda ao email de confirmação ou contacte-nos no{" "}
              <a
                href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "351912345678"}`}
                target="_blank"
                rel="noopener"
                className="text-cream link-underline"
              >
                WhatsApp
              </a>.
            </p>
          </motion.div>
        </div>
      </main>
      <Footer />
    </>
  );
}

function Item({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="flex-shrink-0 mt-1" aria-hidden>
        <path d="M4 10.5L8 14.5L16 6.5" stroke="#FAEBE3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span>{children}</span>
    </li>
  );
}
