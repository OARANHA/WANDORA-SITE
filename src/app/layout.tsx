import type { Metadata } from "next";
import { Dela_Gothic_One, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const dela = Dela_Gothic_One({
  variable: "--font-dela",
  subsets: ["latin"],
  weight: "400",
});

const grotesk = Space_Grotesk({
  variable: "--font-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "Wandora — Funcionários Digitais com IA para a sua empresa",
  description:
    "A Wandora permite que pequenas e médias empresas contratem, treinem, gerenciem e avaliem Funcionários Digitais com IA — trabalhando junto com as equipes humanas. Faça o diagnóstico gratuito e descubra qual funcionário digital a sua empresa deve contratar primeiro.",
  keywords: [
    "Wandora",
    "Funcionários Digitais",
    "IA para empresas",
    "diagnóstico de IA",
    "agente de IA",
    "automação com IA",
    "IA para vendas",
    "atendimento WhatsApp automático",
    "SDR com IA",
    "CRM com IA",
  ],
  authors: [{ name: "Wandora" }],
  openGraph: {
    title: "Wandora — Funcionários Digitais com IA",
    description:
      "Contrate, treine, gerencie e avalie funcionários digitais com IA junto com o seu time humano. Diagnóstico gratuito em 7 perguntas.",
    siteName: "Wandora",
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Wandora — Funcionários Digitais com IA",
    description:
      "Contrate, treine, gerencie e avalie funcionários digitais com IA junto com o seu time humano. Diagnóstico gratuito em 7 perguntas.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        name: "Wandora",
        description:
          "A Wandora permite que pequenas e médias empresas contratem, treinem, gerenciem e avaliem Funcionários Digitais com IA — em conjunto com equipes humanas.",
        areaServed: { "@type": "Country", name: "Brasil" },
        knowsLanguage: "pt-BR",
      },
      {
        "@type": "WebApplication",
        name: "Diagnóstico de IA — Wandora",
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        inLanguage: "pt-BR",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "BRL",
          description:
            "Diagnóstico gratuito: em 7 perguntas, descubra qual Funcionário Digital sua empresa precisa contratar primeiro.",
        },
      },
    ],
  };

  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={`${dela.variable} ${grotesk.variable} ${mono.variable} antialiased`}
      >
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  );
}
