import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { Bot, FolderOpen, Brain, Wrench } from "lucide-react";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
});

export const metadata: Metadata = {
  title: "DMZ - OS Agents | Squad Master Dashboard",
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
        <main className="min-h-screen pb-32">
          {children}
        </main>

        {/* Floating Navigation Pill */}
        <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 p-2 bg-white/80 backdrop-blur-md border border-neutral-200 shadow-xl rounded-full z-50 transition-all hover:bg-white">
          <Link href="/agents" className="flex items-center justify-center p-3 rounded-full text-neutral-400 transition-all hover:text-dmz-accent hover:bg-orange-50/50" title="DMZ - OS Agents">
            <Bot size={22} strokeWidth={1.5} />
          </Link>
          <Link href="/projects" className="flex items-center justify-center p-3 rounded-full text-neutral-400 transition-all hover:text-dmz-accent hover:bg-orange-50/50" title="Projects">
            <FolderOpen size={22} strokeWidth={1.5} />
          </Link>
          <Link href="/memory" className="flex items-center justify-center p-3 rounded-full text-neutral-400 transition-all hover:text-dmz-accent hover:bg-orange-50/50" title="Memory">
            <Brain size={22} strokeWidth={1.5} />
          </Link>
          <div className="w-px h-6 bg-neutral-200 mx-1" />
          <Link href="/tools" className="flex items-center justify-center p-3 rounded-full text-neutral-400 transition-all hover:text-dmz-accent hover:bg-orange-50/50" title="Tools">
            <Wrench size={22} strokeWidth={1.5} />
          </Link>
        </nav>
      </body>
    </html>
  );
}
