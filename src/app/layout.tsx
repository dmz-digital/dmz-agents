import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import { Suspense } from "react";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
});

export const metadata: Metadata = {
  title: "DMZ - OS Agents | AI-Native Operating System",
  description: "A camada de inteligência organizacional que torna seu repositório vivo. Gerencie squads de agentes autônomos para escalar seu desenvolvimento com proatividade.",
  keywords: ["AI Agents", "Operating System", "SaaS", "Product Squads", "Automated Development", "DMZ OS", "Orchestrator"],
  authors: [{ name: "DMZ Digital" }],
  metadataBase: new URL("https://agents.dmzdigital.com.br"),
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
        alt: "DMZ OS Agents Preview",
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
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon.ico", sizes: "32x32", type: "image/x-icon" },
    ],
    apple: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
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
