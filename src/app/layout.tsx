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
  description: "A camada de inteligência organizacional que torna seu repositório vivo. Gerencie squads de agentes autônomos para escalar seu desenvolvimento.",
  keywords: ["AI Agents", "Operating System", "SaaS", "Product Squads", "Automated Development", "DMZ OS"],
  openGraph: {
    title: "DMZ - OS Agents | AI-Native Operating System",
    description: "Injete inteligência proativa no seu desenvolvimento com squads de 44 especialistas autônomos.",
    url: "https://dmz-os.netlify.app",
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
    title: "DMZ - OS Agents",
    description: "The AI-Native Operating System for Modern Product Squads",
    images: ["/ogg.png"],
  },
  icons: {
    icon: "/favicon.ico",
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
