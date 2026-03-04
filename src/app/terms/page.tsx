"use client";

import Link from "next/link";
import { ArrowLeft, Shield, Clock, FileText, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { PublicHeader, PublicFooter } from "@/components/PublicLayout";

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-[#050505] text-white font-jakarta selection:bg-dmz-accent">
            <PublicHeader />

            {/* Background Decorations */}
            <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-dmz-accent/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-blue-600/10 blur-[120px] rounded-full" />
            </div>

            <main className="relative z-10 max-w-4xl mx-auto px-6 py-32">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-neutral-500 hover:text-white transition-colors mb-12 group"
                    >
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        <span>Voltar para Início</span>
                    </Link>

                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 bg-dmz-accent/10 border border-dmz-accent/20 rounded-2xl flex items-center justify-center">
                            <FileText className="text-dmz-accent" size={24} />
                        </div>
                        <h1 className="text-5xl font-black tracking-tight">Termos de Uso</h1>
                    </div>

                    <div className="flex items-center gap-6 text-sm text-neutral-500 mb-16 pb-8 border-b border-white/5">
                        <div className="flex items-center gap-2">
                            <Clock size={14} />
                            <span>Atualizado em 3 de Março, 2026</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Shield size={14} />
                            <span>Versão 2.1.0-STABLE</span>
                        </div>
                    </div>

                    <div className="space-y-16 text-neutral-400 leading-relaxed text-lg">
                        <section className="space-y-6">
                            <div className="flex items-center gap-3 mb-2">
                                <span className="text-xs font-black bg-white/5 px-2 py-1 rounded text-neutral-500 tracking-widest uppercase">Artigo 01</span>
                                <h2 className="text-2xl font-bold text-white">Propósito da Plataforma</h2>
                            </div>
                            <p>
                                O <strong>DMZ - OS Agents</strong> é uma camada de inteligência organizacional projetada para automatizar o ciclo de vida de produtos digitais através de agentes de IA especializados. Ao utilizar nossa infraestrutura, você concorda com a orquestração autônoma de tarefas conforme definido em sua configuração de squad.
                            </p>
                        </section>

                        <section className="space-y-6">
                            <div className="flex items-center gap-3 mb-2">
                                <span className="text-xs font-black bg-white/5 px-2 py-1 rounded text-neutral-500 tracking-widest uppercase">Artigo 02</span>
                                <h2 className="text-2xl font-bold text-white">Elegibilidade e Cadastro</h2>
                            </div>
                            <p>
                                O uso da plataforma exige a criação de uma conta autenticada. Você é o único responsável por todas as ações realizadas por seu usuário e pelos agentes operando sob sua chave de API ou contexto de projeto.
                            </p>
                            <div className="bg-gradient-to-r from-dmz-accent/10 to-transparent border-l-2 border-dmz-accent p-6 rounded-r-2xl backdrop-blur-sm">
                                <p className="text-sm font-medium italic text-white/80">
                                    &quot;A segurança do squad começa na integridade das credenciais do orquestrador humano.&quot;
                                </p>
                            </div>
                        </section>

                        <section className="space-y-6">
                            <div className="flex items-center gap-3 mb-2">
                                <span className="text-xs font-black bg-white/5 px-2 py-1 rounded text-neutral-500 tracking-widest uppercase">Artigo 03</span>
                                <h2 className="text-2xl font-bold text-white">Propriedade Intelectual</h2>
                            </div>
                            <p>
                                Todo o código gerado pelos agentes para seus projetos é de sua propriedade exclusiva. No entanto, a arquitetura dos agentes, prompts base, modelos de SOP e a interface DMZ OS permanecem como propriedade intelectual da DMZ Labs.
                            </p>
                        </section>

                        <section className="space-y-6">
                            <div className="flex items-center gap-3 mb-2">
                                <span className="text-xs font-black bg-white/5 px-2 py-1 rounded text-neutral-500 tracking-widest uppercase">Artigo 04</span>
                                <h2 className="text-2xl font-bold text-white">Limitações Técnicas</h2>
                            </div>
                            <p>
                                Embora operemos com modelos de linguagem de última geração, o squad pode ocasionalmente gerar alucinações técnicas. É dever do usuário (através dos agentes de auditoria como @emma ou @constantine) validar entregas críticas antes do deploy em produção.
                            </p>
                        </section>

                        <section className="space-y-6">
                            <div className="flex items-center gap-3 mb-2">
                                <span className="text-xs font-black bg-white/5 px-2 py-1 rounded text-neutral-500 tracking-widest uppercase">Artigo 05</span>
                                <h2 className="text-2xl font-bold text-white">Encerramento</h2>
                            </div>
                            <p>
                                Reservamos o direito de suspender acessos que violem nossas diretrizes de segurança ou que façam uso abusivo dos recursos de processamento de IA, garantindo a estabilidade do ecossistema para todos os squads.
                            </p>
                        </section>
                    </div>

                    <div className="mt-24 p-12 bg-gradient-to-br from-white/[0.03] to-transparent border border-white/10 rounded-[40px] text-center backdrop-blur-md relative overflow-hidden group mb-24">
                        <div className="absolute inset-0 bg-dmz-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <h3 className="text-xl font-bold text-white mb-4 relative z-10">Dúvidas sobre os termos?</h3>
                        <p className="text-neutral-500 mb-8 relative z-10">Nossa equipe jurídica e o agente @theron estão à disposição.</p>
                        <a href="mailto:legal@dmzdigital.com.br" className="bg-white text-black px-8 py-3 rounded-xl font-bold hover:bg-neutral-200 transition-all relative z-10 inline-flex items-center gap-2">
                            <CheckCircle2 size={18} />
                            <span>Contatar Jurídico</span>
                        </a>
                    </div>
                </motion.div>
            </main>

            <PublicFooter />
        </div>
    );
}
