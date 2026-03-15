"use client";

import { motion } from "framer-motion";
import { 
  Bot, Cpu, Globe, Zap, Users, Shield, 
  ArrowRight, CheckCircle2, MessageSquare, 
  Workflow, Database, Layout, Sparkles,
  Search, Code2, LineChart, Headphones,
  Camera, Music, PenTool, Terminal, PlayCircle,
  Building2, ShoppingCart, HeartPulse, Landmark, Plane, GraduationCap,
  Scale, Briefcase, Rocket, Eye, Lock, Layers
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { PublicHeader, PublicFooter } from "@/components/PublicLayout";

// ── Data & Config ─────────────────────────────────────────────────────────────

const AGENTS = [
  { id: 1, name: "Orch", role: "Orchestrator", icon: Bot, color: "from-orange-500 to-coral-500", category: "Management", desc: "Digital CEO. Brilha no planejamento estratégico e delegação massiva." },
  { id: 2, name: "Alex", role: "Architect", icon: Layers, color: "from-blue-500 to-cyan-500", category: "Engineering", desc: "Arquiteto de sistemas. Desenha estruturas escaláveis e resilientes." },
  { id: 3, name: "Ryan", role: "Developer", icon: Code2, color: "from-purple-500 to-indigo-500", category: "Engineering", desc: "Expert em Fullstack. Transforma lógica complexa em código performante." },
  { id: 4, name: "Emma", role: "QA Engineer", icon: Shield, color: "from-green-500 to-emerald-500", category: "Engineering", desc: "Guardiã da qualidade. Automatiza testes e caça bugs implacavelmente." },
  { id: 5, name: "Cassandra", role: "Copywriter", color: "from-pink-500 to-rose-500", icon: PenTool, category: "Content", desc: "Mestre da persuasão. Cria narrativas que vendem e engajam." },
  { id: 6, name: "Aurora", role: "UX Designer", color: "from-amber-500 to-orange-400", icon: Layout, category: "Design", desc: "Visionária de interfaces. Design focado no usuário e estética premium." },
  { id: 7, name: "Marcus", role: "Security", color: "from-red-600 to-orange-600", icon: Lock, category: "Security", desc: "Especialista em Cibersegurança. Blindagem de dados e conformidade total." },
  { id: 8, name: "Lucas", role: "DevOps", color: "from-teal-500 to-blue-500", icon: Terminal, category: "Engineering", desc: "Maestro da infraestrutura. Deploy contínuo e observabilidade absoluta." },
  { id: 9, name: "Syd", role: "Squad Manager", icon: Users, color: "from-indigo-500 to-purple-600", category: "Management", desc: "Equilibrador de fluxo. Garante a saúde produtiva e prazos do squad." },
  { id: 10, name: "Victoria", role: "UX Researcher", icon: Eye, color: "from-violet-500 to-fuchsia-500", category: "Design", desc: "Analista de comportamento. Insights profundos para decisões de design." },
  { id: 11, name: "Kanya", role: "Strategist", icon: Rocket, color: "from-yellow-500 to-orange-500", category: "Management", desc: "Estrategista de mercado. Identifica oportunidades e define o unfair advantage." },
  { id: 12, name: "Sofia", role: "Backend Senior", icon: Cpu, color: "from-blue-600 to-indigo-700", category: "Engineering", desc: "Especialista em microsserviços e alta disponibilidade. Escala sem tremer." },
  { id: 13, name: "Hunter", role: "Growth Hacker", icon: Search, color: "from-green-400 to-blue-500", category: "Content", desc: "Focado em aquisição. Domina SEO, tráfego pago e funis de conversão." },
  { id: 14, name: "Theron", role: "Legal Tech", icon: Scale, color: "from-neutral-600 to-neutral-800", category: "Security", desc: "Compliance e termos de uso. Garante que o squad jogue dentro das regras." },
  { id: 15, name: "Zara", role: "Data Scientist", icon: LineChart, color: "from-fuchsia-600 to-purple-800", category: "Engineering", desc: "Mestra dos dados. Transforma ruído em insights preditivos e dashboards." },
  { id: 16, name: "Oberon", role: "Cloud Architect", icon: Globe, color: "from-sky-400 to-blue-600", category: "Engineering", desc: "Especialista em multi-cloud. Gerencia AWS, Azure e GCP de forma unificada." },
];

const INDUSTRIES = [
  { icon: Landmark, title: "Fintech & Banking", desc: "Sistemas de KYC, orquestração de pagamentos e auditoria de transações em tempo real." },
  { icon: HeartPulse, title: "Healthtech", desc: "Gestão de dados sensíveis (HIPAA/LGPD), fluxos clínicos e interoperabilidade FHIR." },
  { icon: ShoppingCart, title: "E-commerce & Retail", desc: "Motores de recomendação, gestão de inventário inteligente e chatbots de alta conversão." },
  { icon: Code2, title: "Software & SaaS", desc: "Aceleração de roadmap, refatoração de legado e QA automatizado em larga escala." },
  { icon: Plane, title: "Logística & Travel", desc: "Otimização de rotas, sistemas de reserva e rastreamento de ativos ponta a ponta." },
  { icon: GraduationCap, title: "EdTech", desc: "Personalização de trilhas de aprendizagem e automação de avaliações adaptativas." },
];

// ── Components ────────────────────────────────────────────────────────────────

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

function PricingCard({ tier, price, features, recommended = false }: { tier: string, price: string, features: string[], recommended?: boolean }) {
  return (
    <motion.div 
      whileHover={{ y: recommended ? -10 : -5 }}
      className={`p-10 rounded-[48px] border transition-all relative overflow-hidden ${recommended 
        ? 'border-dmz-accent bg-dmz-accent/5 shadow-2xl shadow-dmz-accent/20' 
        : 'border-white/10 bg-white/5 hover:border-white/20'}`}
    >
      {recommended && (
        <div className="absolute top-6 right-8 bg-dmz-accent text-white text-[10px] font-black px-4 py-1 rounded-full uppercase tracking-widest">
          Recommended
        </div>
      )}
      <h3 className="text-3xl font-black text-white mb-2">{tier}</h3>
      <div className="flex items-baseline gap-2 mb-8">
        <span className="text-5xl font-black text-white">{price}</span>
        <span className="text-neutral-500 font-bold">/mês</span>
      </div>
      <ul className="space-y-5 mb-10">
        {features.map((f, i) => (
          <li key={i} className="flex items-start gap-3 text-sm text-neutral-400 font-medium">
            <CheckCircle2 size={18} className="text-dmz-accent flex-shrink-0 mt-0.5" />
            {f}
          </li>
        ))}
      </ul>
      <Link href="/sign-up" className={`w-full py-5 rounded-3xl font-black text-center transition-all block ${recommended 
        ? 'bg-dmz-accent text-white hover:bg-orange-600 shadow-xl shadow-dmz-accent/40' 
        : 'bg-white/10 text-white hover:bg-white/20'}`}>
        GET STARTED
      </Link>
    </motion.div>
  );
}

// ── Main Layout ───────────────────────────────────────────────────────────────

export default function HighEndLandingPage() {
  const [mounted, setMounted] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => setMounted(true), []);

  const filteredAgents = activeCategory === "All" 
    ? AGENTS 
    : AGENTS.filter(a => a.category === activeCategory);

  if (!mounted) return <div className="min-h-screen bg-[#050505]" />;

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-dmz-accent/30 font-jakarta overflow-x-hidden">
      
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-dmz-accent/10 blur-[180px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#7C3AED]/5 blur-[180px] rounded-full" />
      </div>

      <PublicHeader />

      <main className="relative z-10">
        
        {/* HERO SECTION WITH VIDEO BG */}
        <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
          <div className="absolute inset-0 z-0">
            <video autoPlay muted loop playsInline className="w-full h-full object-cover opacity-60 scale-105">
              <source src="/video-bg.mp4" type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/80 via-transparent to-[#050505]" />
            <div className="absolute inset-0 bg-black/20" />
          </div>

          <div className="max-w-7xl mx-auto text-center relative z-10 px-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-3 bg-white/5 border border-white/10 px-6 py-2 rounded-full mb-12 backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-dmz-accent opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-dmz-accent"></span>
              </span>
              <span className="text-[10px] font-bold tracking-[0.3em] text-neutral-300 uppercase">86+ Especialistas Ativos agora</span>
            </motion.div>

            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-7xl md:text-9xl font-black mb-10 leading-[0.95] tracking-tightest">
              Hire an Elite <br />
              <span className="bg-gradient-to-r from-dmz-accent to-orange-400 bg-clip-text text-transparent">AI Squad</span> in <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40">Real-Time.</span>
            </motion.h1>

            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-xl text-neutral-400 mb-14 leading-relaxed max-w-3xl mx-auto font-medium">
              Transforme seu fluxo de trabalho estático em um squad autônomo. 
              Um ecossistema de <span className="text-white font-bold">86 agentes especialistas</span> conectados via MCP para desenhar, codar e escalar seu produto com precisão cirúrgica.
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link href="/sign-up" className="relative group px-10 py-5 bg-dmz-accent rounded-[24px] font-black text-lg overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-dmz-accent/40">
                <span className="relative z-10 flex items-center gap-2">START YOUR SQUAD <ArrowRight size={20} /></span>
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              </Link>
              <GhostButton href="#demo"><PlayCircle size={20} /> VIEW CASE STUDY</GhostButton>
            </motion.div>
          </div>
        </section>

        {/* AGENT EXPLORER — THE ONLY AGENT SECTION */}
        <section className="py-40 px-6 bg-gradient-to-b from-transparent to-white/[0.02]" id="ecosystem">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
              <div className="max-w-2xl">
                <h2 className="text-6xl font-black mb-6 tracking-tighter">Explore the <br /><span className="text-dmz-accent">Ecosystem.</span></h2>
                <p className="text-neutral-400 text-lg font-medium">Navegue pelas verticais de especialidade do squad. Cada agente é treinado para uma função crítica no ciclo de vida do seu produto.</p>
              </div>
              <div className="flex flex-wrap gap-3">
                {["All", "Engineering", "Design", "Security", "Management", "Content"].map((cat) => (
                  <button 
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${activeCategory === cat ? 'bg-dmz-accent border-dmz-accent text-white shadow-lg shadow-dmz-accent/20' : 'bg-white/5 border-white/10 text-neutral-500 hover:border-white/20'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <motion.div layout className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              {filteredAgents.map((agent) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  key={agent.name}
                  className="p-8 rounded-[32px] bg-white/[0.03] border border-white/10 hover:border-dmz-accent/30 transition-all group flex flex-col h-full"
                >
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${agent.color} flex items-center justify-center mb-6 shadow-2xl`}>
                    <agent.icon size={24} className="text-white" />
                  </div>
                  <h4 className="text-xl font-black text-white mb-1">@{agent.name}</h4>
                  <p className="text-[10px] font-bold text-dmz-accent uppercase tracking-widest mb-4">{agent.role}</p>
                  <p className="text-xs text-neutral-500 leading-relaxed font-medium">{agent.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* PLATFORM CORE CAPABILITIES — BENTO GRID */}
        <section className="py-40 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-24">
              <h2 className="text-6xl font-black mb-6 tracking-tighter">Engineered for <br /><span className="text-dmz-accent">Hyper-Growth.</span></h2>
              <p className="text-neutral-400 text-lg max-w-2xl mx-auto">Mais que um chat, um sistema operacional completo para gestão de produtos de software via IA.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-auto md:h-[800px]">
              {/* Feature 1: Intelligent Chat */}
              <motion.div className="md:col-span-8 bg-white/[0.03] border border-white/10 rounded-[48px] p-12 relative overflow-hidden group">
                <div className="relative z-10 h-full flex flex-col justify-between">
                  <div>
                    <div className="w-14 h-14 bg-dmz-accent/10 rounded-2xl flex items-center justify-center mb-8 border border-dmz-accent/20">
                      <MessageSquare className="text-dmz-accent" size={28} />
                    </div>
                    <h3 className="text-4xl font-black mb-4">Context-Aware Chat</h3>
                    <p className="text-neutral-400 text-lg max-w-md">Conversas que não esquecem. Memória de longo prazo e acesso total ao histórico do projeto para todos os especialistas.</p>
                  </div>
                  <div className="mt-12 bg-black/40 border border-white/10 rounded-3xl p-6 backdrop-blur-xl">
                    <div className="flex gap-4 items-center mb-4">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-[10px] font-bold text-white uppercase tracking-widest">Orch is typing...</span>
                    </div>
                    <div className="h-4 w-3/4 bg-white/5 rounded-full mb-3" />
                    <div className="h-4 w-1/2 bg-white/5 rounded-full" />
                  </div>
                </div>
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-dmz-accent/5 blur-[120px] rounded-full group-hover:bg-dmz-accent/10 transition-colors" />
              </motion.div>

              {/* Feature 2: Kanban */}
              <motion.div className="md:col-span-4 bg-white/[0.03] border border-white/10 rounded-[48px] p-10 flex flex-col justify-between group">
                <div>
                  <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center mb-6">
                    <Layout className="text-orange-500" size={24} />
                  </div>
                  <h3 className="text-2xl font-black mb-3">Smart Kanban</h3>
                  <p className="text-neutral-500 text-sm">Gestão visual automática. Agentes criam e movem tarefas conforme o progresso do desenvolvimento.</p>
                </div>
                <div className="space-y-3 mt-8">
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                    <div className="h-2 w-1/3 bg-dmz-accent/40 rounded-full mb-2" />
                    <div className="h-1 w-full bg-white/5 rounded-full" />
                  </div>
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/5 border-l-orange-500 border-l-2">
                    <div className="h-2 w-1/2 bg-orange-500/40 rounded-full mb-2" />
                    <div className="h-1 w-full bg-white/5 rounded-full" />
                  </div>
                </div>
              </motion.div>

              {/* Feature 3: Integrations (MCP) */}
              <motion.div className="md:col-span-4 bg-gradient-to-br from-indigo-500/10 to-purple-500/5 border border-white/10 rounded-[48px] p-10 flex flex-col justify-between group">
                <div>
                  <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center mb-6">
                    <Zap className="text-indigo-400" size={24} />
                  </div>
                  <h3 className="text-2xl font-black mb-3">MCP Native</h3>
                  <p className="text-neutral-500 text-sm">Integração universal via Model Context Protocol. Seus agentes acessam suas ferramentas locais em tempo real.</p>
                </div>
                <div className="flex gap-2 justify-center py-4">
                  {[1,2,3,4].map(i => <div key={i} className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[10px] text-neutral-500">K{i}</div>)}
                </div>
              </motion.div>

              {/* Feature 4: Reports & Analytics */}
              <motion.div className="md:col-span-8 bg-white/[0.03] border border-white/10 rounded-[48px] p-12 relative overflow-hidden group">
                <div className="relative z-10 flex flex-col md:flex-row gap-12 items-center">
                  <div className="flex-1">
                    <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-8 border border-emerald-500/20">
                      <LineChart className="text-emerald-500" size={28} />
                    </div>
                    <h3 className="text-4xl font-black mb-4">Daily Intelligence</h3>
                    <p className="text-neutral-400 text-lg">Relatórios automáticos de progresso, blockers e saúde do código enviados diariamente para sua gestão.</p>
                  </div>
                  <div className="w-full md:w-64 aspect-square bg-gradient-to-br from-emerald-500/20 to-transparent rounded-full flex items-center justify-center border border-white/5">
                    <div className="text-4xl font-black text-emerald-400">98%</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* INDUSTRIES SECTION */}
        <section className="py-40 px-6 bg-white/[0.01]">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
            <div>
              <h2 className="text-6xl font-black mb-8 tracking-tighter">Adaptado para <br /><span className="text-dmz-accent">seu setor.</span></h2>
              <p className="text-neutral-400 text-lg leading-relaxed mb-10 max-w-lg">
                O DMZ OS não é genérico. Nossos agentes entendem as nuances de diferentes verticais para entregar soluções compliance e performantes.
              </p>
              <GhostButton href="/industries">Explorar Setores <ArrowRight size={18} /></GhostButton>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {INDUSTRIES.map((ind, i) => (
                <motion.div key={i} whileHover={{ x: 5 }} className="p-8 rounded-[32px] bg-white/5 border border-white/10 hover:border-dmz-accent/30 transition-all group">
                  <div className="p-3 bg-dmz-accent/10 rounded-xl mb-4 group-hover:bg-dmz-accent/20 w-fit transition-colors">
                    <ind.icon size={20} className="text-dmz-accent" />
                  </div>
                  <h4 className="text-white font-black mb-2">{ind.title}</h4>
                  <p className="text-xs text-neutral-500 leading-relaxed">{ind.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* PRICING SECTION */}
        <section className="py-40 px-6">
          <div className="max-w-7xl mx-auto text-center mb-24">
            <h2 className="text-6xl font-black mb-6">Planos para <span className="text-dmz-accent">todo Squad.</span></h2>
            <p className="text-neutral-400 text-lg">Sem taxas escondidas. Cancele quando quiser.</p>
          </div>
          <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
            <PricingCard 
              tier="Starter" price="R$ 0" 
              features={["3 Agentes ativos (@orch, @ryan, @alex)", "Projetos ilimitados", "Memória de 24h", "Integração Supabase"]} 
            />
            <PricingCard 
              tier="Pro" price="R$ 197" recommended
              features={["Todos os 86 Agentes", "Memória de Longo Prazo Ilimitada", "Integração com 50+ MCP Tools", "Suporte prioritário via Slack", "Custom Prompts e Personas"]} 
            />
            <PricingCard 
              tier="Enterprise" price="Consultar" 
              features={["Deploy On-Premise (VPC)", "Agentes Customizados", "Governança de Dados Estrita", "SLA de 99.9%", "Treinamento de Equipe"]} 
            />
          </div>
        </section>

        {/* CTA FINAL */}
        <section className="py-60 px-6 text-center bg-gradient-to-t from-dmz-accent/10 to-transparent">
          <motion.h2 whileInView={{ opacity: [0, 1], y: [20, 0] }} className="text-7xl md:text-9xl font-black mb-16 tracking-tightest outline-text">
            READY TO <span className="text-dmz-accent">SCALE?</span>
          </motion.h2>
          <Link href="/sign-up" className="bg-white text-black px-12 py-6 rounded-[32px] font-black text-2xl hover:bg-dmz-accent hover:text-white transition-all shadow-[0_0_50px_rgba(255,255,255,0.2)]">
            ACTIVATE YOUR SQUAD
          </Link>
        </section>

      </main>

      <PublicFooter />

      <style jsx>{`
        .tracking-tightest { letter-spacing: -0.05em; }
        .outline-text {
          -webkit-text-stroke: 1px rgba(255,255,255,0.1);
          color: transparent;
        }
      `}</style>
    </div>
  );
}



