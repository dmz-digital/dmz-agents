"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from "next/link";
import {
  Bot, Rocket, Shield, Zap, Music2, Users, Code2,
  ArrowRight, CheckCircle2, Globe, Star, PlayCircle,
  Cpu, Layers, MessageSquare, BarChart3, AppWindow,
  Database, Layout, Workflow, Box, Building2, ShoppingCart,
  HeartPulse, Landmark, Plane, GraduationCap, PenTool, Lock, Terminal, Eye, Search, Scale, LineChart
} from "lucide-react";
import { motion } from "framer-motion";
import { PublicHeader, PublicFooter } from "@/components/PublicLayout";

// ── Components ────────────────────────────────────────────────────────────────

function FeatureCard({ icon: Icon, title, desc }: { icon: any, title: string, desc: string }) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-white/5 backdrop-blur-lg border border-white/10 p-8 rounded-[32px] hover:border-dmz-accent/40 transition-all group"
    >
      <div className="w-12 h-12 bg-dmz-accent/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
        <Icon className="text-dmz-accent" size={24} />
      </div>
      <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
      <p className="text-neutral-400 leading-relaxed text-sm">{desc}</p>
    </motion.div>
  );
}

function PricingCard({ tier, price, features, recommended = false }: { tier: string, price: string, features: string[], recommended?: boolean }) {
  return (
    <div className={`p-8 rounded-[40px] border ${recommended ? 'border-dmz-accent bg-dmz-accent/5 scale-105 shadow-2xl shadow-dmz-accent/20' : 'border-white/10 bg-white/5'} flex flex-col`}>
      {recommended && <span className="text-[10px] font-bold tracking-[0.2em] text-dmz-accent uppercase mb-4 text-center">Recomendado</span>}
      <h3 className="text-2xl font-bold text-white mb-2">{tier}</h3>
      <div className="flex items-baseline gap-1 mb-6">
        <span className="text-4xl font-black text-white">{price}</span>
        <span className="text-neutral-500 text-sm">/mês</span>
      </div>
      <ul className="space-y-4 mb-8 flex-1">
        {features.map((f, i) => (
          <li key={i} className="flex items-center gap-3 text-sm text-neutral-300">
            <CheckCircle2 size={16} className="text-dmz-accent flex-shrink-0" />
            {f}
          </li>
        ))}
      </ul>
      <Link
        href={tier === "Free" || tier === "Gratuito" ? "/sign-up" : `/checkout?plan=${tier.toLowerCase().includes("pro") ? "pro" : "elite"}`}
        className={`w-full py-4 rounded-2xl font-bold text-center transition-all ${recommended
          ? 'bg-dmz-accent text-white hover:bg-orange-500'
          : 'bg-white/10 text-white hover:bg-white/20'
          }`}
      >
        Começar Agora
      </Link>
    </div>
  );
}

function IndustryCard({ icon: Icon, title, useCase }: { icon: any, title: string, useCase: string }) {
  return (
    <div className="bg-white/[0.03] border border-white/10 p-6 rounded-2xl hover:bg-white/[0.06] transition-all">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-dmz-accent/10 rounded-lg">
          <Icon className="text-dmz-accent" size={18} />
        </div>
        <h4 className="font-bold text-white text-sm">{title}</h4>
      </div>
      <p className="text-xs text-neutral-500 leading-relaxed">{useCase}</p>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function RootPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      if (typeof window !== 'undefined' && window.location.hash.includes('type=recovery')) {
        router.replace('/reset-password');
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.replace('/app');
      } else {
        setLoading(false);
      }
    }
    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-dmz-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-[#050505] text-white selection:bg-dmz-accent selection:text-white font-jakarta overflow-x-hidden">

      <PublicHeader />

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center pt-20 overflow-hidden">
        {/* Video Background */}
        <div className="absolute inset-0 z-0">
          <video autoPlay muted loop playsInline className="w-full h-full object-cover opacity-60 scale-105">
            <source src="/video-bg.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/80 via-transparent to-[#050505]" />
          <div className="absolute inset-0 bg-black/40" />
        </div>

        <div className="max-w-7xl mx-auto text-center relative z-10 px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="inline-flex items-center gap-3 bg-white/5 border border-white/10 px-6 py-2 rounded-full mb-12 backdrop-blur-md"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-dmz-accent opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-dmz-accent"></span>
            </span>
            <span className="text-[10px] font-bold tracking-[0.3em] text-neutral-300 uppercase">86+ Especialistas Ativos agora</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.1 }} 
            className="text-7xl md:text-9xl font-black mb-10 leading-[0.95] tracking-tightest"
          >
            Seu Squad de <br />
            <span className="bg-gradient-to-r from-dmz-accent to-orange-400 bg-clip-text text-transparent">AI Experts</span> pronto <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40">em segundos.</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.2 }} 
            className="text-xl text-neutral-400 mb-14 leading-relaxed max-w-3xl mx-auto font-medium"
          >
            O DMZ OS transforma seu fluxo de trabalho estático em um squad autônomo de <span className="text-white font-bold">86 agentes especialistas</span> que planejam, criam e auditam seu produto em tempo real na sua IDE.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.3 }} 
            className="flex flex-col sm:flex-row gap-6 justify-center items-center"
          >
            <Link href="/sign-up" className="relative group px-10 py-5 bg-dmz-accent rounded-[24px] font-black text-lg overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-dmz-accent/40">
              <span className="relative z-10 flex items-center gap-2">CRIAR MEU SQUAD <ArrowRight size={20} /></span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            </Link>
            <button className="px-10 py-5 bg-white/5 border border-white/10 rounded-[24px] font-bold text-lg hover:bg-white/10 transition-all flex items-center gap-2">
              <PlayCircle size={20} /> VER DEMO
            </button>
          </motion.div>
        </div>
      </section>

      {/* Capabilities Section */}
      <section id="capabilities" className="py-40 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <h2 className="text-5xl md:text-7xl font-black mb-8 tracking-tighter">O que você pode <br /><span className="text-dmz-accent">construir hoje?</span></h2>
            <p className="text-neutral-400 text-lg max-w-2xl mx-auto font-medium">Dos primeiros requisitos até a escala global. Seu squad gerencia a complexidade técnica para você focar no valor.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard
              icon={MessageSquare}
              title="Chat Persistente"
              desc="Conversas que recordam. Memória sagrada compartilhada entre todos os especialistas do seu squad."
            />
            <FeatureCard
              icon={Layout}
              title="Kanban Inteligente"
              desc="Gestão de tarefas automática. O @orch cria e move cards conforme o progresso do Squad."
            />
            <FeatureCard
              icon={Zap}
              title="IDE-Native (MCP)"
              desc="Seus agentes operam direto na sua IDE. Leitura e escrita de código em tempo real via protocolo MCP."
            />
            <FeatureCard
              icon={BarChart3}
              title="Relatórios Diários"
              desc="Inteligência de gestão. Receba briefings automáticos sobre o status e a saúde do seu produto."
            />
          </div>
        </div>
      </section>

      {/* Industries Section */}
      <section id="industries" className="py-32 bg-white/[0.02] px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-20 items-center">
            <div className="lg:col-span-1">
              <h2 className="text-4xl md:text-5xl font-black mb-8 leading-tight tracking-tighter">Adaptado para <br /><span className="text-dmz-accent">seu setor.</span></h2>
              <p className="text-neutral-400 mb-8 leading-relaxed font-medium">
                O DMZ OS não é genérico. Nossos agentes entendem as nuances de diferentes indústrias para entregar soluções compliance e performantes.
              </p>
              <Link href="/industries" className="text-dmz-accent font-bold flex items-center gap-2 group">
                Ver todos os casos de uso <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="lg:col-span-2 grid sm:grid-cols-2 gap-4">
              <IndustryCard
                icon={Landmark}
                title="Fintech & Banking"
                useCase="Sistemas de KYC, orquestração de pagamentos e auditoria de transações em tempo real."
              />
              <IndustryCard
                icon={HeartPulse}
                title="Healthtech"
                useCase="Gestão de dados sensíveis (HIPAA/LGPD), fluxos clínicos e interoperabilidade FHIR."
              />
              <IndustryCard
                icon={ShoppingCart}
                title="E-commerce & Retail"
                useCase="Motores de recomendação, gestão de inventory inteligente e chatbots de alta conversão."
              />
              <IndustryCard
                icon={Code2}
                title="Software & SaaS"
                useCase="Aceleração de roadmap, refatoração de legado e QA automatizado em larga escala."
              />
            </div>
          </div>
        </div>
      </section>

      {/* Explore the Ecosystem */}
      <section id="agents" className="py-40 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <h2 className="text-5xl md:text-7xl font-black mb-8 tracking-tighter">Explore the <br /><span className="text-dmz-accent">Ecosystem.</span></h2>
            <p className="text-neutral-400 text-lg max-w-2xl mx-auto font-medium">
              Navegue pelas verticais de especialidade do squad. Cada agente é treinado para uma função crítica no ciclo de vida do seu produto.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={Bot}
              title="@orch - Orchestrator"
              desc="O cérebro da operação. Recebe demandas, cria planos de ação e delega tarefas para os especialistas certos."
            />
            <FeatureCard
              icon={Code2}
              title="@ryan - Developer"
              desc="Implementação de alta performance. Focado em código limpo, escalável e testado na sua IDE."
            />
            <FeatureCard
              icon={Shield}
              title="@constantine - Security"
              desc="Garante que seu código e infraestrutura estão blindados contra ataques e em conformidade total."
            />
            <FeatureCard
              icon={Users}
              title="@syd - Squad Manager"
              desc="Gerencia a comunicação e alinhamento estratégico entre os agentes especialistas."
            />
            <FeatureCard
              icon={Rocket}
              title="@kanya - Strategist"
              desc="Identifica oportunidades de mercado e define o unfair advantage do seu produto."
            />
            <FeatureCard
              icon={Layout}
              title="@aurora - Design Chief"
              desc="Direção criativa ultra-moderna. Garante que seu produto seja visualmente impactante."
            />
          </div>
          <div className="text-center mt-12">
            <Link href="/sign-up" className="bg-white/5 border border-white/10 px-8 py-4 rounded-2xl font-bold hover:bg-white/10 transition-all inline-flex items-center gap-2">
              Ver Todos os 86 Agentes <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Case Section */}
      <section id="cases" className="py-32 bg-white/[0.02] px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div className="order-2 lg:order-1">
              <div className="bg-gradient-to-br from-neutral-800 to-neutral-900 rounded-[32px] p-8 border border-white/5 relative">
                <div className="absolute top-4 right-6 flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-red-500/50" />
                  <div className="w-2 h-2 rounded-full bg-yellow-500/50" />
                  <div className="w-2 h-2 rounded-full bg-green-500/50" />
                </div>
                <div className="font-mono text-xs text-dmz-accent mb-6">// Master Plan: Project Alpha</div>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="w-1 bg-dmz-accent rounded-full" />
                    <div>
                      <div className="text-white font-bold text-sm">Design System Creation</div>
                      <div className="text-neutral-500 text-[11px]">@aurora and @victoria are working on tokens...</div>
                    </div>
                  </div>
                  <div className="flex gap-4 opacity-50">
                    <div className="w-1 bg-neutral-700 rounded-full" />
                    <div>
                      <div className="text-white font-bold text-sm">Auth Module Implementation</div>
                      <div className="text-neutral-500 text-[11px]">Pending @ryan approval...</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="text-4xl md:text-5xl font-black mb-8 leading-tight tracking-tighter">Um projeto que <br /> <span className="text-dmz-accent">evolui sozinho.</span></h2>
              <div className="space-y-6">
                <div className="flex gap-5">
                  <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Zap className="text-dmz-accent" size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-lg mb-1">Rastreabilidade em Tempo Real</h4>
                    <p className="text-neutral-400 text-sm leading-relaxed">Acompanhe cada pensamento e decisão do squad através de logs detalhados e memórias persistentes.</p>
                  </div>
                </div>
                <div className="flex gap-5">
                  <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Globe className="text-blue-500" size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-lg mb-1">Multi-Projeto & Multi-Tenant</h4>
                    <p className="text-neutral-400 text-sm leading-relaxed">Gerencie múltiplos produtos com squads independentes, garantindo segurança e isolamento de dados.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-32 px-6">
        <div className="max-w-7xl mx-auto text-center mb-24">
          <h2 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter">Planos para <span className="text-dmz-accent">todo Squad.</span></h2>
          <p className="text-neutral-400 text-lg">Sem taxas escondidas. Cancele quando quiser.</p>
        </div>
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
          <PricingCard
            tier="Starter"
            price="R$ 0"
            features={[
              "3 Agentes ativos (@orch, @ryan, @alex)",
              "Projetos ilimitados",
              "Memória de 24h",
              "Integração Supabase",
            ]}
          />
          <PricingCard
            tier="Pro"
            price="R$ 197"
            recommended={true}
            features={[
              "Todos os 86 Agentes",
              "Memória de Longo Prazo Ilimitada",
              "Integração com 50+ MCP Tools",
              "Suporte prioritário via Slack",
              "Custom Prompts e Personas",
            ]}
          />
          <PricingCard
            tier="Enterprise"
            price="Consultar"
            features={[
              "Deploy On-Premise (VPC)",
              "Agentes Customizados",
              "Governança de Dados Estrita",
              "SLA de 99.9%",
              "Treinamento de Equipe",
            ]}
          />
        </div>
      </section>

      <PublicFooter />

      <style jsx>{`
        .tracking-tightest { letter-spacing: -0.05em; }
      `}</style>
    </div>
  );
}
