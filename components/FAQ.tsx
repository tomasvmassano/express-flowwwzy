"use client";

import { motion } from "framer-motion";

const faqs = [
  {
    q: "Isto é um template?",
    a: "Não. Cada site é desenhado à medida com base nos seus inputs. Mesma equipa, mesma qualidade, só mais rápido.",
  },
  {
    q: "Como conseguem ser tão rápidos?",
    a: "Combinamos um processo de produção interno extremamente afinado com uma equipa que só faz isto, todos os dias. Cada projeto segue uma sequência clara, sem reuniões inúteis e sem fricção. O resultado é simples: o que numa agência demora meses, aqui demora dias.",
  },
  {
    q: "E se eu não gostar do resultado?",
    a: "Tem direito a uma ronda de revisões incluída. Se mesmo assim não gostar, devolvemos 100% do valor em 14 dias. Ainda não foi preciso.",
  },
  {
    q: "O que está incluído no preço?",
    a: "Design, desenvolvimento, mobile-responsive, SEO básico, formulário de contacto e ajuda na configuração de hosting. 14 dias de suporte pós-lançamento.",
  },
  {
    q: "Posso adicionar mais coisas depois?",
    a: "Claro. Páginas extra, novas secções, atualizações de copy, manutenção contínua — tudo disponível como add-ons.",
  },
  {
    q: "Quem é que constrói isto, na prática?",
    a: "A mesma equipa sénior por trás da Flowwwzy, o estúdio que entregou mais de 60 projetos para marcas em Portugal e MENA. Criámos esta oferta para negócios que precisam da nossa qualidade sem o calendário completo de uma agência.",
  },
];

export default function FAQ() {
  return (
    <section className="py-16 md:py-24 spotlight">
      <div className="container-x max-w-[920px]">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.165, 0.84, 0.44, 1] }}
        >
          Perguntas <span className="italic-accent">frequentes</span>
        </motion.h2>

        <div className="mt-12 md:mt-16 divide-y divide-divider border-t border-b border-divider">
          {faqs.map((f, i) => (
            <motion.details
              key={f.q}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="group"
            >
              <summary className="flex items-center justify-between py-6 md:py-7 gap-6 text-lg md:text-xl">
                <span className="font-medium" style={{ letterSpacing: "-0.01em" }}>
                  {f.q}
                </span>
                <span className="acc-icon flex-shrink-0 w-8 h-8 rounded-full border border-divider flex items-center justify-center text-cream">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                    <path d="M7 1V13M1 7H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </span>
              </summary>
              <div className="pb-6 md:pb-8 pr-12 text-gray-300 text-base leading-relaxed">{f.a}</div>
            </motion.details>
          ))}
        </div>

        <p className="mt-10 text-gray-500 text-body-sm text-center">
          Outra dúvida? <a href="mailto:hello@flowwwzy.com" className="text-cream link-underline">Escreva-nos.</a>
        </p>
      </div>
    </section>
  );
}
