import type { Metadata } from "next";
import "./globals.css";
import Script from "next/script";
import CursorAndAnalytics from "@/components/CursorAndAnalytics";

export const metadata: Metadata = {
  title: "Flowwwzy Express — Site profissional pronto em 3 dias. Desde €490.",
  description:
    "Design à medida, feito por uma equipa sénior, entregue à velocidade que o seu negócio precisa. Sem reuniões. Sem propostas de €8.000. Garantia de devolução de 14 dias.",
  metadataBase: new URL("https://start.flowwwzy.com"),
  openGraph: {
    title: "Flowwwzy Express — Site profissional pronto em 3 dias",
    description:
      "Design à medida em 3-7 dias. Desde €490. Construído pela equipa por trás da Flowwwzy.",
    url: "https://start.flowwwzy.com",
    siteName: "Flowwwzy Express",
    locale: "pt_PT",
    type: "website",
  },
  robots: { index: true, follow: true },
};

const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;
const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-PT">
      <head>
        <link rel="preconnect" href="https://api.fontshare.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />

        {GTM_ID && (
          <Script id="gtm" strategy="afterInteractive">
            {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${GTM_ID}');`}
          </Script>
        )}

        {META_PIXEL_ID && (
          <Script id="meta-pixel" strategy="afterInteractive">
            {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${META_PIXEL_ID}');fbq('track','PageView');`}
          </Script>
        )}
      </head>
      <body>
        {GTM_ID && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
            />
          </noscript>
        )}
        <CursorAndAnalytics />
        {children}
      </body>
    </html>
  );
}
