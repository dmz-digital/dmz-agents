"use client";

import Link from "next/link";
import { ArrowLeft, Cookie, Zap, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

export default function CookiesPage() {
    return (
        <div className="min-h-screen bg-[#050505] text-white font-jakarta selection:bg-dmz-accent">
            {/* Background Decorations */}
            <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-dmz-accent/10 blur-[150px] rounded-full" />
                <div className="absolute top-[40%] left-[-5%] w-[30%] h-[30%] bg-neutral-800/20 blur-[100px] rounded-full" />
            </div>

            <main className="relative z-10 max-w-4xl mx-auto px-6 py-24">
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                >
                    <Link
                        href="/home"
                        className="inline-flex items-center gap-2 text-neutral-500 hover:text-white transition-colors mb-12 group"
                    >
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        <span>Voltar para Início</span>
                    </Link>

                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center">
                            <Cookie className="text-dmz-accent" size={24} />
                        </div>
                        <h1 className="text-5xl font-black tracking-tight">Cookies</h1>
                    </div>

                    <p className="text-neutral-500 mb-20 text-lg max-w-2xl">
                        Utilizamos cookies e tecnologias similares para garantir que seu squad opere com
                        máxima performance e segurança em cada sessão.
                    </p>

                    <div className="space-y-20 mb-24">
                        <section className="grid md:grid-cols-3 gap-12">
                            <div className="md:col-span-1">
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    <ShieldCheck className="text-green-500" size={20} />
                                    Essenciais
                                </h2>
                                <p className="text-xs text-neutral-600 mt-2 uppercase font-bold tracking-widest">Obrigatórios</p>
                            </div>
                            <div className="md:col-span-2 text-neutral-400">
                                <p>Necessários para o funcionamento básico da plataforma. Incluem cookies de autenticação (Next-Auth) para manter sua sessão segura e cookies de proteção contra CSRF.</p>
                                <ul className="mt-4 space-y-2 text-sm font-mono bg-white/5 p-4 rounded-xl border border-white/5">
                                    <li className="flex justify-between"><span>__Host-next-auth.csrf-token</span> <span className="text-neutral-600">Sessão</span></li>
                                    <li className="flex justify-between"><span>__Secure-next-auth.session-token</span> <span className="text-neutral-600">Permanente</span></li>
                                </ul>
                            </div>
                        </section>

                        <section className="grid md:grid-cols-3 gap-12">
                            <div className="md:col-span-1">
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    <Zap className="text-dmz-accent" size={20} />
                                    Performance
                                </h2>
                                <p className="text-xs text-neutral-600 mt-2 uppercase font-bold tracking-widest">Opcionais</p>
                            </div>
                            <div className="md:col-span-2 text-neutral-400">
                                <p>Utilizados para lembrar suas preferências de interface — como o tema escuro, filtros ativos no Squad View e o estado de visibilidade de painéis laterais.</p>
                            </div>
                        </section>

                        <section className="grid md:grid-cols-3 gap-12">
                            <div className="md:col-span-1">
                                <h2 className="text-xl font-bold flex items-center gap-2 text-blue-500">
                                    <Cookie size={20} />
                                    Análise
                                </h2>
                                <p className="text-xs text-neutral-600 mt-2 uppercase font-bold tracking-widest">Opcionais</p>
                            </div>
                            <div className="md:col-span-2 text-neutral-400">
                                <p>Ajudam-nos a entender como os usuários interagem com os agentes para que possamos otimizar a latência e a precisão da orquestração.</p>
                            </div>
                        </section>
                    </div>

                    <div className="p-8 border-t border-white/10 flex flex-col items-center text-center">
                        <p className="text-sm text-neutral-500 mb-6">Você pode gerenciar ou desativar cookies diretamente nas configurações do seu navegador.</p>
                        <Link href="/home" className="text-white font-bold py-3 px-8 border border-white/20 rounded-xl hover:bg-white/5 transition-all">
                            Entendido
                        </Link>
                    </div>
                </motion.div>
            </main>
        </div>
    );
}
