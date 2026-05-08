"use client";

export default function WhatsAppButton() {
  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "351912345678";
  const text = encodeURIComponent("Olá! Tenho uma dúvida sobre o Flowwwzy Express.");
  return (
    <a
      href={`https://wa.me/${number}?text=${text}`}
      target="_blank"
      rel="noopener"
      className="whatsapp-float md:hidden"
      aria-label="Falar via WhatsApp"
    >
      <svg width="28" height="28" viewBox="0 0 32 32" fill="#fff" aria-hidden>
        <path d="M16 3a13 13 0 00-11.2 19.5L3 29l6.7-1.8A13 13 0 1016 3zm0 23.7a10.7 10.7 0 01-5.5-1.5l-.4-.2-3.9 1 1-3.8-.3-.4A10.7 10.7 0 1116 26.7zm6.1-8c-.3-.2-2-1-2.3-1.1-.3-.1-.5-.2-.8.2-.2.3-.9 1.1-1.1 1.4-.2.2-.4.2-.7.1-.3-.2-1.4-.5-2.6-1.6-1-.9-1.6-2-1.8-2.3-.2-.3 0-.5.1-.7l.5-.6.3-.5.2-.4c.1-.2 0-.4 0-.5-.1-.2-.8-2-1.1-2.6-.3-.7-.6-.6-.8-.6h-.7c-.2 0-.5.1-.8.4-.3.3-1.1 1.1-1.1 2.7s1.1 3.1 1.3 3.4c.2.2 2.3 3.6 5.6 5 3.3 1.4 3.3.9 3.9.8.6-.1 2-.8 2.3-1.6.3-.8.3-1.5.2-1.6-.1-.1-.3-.2-.6-.3z"/>
      </svg>
    </a>
  );
}
