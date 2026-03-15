import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Geist } from "next/font/google";
import "./globals.css";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import { Suspense } from "react";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
});

export const metadata: Metadata = {
  title: {
    default: "DMZ - OS Agents | AI-Native Operating System",
    template: "%s | DMZ OS Agents"
  },
  description: "A camada de inteligência organizacional que torna seu repositório vivo. Gerencie squads de agentes autônomos como @orch, @ryan e @emma para escalar seu desenvolvimento com proatividade.",
  keywords: ["AI Agents", "Operating System", "SaaS", "Product Squads", "Automated Development", "DMZ OS", "Orchestrator", "Task Management", "Kanban AI"],
  authors: [{ name: "DMZ Digital" }],
  metadataBase: new URL("https://agents.dmzdigital.com.br"),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "DMZ - OS Agents | Squads de Especialistas Autônomos",
    description: "Injete inteligência proativa no seu desenvolvimento com squads de especialistas autônomos treinados para performar.",
    url: "https://agents.dmzdigital.com.br",
    siteName: "DMZ OS Agents",
    images: [
      {
        url: "/ogg.png",
        width: 1200,
        height: 630,
        alt: "DMZ OS Agents Preview - Gestão de Squads de IA",
      },
    ],
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DMZ - OS Agents | AI-Native OS",
    description: "A camada de inteligência organizacional que torna seu repositório vivo.",
    images: ["/ogg.png"],
    creator: "@dmzdigital",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "DMZ - OS Agents",
    "operatingSystem": "Web, Windows, macOS, Linux",
    "applicationCategory": "BusinessApplication",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "description": "AI-Native Operating System for managing squads of autonomous agents.",
    "publisher": {
      "@type": "Organization",
      "name": "DMZ Digital",
      "url": "https://agents.dmzdigital.com.br"
    }
  };

  return (
    <html lang="pt-BR" className={cn("font-sans", geist.variable)}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${jakarta.variable} font-jakarta antialiased bg-dmz-bg text-dmz-text`}>
        <Suspense fallback={null}>
          <GoogleAnalytics gaId="G-587SEN9VDC" />
        </Suspense>
        <main className="min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
