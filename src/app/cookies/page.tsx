"use client";

import Link from "next/link";
import { ArrowLeft, Cookie, Zap, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { PublicHeader, PublicFooter } from "@/components/PublicLayout";

export default function CookiesPage() {
    return (
        <div className="min-h-screen bg-[#050505] text-white font-jakarta selection:bg-dmz-accent">
            <PublicHeader />

            {/* Background Decorations */}
            <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-dmz-accent/15 blur-[150px] rounded-full" />
                <div className="absolute top-[40%] left-[-5%] w-[30%] h-[30%] bg-neutral-800/20 blur-[100px] rounded-full" />
            </div>

            <main className="relative z-10 max-w-4xl mx-auto px-6 py-32">
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                >
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-neutral-500 hover:text-white transition-colors mb-12 group"
                    >
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        <span>Voltar para Início</span>
                    </Link>

                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-14 h-14 bg-white/[0.03] border border-white/10 rounded-[22px] flex items-center justify-center shadow-2xl">
                            <Cookie className="text-dmz-accent" size={28} />
                        </div>
                        <h1 className="text-5xl font-black tracking-tight">Cookies</h1>
                    </div>

                    <p className="text-neutral-500 mb-24 text-xl max-w-2xl leading-relaxed">
                        Utilizamos cookies e tecnologias similares para garantir que seu squad opere com
                        máxima performance e segurança em cada sessão.
                    </p>

                    <div className="space-y-24 mb-32">
                        <section className="grid md:grid-cols-3 gap-12 group">
                            <div className="md:col-span-1">
                                <h2 className="text-2xl font-bold flex items-center gap-3 text-white">
                                    <ShieldCheck className="text-green-500" size={24} />
                                    Essenciais
                                </h2>
                                <p className="text-[10px] text-neutral-600 mt-3 uppercase font-black tracking-[0.2em]">Obrigatórios</p>
                            </div>
                            <div className="md:col-span-2 text-neutral-400 leading-relaxed text-lg">
                                <p>Necessários para o funcionamento básico da plataforma. Incluem cookies de autenticação para manter sua sessão segura e proteção contra ataques CSRF.</p>
                                <div className="mt-8 overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02]">
                                    <table className="w-full text-left text-sm font-mono">
                                        <thead>
                                            <tr className="border-b border-white/5 text-neutral-600 text-[10px] uppercase font-bold">
                                                <th className="px-6 py-3">Identificador</th>
                                                <th className="px-6 py-3">Duração</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            <tr>
                                                <td className="px-6 py-4 text-neutral-300">__Host-next-auth.csrf-token</td>
                                                <td className="px-6 py-4 text-neutral-500">Sessão</td>
                                            </tr>
                                            <tr>
                                                <td className="px-6 py-4 text-neutral-300">__Secure-next-auth.session-token</td>
                                                <td className="px-6 py-4 text-neutral-500">Permanente</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </section>

                        <section className="grid md:grid-cols-3 gap-12">
                            <div className="md:col-span-1">
                                <h2 className="text-2xl font-bold flex items-center gap-3 text-white">
                                    <Zap className="text-dmz-accent" size={24} />
                                    Performance
                                </h2>
                                <p className="text-[10px] text-neutral-600 mt-3 uppercase font-black tracking-[0.2em]">Opcionais</p>
                            </div>
                            <div className="md:col-span-2 text-neutral-400 leading-relaxed text-lg">
                                <p>Utilizados para lembrar suas preferências de interface — como o tema escuro, filtros ativos no Squad View e o estado de visibilidade de painéis laterais.</p>
                            </div>
                        </section>

                        <section className="grid md:grid-cols-3 gap-12">
                            <div className="md:col-span-1">
                                <h2 className="text-2xl font-bold flex items-center gap-3 text-blue-500">
                                    <Cookie size={24} />
                                    Análise
                                </h2>
                                <p className="text-[10px] text-neutral-600 mt-3 uppercase font-black tracking-[0.2em]">Opcionais</p>
                            </div>
                            <div className="md:col-span-2 text-neutral-400 leading-relaxed text-lg">
                                <p>Ajudam-nos a entender como os usuários interagem com os agentes para que possamos otimizar a latência e a precisão da orquestração.</p>
                            </div>
                        </section>
                    </div>

                    <div className="p-12 border-t border-white/5 flex flex-col items-center text-center mb-24">
                        <p className="text-sm text-neutral-500 mb-8 max-w-md leadng-relaxed">Você pode gerenciar ou desativar cookies diretamente nas configurações do seu navegador.</p>
                        <Link href="/" className="text-black bg-white font-bold py-4 px-12 rounded-2xl hover:bg-neutral-200 transition-all shadow-xl shadow-white/5">
                            Entendido
                        </Link>
                    </div>
                </motion.div>
            </main>

            <PublicFooter />
        </div>
    );
}
