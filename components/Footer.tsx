import Logo from "./Logo";

export default function Footer() {
  return (
    <footer className="border-t border-divider mt-10">
      <div className="container-x py-12 md:py-14">
        <div className="grid md:grid-cols-3 gap-10">
          <div>
            <div className="flex items-baseline gap-2 mb-4">
              <Logo />
              <span className="text-gray-500 text-body-sm">Express</span>
            </div>
            <p className="text-gray-500 text-body-sm max-w-[36ch]">
              Express é uma oferta da Flowwwzy. Visite{" "}
              <a href="https://flowwwzy.com" className="text-white link-underline" target="_blank" rel="noopener">
                flowwwzy.com
              </a>{" "}
              para projetos premium.
            </p>
          </div>

          <div>
            <p className="label mb-4">Express</p>
            <ul className="space-y-2.5 text-body-sm text-gray-300">
              <li><a href="#pricing" className="hover:text-white">Preços</a></li>
              <li><a href="#portfolio" className="hover:text-white">Trabalho</a></li>
              <li><a href="#configurator" className="hover:text-white">Começar</a></li>
              <li><a href="mailto:hello@flowwwzy.com" className="hover:text-white">Contacto</a></li>
            </ul>
          </div>

          <div>
            <p className="label mb-4">Legal</p>
            <ul className="space-y-2.5 text-body-sm text-gray-300">
              <li><a href="/privacy" className="hover:text-white">Política de privacidade</a></li>
              <li><a href="/terms" className="hover:text-white">Termos</a></li>
              <li><a href="/refund" className="hover:text-white">Política de devolução</a></li>
            </ul>
            <div className="flex gap-3 mt-6">
              <a href="https://instagram.com/flowwwzy" target="_blank" rel="noopener" className="w-9 h-9 rounded-full border border-divider flex items-center justify-center hover:border-cream transition-colors duration-200" aria-label="Instagram">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>
              </a>
              <a href="https://linkedin.com/company/flowwwzy" target="_blank" rel="noopener" className="w-9 h-9 rounded-full border border-divider flex items-center justify-center hover:border-cream transition-colors duration-200" aria-label="LinkedIn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M8 11v6M8 8v.01M12 17v-4a2 2 0 014 0v4M12 11v6"/></svg>
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 md:mt-16 pt-6 border-t border-divider flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-body-sm text-gray-500">
          <span>© {new Date().getFullYear()} Flowwwzy. Todos os direitos reservados.</span>
          <span>Lisboa · Porto · Remote</span>
        </div>
      </div>
    </footer>
  );
}
