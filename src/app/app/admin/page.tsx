"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    Shield, MessageSquare, Bot, Settings,
    ArrowLeft, ChevronRight, Sparkles,
    Code2, Globe, Paintbrush, FileText,
    ArrowRight
} from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import AppHeader from "@/components/AppHeader";
import Link from "next/link";

export default function AdminDashboard() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        document.title = "Painel Admin | DMZ - OS Agents";
        checkAdmin();
    }, []);

    async function checkAdmin() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            router.push("/sign-in");
            return;
        }

        const { data: profile } = await supabase
            .from("user_profiles")
            .select("is_admin")
            .eq("id", user.id)
            .single();

        if (!profile?.is_admin) {
            router.push("/app");
            return;
        }

        setIsAdmin(true);
        setLoading(false);
    }

    const adminCards = [
        {
            id: "prompts",
            title: "Prompts do Chat",
            description: "Gerencie as instruções mestre dos agentes, ferramentas e transcrições.",
            icon: MessageSquare,
            color: "bg-orange-500",
            href: "/app/admin/prompts",
            features: ["Personalidades dos Agentes", "Instruções de Ferramentas", "Prompt de Transcrição"]
        },
        {
            id: "agents",
            title: "Agentes e Skills",
            description: "Configure os 44 agentes especializados e suas competências core.",
            icon: Bot,
            color: "bg-blue-500",
            href: "/app/admin/agents",
            features: ["Definição de Agentes", "Gerenciamento de Skills", "Hierarquia do Squad"]
        },
        {
            id: "infra",
            title: "Infra & Ferramentas",
            description: "Configurações de API, modelos de LLM e chaves de ambiente.",
            icon: Settings,
            color: "bg-purple-500",
            href: "/app/admin/settings",
            features: ["Modelos por Agente", "API Keys", "Logs de Execução"]
        }
    ];

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-white">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-8 h-8 border-4 border-dmz-accent border-t-transparent rounded-full"
                />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FDFDFD] font-jakarta">
            {/* Header — padrão das páginas internas */}
            <header className="px-8 pt-10 pb-4">
                <div className="max-w-6xl mx-auto">
                    <AppHeader
                        title="DMZ – OS Agents"
                        subtitle="Manage your squad specialists"
                        showButtons={false}
                    />
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-8 py-8">
                <div className="flex items-center gap-4 mb-12">
                    <Link href="/app/profile" className="p-2 hover:bg-neutral-100 rounded-xl text-neutral-400 transition-all">
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <div className="bg-dmz-accent/10 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                                <Shield size={10} className="text-dmz-accent fill-dmz-accent" />
                                <span className="text-[10px] font-black text-dmz-accent uppercase tracking-widest">Painel Admin</span>
                            </div>
                        </div>
                        <h1 className="text-3xl font-black text-neutral-900 tracking-tight">Gerenciar Aplicação</h1>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {adminCards.map((card, idx) => (
                        <motion.div
                            key={card.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                        >
                            <Link
                                href={card.href}
                                className="group block bg-white border border-neutral-100 rounded-[32px] p-8 hover:border-dmz-accent/20 hover:shadow-2xl hover:shadow-dmz-accent/5 transition-all h-full relative overflow-hidden"
                            >
                                {/* Decorative Gradient */}
                                <div className={`absolute top-0 right-0 w-32 h-32 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity rounded-full -mr-12 -mt-12 ${card.color}`} />

                                <div className={`w-14 h-14 ${card.color} text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-${card.id === 'prompts' ? 'orange' : card.id === 'agents' ? 'blue' : 'purple'}-500/20`}>
                                    <card.icon size={28} />
                                </div>

                                <h2 className="text-xl font-black text-neutral-900 mb-3 group-hover:text-dmz-accent transition-colors">{card.title}</h2>
                                <p className="text-sm font-medium text-neutral-500 mb-8 leading-relaxed">
                                    {card.description}
                                </p>

                                <div className="space-y-3 mb-8">
                                    {card.features.map(f => (
                                        <div key={f} className="flex items-center gap-2 text-xs font-bold text-neutral-400">
                                            <div className="w-1 h-1 bg-neutral-300 rounded-full" />
                                            {f}
                                        </div>
                                    ))}
                                </div>

                                <div className="flex items-center gap-2 text-sm font-black text-neutral-900 mt-auto pt-4 border-t border-neutral-50">
                                    Acessar Área
                                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>

                {/* Quick Stats or Status */}
                <div className="mt-12 p-8 bg-neutral-900 rounded-[32px] text-white flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center">
                            <Sparkles size={32} className="text-orange-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black tracking-tight">Status do Squad</h3>
                            <p className="text-sm text-white/50 font-medium">Todos os 44 agentes estão operacionais e conectados.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-8">
                        <div className="text-center">
                            <div className="text-3xl font-black tracking-tighter">44</div>
                            <div className="text-[10px] uppercase tracking-widest font-black text-white/40">Agentes</div>
                        </div>
                        <div className="h-10 w-px bg-white/10" />
                        <div className="text-center">
                            <div className="text-3xl font-black tracking-tighter">98%</div>
                            <div className="text-[10px] uppercase tracking-widest font-black text-white/40">Precisão</div>
                        </div>
                        <div className="h-10 w-px bg-white/10" />
                        <div className="text-center">
                            <div className="text-3xl font-black tracking-tighter">∞</div>
                            <div className="text-[10px] uppercase tracking-widest font-black text-white/40">Debates</div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
