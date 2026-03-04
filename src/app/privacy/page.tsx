"use client";

import Link from "next/link";
import { ArrowLeft, Lock, Eye, Database, Globe } from "lucide-react";
import { motion } from "framer-motion";
import { PublicHeader, PublicFooter } from "@/components/PublicLayout";

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-[#050505] text-white font-jakarta selection:bg-dmz-accent">
            <PublicHeader />

            {/* Background Decorations */}
            <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-dmz-accent/10 blur-[120px] rounded-full" />
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
                        <div className="w-12 h-12 bg-blue-600/10 border border-blue-600/20 rounded-2xl flex items-center justify-center">
                            <Lock className="text-blue-500" size={24} />
                        </div>
                        <h1 className="text-5xl font-black tracking-tight">Privacidade</h1>
                    </div>

                    <p className="text-neutral-500 mb-16 text-lg max-w-2xl leading-relaxed">
                        Sua privacidade é a base da nossa confiança. O DMZ OS opera sob o princípio de
                        <strong className="text-white"> soberania de dados</strong> por design.
                    </p>

                    <div className="grid md:grid-cols-2 gap-6 mb-24">
                        <div className="bg-white/[0.03] border border-white/10 p-8 rounded-[32px] hover:bg-white/[0.05] transition-colors group">
                            <Eye className="text-dmz-accent mb-6 group-hover:scale-110 transition-transform" size={32} />
                            <h3 className="text-xl font-bold mb-3">Transparência Total</h3>
                            <p className="text-neutral-400 leading-relaxed">Rastreamos cada decisão do agente para que você saiba exatamente como seus dados são processados.</p>
                        </div>
                        <div className="bg-white/[0.03] border border-white/10 p-8 rounded-[32px] hover:bg-white/[0.05] transition-colors group">
                            <Database className="text-blue-500 mb-6 group-hover:scale-110 transition-transform" size={32} />
                            <h3 className="text-xl font-bold mb-3">Isolamento de Dados</h3>
                            <p className="text-neutral-400 leading-relaxed">Projetos operam em silos lógicos. Seus dados nunca são usados para treinar modelos globais.</p>
                        </div>
                    </div>

                    <div className="space-y-16 text-neutral-400 leading-relaxed text-lg mb-32">
                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                                <span className="w-1.5 h-6 bg-dmz-accent rounded-full" />
                                Coleta de Informações
                            </h2>
                            <p>
                                Coletamos apenas o necessário para a operação do squad: dados de conta (Google Auth ou Email), metadados do projeto e logs de execução dos agentes. Não &quot;mineramos&quot; seu código para propósitos de marketing.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                                <span className="w-1.5 h-6 bg-blue-500 rounded-full" />
                                LGPD & Compliance
                            </h2>
                            <p>
                                Estamos em conformidade com a Lei Geral de Proteção de Dados. Você possui o direito de exportar toda a memória do seu squad ou solicitar a purga completa de dados de qualquer projeto a qualquer momento.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                                <span className="w-1.5 h-6 bg-neutral-700 rounded-full" />
                                Processamento via Terceiros
                            </h2>
                            <p>
                                Para prover a inteligência dos agentes, utilizamos provedores de LLM premium. Seus dados são enviados via API criptografada e processados sob termos de enterprise que garantem a não-retenção para treinamento por parte dos provedores.
                            </p>
                        </section>
                    </div>

                    <div className="p-10 bg-blue-600/10 border border-blue-600/20 rounded-[40px] flex flex-col md:flex-row items-center gap-8 backdrop-blur-md mb-24">
                        <div className="w-20 h-20 bg-blue-600/20 rounded-3xl flex items-center justify-center shrink-0">
                            <Globe className="text-blue-500" size={40} />
                        </div>
                        <div>
                            <h4 className="text-xl font-bold text-white mb-2">Dúvidas sobre Proteção de Dados?</h4>
                            <p className="text-neutral-400 leading-relaxed">
                                Nosso Data Protection Officer (DPO) e nosso agente especialista em segurança @constantine podem detalhar nossos protocolos de criptografia e conformidade.
                            </p>
                        </div>
                    </div>
                </motion.div>
            </main>

            <PublicFooter />
        </div>
    );
}
