"use client";

import { motion } from "framer-motion";

const lines = [
  "Precisa de um site novo, mas não pode esperar 3 meses.",
  "As agências querem €5.000 e várias reuniões antes sequer de começar.",
  "Os templates são genéricos e parecem-se todos.",
  "Os freelancers desaparecem a meio do projeto.",
];

export default function ProblemAgitation() {
  return (
    <section className="py-16 md:py-28 relative">
      <div className="container-x max-w-[900px]">
        {lines.map((line, i) => (
          <motion.p
            key={i}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: i * 0.1, ease: [0.165, 0.84, 0.44, 1] }}
            className="text-3xl md:text-5xl font-medium mb-10 md:mb-14 max-w-[20ch]"
            style={{ letterSpacing: "-0.02em", lineHeight: 1.15 }}
          >
            {line}
          </motion.p>
        ))}

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, delay: 0.5, ease: [0.165, 0.84, 0.44, 1] }}
          className="italic-accent text-3xl md:text-5xl mt-16"
          style={{ letterSpacing: "-0.01em" }}
        >
          Finalmente existe uma alternativa melhor.
        </motion.p>
      </div>
    </section>
  );
}
