"use client";

import Link from "next/link";
import {
    Bot, Rocket, Shield, Zap, Music2, Users, Code2,
    ArrowRight, CheckCircle2, Globe, Star, PlayCircle,
    Cpu, Layers, MessageSquare, BarChart3, AppWindow,
    Database, Layout, Workflow, Box, Building2, ShoppingCart,
    HeartPulse, Landmark, Plane, GraduationCap
} from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";

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
                href="/sign-up"
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

export default function LandingPage() {
    return (
        <div className="bg-[#050505] text-white selection:bg-dmz-accent selection:text-white font-jakarta">

            {/* Navbar Area */}
            <header className="fixed top-0 w-full z-50 px-6 py-4">
                <nav className="max-w-7xl mx-auto flex items-center justify-between bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl px-6 py-3">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-dmz-accent rounded-lg flex items-center justify-center">
                            <Bot size={18} className="text-white" />
                        </div>
                        <span className="font-extrabold text-lg tracking-tight">DMZ OS</span>
                    </div>

                    <div className="hidden md:flex items-center gap-8 text-sm font-medium text-neutral-400">
                        <Link href="/squad" className="hover:text-white transition-colors">Agentes</Link>
                        <a href="#capabilities" className="hover:text-white transition-colors">Capacidades</a>
                        <a href="#industries" className="hover:text-white transition-colors">Indústrias</a>
                        <a href="#pricing" className="hover:text-white transition-colors">Preços</a>
                    </div>

                    <div className="flex items-center gap-4">
                        <Link href="/sign-in" className="text-sm font-bold text-neutral-400 hover:text-white transition-colors px-4 py-2">Login</Link>
                        <Link href="/sign-up" className="bg-dmz-accent text-white text-xs font-bold px-5 py-2.5 rounded-xl hover:bg-orange-500 transition-all shadow-lg shadow-dmz-accent/20">Sign Up</Link>
                    </div>
                </nav>
            </header>

            {/* Hero Section */}
            <section className="relative pt-48 pb-24 px-6 overflow-hidden">
                {/* Background Gradients */}
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-dmz-accent/20 blur-[150px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-blue-600/10 blur-[150px] rounded-full" />

                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
                    <div className="relative z-10">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full mb-8"
                        >
                            <Zap size={14} className="text-dmz-accent" />
                            <span className="text-[11px] font-bold tracking-widest text-neutral-300 uppercase">A Revolução AI-Native Chegou</span>
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-6xl md:text-8xl font-black mb-8 leading-[1.05] tracking-tighter"
                        >
                            Seu Squad de <br />
                            <span className="text-dmz-accent">AI Experts</span> pronto <br />
                            em segundos.
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-lg text-neutral-400 mb-10 leading-relaxed max-w-lg"
                        >
                            O DMZ OS Agents transforma seu fluxo de trabalho estático em um squad autônomo de 18 especialistas que planejam, criam e auditam seu produto em tempo real.
                        </motion.p>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="flex flex-col sm:flex-row gap-4"
                        >
                            <Link href="/sign-up" className="bg-dmz-accent text-white px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-orange-500 transition-all shadow-xl shadow-dmz-accent/30 group">
                                Criar Meu Squad <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <button className="bg-white/5 border border-white/10 text-white px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-white/10 transition-all">
                                <PlayCircle size={18} /> Ver Demo
                            </button>
                        </motion.div>

                        <div className="mt-12 flex items-center gap-6">
                            <div className="flex -space-x-3">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="w-10 h-10 rounded-full border-2 border-[#050505] bg-neutral-800 overflow-hidden">
                                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i * 123}`} alt="User" />
                                    </div>
                                ))}
                            </div>
                            <p className="text-sm text-neutral-500">
                                <span className="text-white font-bold">+500 squads</span> criados esta semana
                            </p>
                        </div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4 }}
                        className="relative"
                    >
                        <div className="absolute inset-0 bg-dmz-accent/20 blur-[100px] rounded-full scale-75 animate-pulse" />
                        <div className="relative bg-white/5 border border-white/10 p-3 rounded-[48px] backdrop-blur-sm shadow-2xl overflow-hidden">
                            <img
                                src="/hero-dashboard.png"
                                alt="DMZ OS Interface"
                                className="rounded-[40px] border border-white/5 w-full hover:scale-[1.05] transition-transform duration-1000"
                            />
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Capabilities Section */}
            <section id="capabilities" className="py-32 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-24">
                        <h2 className="text-4xl md:text-6xl font-black mb-8 leading-tight">O que você pode <br /><span className="text-dmz-accent">construir hoje?</span></h2>
                        <p className="text-neutral-400 max-w-2xl mx-auto">Dos primeiros requisitos até a escala global. Seu squad gerencia a complexidade técnica para você focar no valor.</p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <FeatureCard
                            icon={AppWindow}
                            title="SaaS & Web Apps"
                            desc="Da arquitetura Next.js ao deploy em containers com total segurança e performance."
                        />
                        <FeatureCard
                            icon={Database}
                            title="Integrações de Dados"
                            desc="Pipelines de dados, orquestração de APIs e gestão de metadados com auditabilidade nativa."
                        />
                        <FeatureCard
                            icon={Workflow}
                            title="Automação Inteligente"
                            desc="SOPs vivos que transformam processos manuais em fluxos autônomos de agentes."
                        />
                        <FeatureCard
                            icon={Shield}
                            title="Sistemas Críticos"
                            desc="Conformidade LGPD, monitoramento STRIDE e infra blindada por design em cada commit."
                        />
                    </div>
                </div>
            </section>

            {/* Industries Section */}
            <section id="industries" className="py-32 bg-white/[0.02] px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-3 gap-20 items-center">
                        <div className="lg:col-span-1">
                            <h2 className="text-4xl md:text-5xl font-black mb-8 leading-tight">Adaptado para <br /><span className="text-dmz-accent">seu setor.</span></h2>
                            <p className="text-neutral-400 mb-8 leading-relaxed">
                                O DMZ OS não é genérico. Nossos agentes entendem as nuances de diferentes indústrias para entregar soluções compliance e performantes.
                            </p>
                            <Link href="/sign-up" className="text-dmz-accent font-bold flex items-center gap-2 group">
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
                                useCase="Motores de recomendação, gestão de inventário inteligente e chatbots de alta conversão."
                            />
                            <IndustryCard
                                icon={Code2}
                                title="Software & SaaS"
                                useCase="Aceleração de roadmap, refatoração de legado e QA automatizado em larga escala."
                            />
                            <IndustryCard
                                icon={Plane}
                                title="Logística & Travel"
                                useCase="Otimização de rotas, sistemas de reserva e rastreamento de ativos ponta a ponta."
                            />
                            <IndustryCard
                                icon={GraduationCap}
                                title="EdTech"
                                useCase="Personalização de trilhas de aprendizagem e automação de avaliações adaptativas."
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Agents Section */}
            <section id="agents" className="py-32 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl md:text-5xl font-black mb-6">Conheça o Squad</h2>
                        <p className="text-neutral-400 max-w-2xl mx-auto">
                            18 agentes especializados em cada etapa do ciclo de vida de um produto SaaS.
                            Do código à segurança jurídica, eles cuidam de tudo.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <FeatureCard
                            icon={Music2}
                            title="@orch - Orchestrator"
                            desc="O cérebro da operação. Recebe demandas, cria planos de ação e delega tarefas para os especialistas certos."
                        />
                        <FeatureCard
                            icon={Code2}
                            title="@ryan - Developer"
                            desc="Implementação de alta performance em Next.js, Node e Python. Focado em código limpo, escalável e testado."
                        />
                        <FeatureCard
                            icon={Shield}
                            title="@constantine - Security"
                            desc="Garante que seu código e infraestrutura estão blindados contra ataques e em conformidade com as leis de dados."
                        />
                        <FeatureCard
                            icon={Users}
                            title="@syd - Squad Manager"
                            desc="Gerencia a comunicação, saúde do squad e alinhamento estratégico entre os agentes especialistas."
                        />
                        <FeatureCard
                            icon={Rocket}
                            title="@oliver - DevOps"
                            desc="Pipelines CI/CD automatizados, deploy em containers e observabilidade total da sua infra."
                        />
                        <FeatureCard
                            icon={Star}
                            title="@aurora - Design Chief"
                            desc="Direção criativa ultra-moderna. Garante que seu produto seja visualmente impactante e coerente."
                        />
                    </div>
                    <div className="text-center mt-12">
                        <Link href="/squad" className="bg-white/5 border border-white/10 px-8 py-4 rounded-2xl font-bold hover:bg-white/10 transition-all inline-flex items-center gap-2">
                            Ver Squad Completo <ArrowRight size={18} />
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
                            <h2 className="text-4xl md:text-5xl font-black mb-8 leading-tight">Um projeto que <br /> <span className="text-dmz-accent">evolui sozinho.</span></h2>
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
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl md:text-5xl font-black mb-6">Planos para todo Squad</h2>
                        <p className="text-neutral-400 max-w-xl mx-auto">Escolha o nível de poder que seu projeto precisa. Sem taxas escondidas, cancele quando quiser.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 items-start">
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
                                "Todos os 18 Agentes",
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
                </div>
            </section>

            {/* Footer */}
            <footer className="py-20 border-t border-white/5 bg-[#030303]">
                <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-12 mb-20">
                    <div className="col-span-2">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="w-8 h-8 bg-dmz-accent rounded-lg flex items-center justify-center">
                                <Bot size={18} className="text-white" />
                            </div>
                            <span className="font-extrabold text-xl tracking-tight">DMZ OS</span>
                        </div>
                        <p className="text-neutral-500 max-w-sm mb-8">
                            A camada de inteligência organizacional que torna seu repositório vivo.
                            Built by agents, for developers.
                        </p>
                        <div className="flex gap-4">
                            <a
                                href="https://github.com/eldanielsantos-git/dmz-agents"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 bg-white/5 rounded-lg border border-white/10 flex items-center justify-center hover:bg-white/10 cursor-pointer transition-all"
                            >
                                <svg className="w-5 h-5 text-neutral-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" /></svg></a>
                        </div>
                    </div>

                    <div>
                        <h5 className="font-bold text-white mb-6">Plataforma</h5>
                        <div className="flex flex-col gap-4 text-sm text-neutral-500">
                            <Link href="/squad" className="hover:text-dmz-accent text-white font-medium">Especialistas</Link>
                            <Link href="/app/projects" className="hover:text-dmz-accent">Projetos</Link>
                            <Link href="/sign-in" className="hover:text-dmz-accent">Login</Link>
                            <Link href="/sign-up" className="hover:text-dmz-accent">Cadastro</Link>
                        </div>
                    </div>

                    <div>
                        <h5 className="font-bold text-white mb-6">Legal</h5>
                        <div className="flex flex-col gap-4 text-sm text-neutral-500">
                            <Link href="/terms" className="hover:text-dmz-accent">Termos de Uso</Link>
                            <Link href="/privacy" className="hover:text-dmz-accent">Privacidade</Link>
                            <Link href="/cookies" className="hover:text-dmz-accent">Cookies</Link>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-6 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-[11px] text-neutral-600 font-medium">© 2024 DMZ Labs. Todos os direitos reservados.</p>
                    <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                        <span className="text-[10px] text-neutral-600 uppercase font-black tracking-widest">System Status: All systems go</span>
                    </div>
                </div>
            </footer>
        </div>
    );
}
