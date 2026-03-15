"use client";

import { motion } from "framer-motion";
import { 
  Bot, Cpu, Globe, Zap, Users, Shield, 
  ArrowRight, CheckCircle2, MessageSquare, 
  Workflow, Database, Layout, Sparkles,
  Search, Code2, LineChart, Headphones,
  Camera, Music, PenTool, Terminal
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { PublicHeader, PublicFooter } from "@/components/PublicLayout";

const AGENTS = [
  { id: 1, name: "Orch", role: "Orchestrator", color: "from-orange-500 to-coral-500" },
  { id: 2, name: "Alex", role: "Architect", color: "from-blue-500 to-cyan-500" },
  { id: 3, name: "Ryan", role: "Developer", color: "from-purple-500 to-indigo-500" },
  { id: 4, name: "Emma", role: "QA Engineer", color: "from-green-500 to-emerald-500" },
  { id: 5, name: "Cassandra", role: "Copywriter", color: "from-pink-500 to-rose-500" },
  { id: 6, name: "Aurora", role: "UX Designer", color: "from-amber-500 to-orange-400" },
  { id: 7, name: "Marcus", role: "Security", color: "from-red-600 to-orange-600" },
  { id: 8, name: "Sophia", role: "Data Scientist", color: "from-teal-500 to-blue-500" },
];

function GhostButton({ children, href }: { children: React.ReactNode, href: string }) {
  return (
    <Link href={href} className="group relative px-8 py-4 bg-white/5 border border-white/10 rounded-2xl font-bold overflow-hidden transition-all hover:border-dmz-accent/50 active:scale-95">
      <div className="relative z-10 flex items-center gap-2 text-white/80 group-hover:text-white">
        {children}
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-dmz-accent/0 via-dmz-accent/5 to-dmz-accent/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
    </Link>
  );
}

function HighEndFeature({ icon: Icon, title, desc }: { icon: any, title: string, desc: string }) {
  return (
    <motion.div 
      whileHover={{ y: -8, scale: 1.02 }}
      className="p-10 rounded-[40px] bg-white/[0.03] border border-white/10 backdrop-blur-3xl hover:border-dmz-accent/30 transition-all group"
    >
      <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-dmz-accent to-orange-400 flex items-center justify-center mb-8 shadow-2xl shadow-dmz-accent/20 group-hover:rotate-6 transition-transform">
        <Icon className="text-white" size={32} />
      </div>
      <h3 className="text-2xl font-bold text-white mb-4">{title}</h3>
      <p className="text-neutral-400 leading-relaxed text-sm font-medium">{desc}</p>
    </motion.div>
  );
}

export default function HighEndLandingPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="min-h-screen bg-[#050505]" />;

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-dmz-accent/30 font-jakarta overflow-x-hidden">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-dmz-accent/10 blur-[180px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#7C3AED]/5 blur-[180px] rounded-full" />
      </div>

      <PublicHeader />

      <main className="relative z-10">
        
        {/* HERO SECTION */}
        <section className="pt-48 pb-32 px-6">
          <div className="max-w-7xl mx-auto text-center">
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-3 bg-white/5 border border-white/10 px-6 py-2 rounded-full mb-12 backdrop-blur-md"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-dmz-accent opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-dmz-accent"></span>
              </span>
              <span className="text-[10px] font-bold tracking-[0.3em] text-neutral-300 uppercase">DMZ OS Next-Gen — MCP Enabled</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-7xl md:text-9xl font-black mb-10 leading-[0.95] tracking-tightest"
            >
              The Luxury <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40">Squad for</span> <br />
              <span className="bg-gradient-to-r from-dmz-accent to-orange-400 bg-clip-text text-transparent">Complex AI.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-neutral-400 mb-14 leading-relaxed max-w-3xl mx-auto font-medium"
            >
              Transforme seu VS Code em uma sala de guerra autônoma. 
              Um ecossistema de <span className="text-white font-bold">44+ agentes especialistas</span> conectados via MCP para planejar, codar e escalar seu produto sem atrito.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-6 justify-center items-center"
            >
              <Link href="/sign-up" className="relative group px-10 py-5 bg-dmz-accent rounded-[24px] font-black text-lg overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-dmz-accent/40">
                <span className="relative z-10 flex items-center gap-2">
                  START YOUR SQUAD <ArrowRight size={20} />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              </Link>
              <GhostButton href="#demo">
                <PlayCircle size={20} /> VIEW CASE STUDY
              </GhostButton>
            </motion.div>
          </div>
        </section>

        {/* AGENTS MESH SECTION */}
        <section className="py-24 px-6 relative overflow-hidden">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 px-4">
              {AGENTS.map((agent, i) => (
                <motion.div
                  key={agent.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="group relative aspect-square bg-white/5 border border-white/10 rounded-3xl overflow-hidden flex flex-col items-center justify-center hover:bg-white/10 transition-all cursor-crosshair"
                >
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${agent.color} mb-3 shadow-lg group-hover:scale-110 transition-transform`} />
                  <span className="text-[10px] font-black text-white uppercase tracking-widest">@{agent.name}</span>
                  <span className="text-[8px] font-medium text-neutral-500">{agent.role}</span>
                  <div className="absolute inset-0 border border-dmz-accent/0 group-hover:border-dmz-accent/20 rounded-3xl pointer-events-none transition-all" />
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* MCP EXPLANATION SECTION */}
        <section className="py-40 px-6 bg-gradient-to-b from-transparent to-white/[0.02]">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-24 items-center">
            <div>
              <div className="text-dmz-accent font-black tracking-widest uppercase text-xs mb-6">Built for the future</div>
              <h2 className="text-5xl font-black mb-8 leading-tight">
                Model Context Protocol <br />
                <span className="text-neutral-500">The missing link.</span>
              </h2>
              <p className="text-neutral-400 text-lg leading-relaxed mb-10 font-medium">
                Diga adeus ao copy-paste. Nossos agentes vivem dentro do seu ambiente através do MCP Server. Eles têm consciência total do seu codebase, arquivos e contexto local, agindo como se estivessem sentados ao seu lado.
              </p>
              <div className="space-y-6">
                {[
                  "Real-time Local Filesystem Access",
                  "Direct IDE Integration (Cursor, VS Code, JetBrains)",
                  "Autonomous Task Execution via Kanban",
                  "Persistent Memory across Deployments"
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 text-white font-bold">
                    <div className="w-6 h-6 rounded-full bg-dmz-accent/20 flex items-center justify-center">
                      <CheckCircle2 size={14} className="text-dmz-accent" />
                    </div>
                    {item}
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <motion.div 
                animate={{ 
                  y: [0, -20, 0],
                  rotate: [0, 1, 0]
                }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="relative z-10 p-8 rounded-[48px] bg-white/[0.03] border border-white/10 shadow-2xl backdrop-blur-sm overflow-hidden"
              >
                <div className="bg-black/40 rounded-[32px] p-6 font-mono text-sm leading-relaxed text-dmz-accent/80 border border-white/5">
                  <div className="flex gap-2 mb-4">
                    <div className="w-3 h-3 rounded-full bg-red-500/50" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                    <div className="w-3 h-3 rounded-full bg-green-500/50" />
                  </div>
                  <pre className="text-neutral-300">
                    {`$ dmz ask @orch "Analise o auth flow"
[*] Connecting to MCP Server...
✅ Connection Established
⚙️ Orchestrator analyzing architecture...
[+] Task created: ID 8cb232f
[!] Critical: Token logic at line 122.`}
                  </pre>
                </div>
              </motion.div>
              <div className="absolute -inset-10 bg-dmz-accent/10 blur-[120px] rounded-full z-0" />
            </div>
          </div>
        </section>

        {/* CAPABILITIES GRID */}
        <section className="py-40 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-32">
              <h2 className="text-6xl font-black mb-6">44+ Specialists. <br />One <span className="text-dmz-accent">Master Plan.</span></h2>
              <p className="text-neutral-400 font-medium max-w-2xl mx-auto text-lg">
                Do design system ao deploy seguro. Escalamos sua capacidade operacional sem aumentar seu headcount.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <HighEndFeature 
                icon={PenTool} 
                title="Visual Mastery" 
                desc="Geração de interfaces premium, ilustrações e design systems consistentes em segundos."
              />
              <HighEndFeature 
                icon={Terminal} 
                title="Deep Engineering" 
                desc="Refatoração massiva, segurança zero-trust e otimização de performance autônoma."
              />
              <HighEndFeature 
                icon={LineChart} 
                title="Growth Intelligence" 
                desc="Copy persuasivo, estratégia de SEO e análise de métricas em tempo real por especialistas."
              />
            </div>
          </div>
        </section>

        {/* CTA SECTION */}
        <section className="py-60 px-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-dmz-accent/5" />
          <div className="max-w-7xl mx-auto relative z-10 text-center">
            <motion.h2 
              whileInView={{ opacity: [0, 1], scale: [0.95, 1] }}
              className="text-7xl md:text-9xl font-black mb-16 tracking-tightest leading-none outline-text"
            >
              READY TO <br />
              <span className="text-dmz-accent">ASCEND?</span>
            </motion.h2>
            <Link href="/sign-up" className="bg-white text-black px-12 py-6 rounded-[32px] font-black text-2xl hover:bg-dmz-accent hover:text-white transition-all hover:scale-110 active:scale-95 shadow-[0_0_50px_rgba(255,255,255,0.2)]">
              HIRE YOUR SQUAD
            </Link>
          </div>
        </section>

      </main>

      <PublicFooter />

      <style jsx>{`
        .tracking-tightest { letter-spacing: -0.04em; }
        .outline-text {
          -webkit-text-stroke: 1px rgba(255,255,255,0.1);
          color: transparent;
        }
      `}</style>
    </div>
  );
}

function PlayCircle({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M10 8L16 12L10 16V8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
"
