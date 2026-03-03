import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
});

export const metadata: Metadata = {
  title: "DMZ - OS Agents | AI-Native Operating System",
  description: "Management system for AI Agent Squads",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${jakarta.variable} font-jakarta antialiased bg-dmz-bg text-dmz-text`}>
        <main className="min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
