"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
    LayoutDashboard, Users, Bot, FolderOpen,
    History, MessageSquare, ChevronRight,
    Star, ArrowRight, Music2, ClipboardList,
    Code2, ShieldAlert, Sparkles, TrendingUp,
    Target, PenLine, Blocks, Database, Megaphone, Scale, Plus
} from "lucide-react";
import { motion } from "framer-motion";
import AppHeader from "@/components/AppHeader";
import { supabase } from "@/lib/supabase";

const CAT_COLORS: Record<string, string> = {
    Orchestration: "#E85D2F",
    Product: "#2563EB",
    Development: "#0891B2",
    Security: "#DC2626",
    Strategy: "#D97706",
    Design: "#DB2777",
    Sales: "#10B981",
    Marketing: "#059669",
    Copy: "#7C3AED",
    Frameworks: "#475569",
    Data: "#0369A1",
    Legal: "#64748B"
};

const CATEGORIES = [
    { name: "Orchestration", icon: Music2 },
    { name: "Product", icon: ClipboardList },
    { name: "Development", icon: Code2 },
    { name: "Security", icon: ShieldAlert },
    { name: "Strategy", icon: Target },
    { name: "Design", icon: Sparkles },
    { name: "Sales", icon: TrendingUp },
    { name: "Marketing", icon: Megaphone },
    { name: "Copy", icon: PenLine },
    { name: "Frameworks", icon: Blocks },
    { name: "Data", icon: Database },
    { name: "Legal", icon: Scale }
];

export default function AppDashboard() {
    const [projects, setProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        document.title = "Dashboard | DMZ - OS Agents";
        async function fetchProjects() {
            const { data } = await supabase
                .from('dmz_agents_projects')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(2);
            if (data) setProjects(data);
            setLoading(false);
        }
        fetchProjects();
    }, []);

    return (
        <div className="min-h-screen bg-[#FDFDFD] pb-32">
            {/* Header */}
            <header className="px-8 pt-12 pb-8">
                <div className="max-w-7xl mx-auto">
                    <AppHeader
                        title="Dashboard Central"
                        subtitle="Bem-vindo ao DMZ OS — Sua orquestrator de inteligência."
                        showButtons={false}
                    />
                </div>
            </header>

            <main className="px-8 flex flex-col gap-8 max-w-7xl mx-auto">
                {/* Top Row: Categories & Explore */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Card 1: Categories */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="lg:col-span-2 bg-white border border-neutral-100 rounded-[32px] p-8 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-dmz-accent/5 blur-3xl rounded-full" />

                        <div className="flex justify-between items-center mb-8 relative z-10">
                            <div>
                                <h3 className="text-xl font-bold text-neutral-900">Categorias de Especialistas</h3>
                                <p className="text-sm text-neutral-400">Filtre o squad por domínios técnicos</p>
                            </div>
                            <Link href="/app/agents" className="text-neutral-400 hover:text-dmz-accent transition-colors">
                                <ChevronRight size={20} />
                            </Link>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 relative z-10">
                            {CATEGORIES.map((cat) => (
                                <Link
                                    key={cat.name}
                                    href={`/app/agents?category=${cat.name}`}
                                    className="flex flex-col gap-3 p-4 rounded-2xl border border-neutral-50 hover:border-dmz-accent/20 hover:bg-orange-50/20 transition-all group"
                                >
                                    <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                                        style={{ backgroundColor: `${CAT_COLORS[cat.name]}10`, color: CAT_COLORS[cat.name] }}>
                                        <cat.icon size={16} />
                                    </div>
                                    <span className="text-[10px] sm:text-[11px] font-bold text-neutral-700 tracking-tight uppercase truncate">{cat.name}</span>
                                </Link>
                            ))}
                        </div>
                    </motion.div>

                    {/* Card 2: Explore All Agents */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 }}
                        onClick={() => window.location.href = '/app/agents'}
                        className="bg-neutral-900 rounded-[32px] p-8 shadow-xl relative overflow-hidden flex flex-col cursor-pointer hover:scale-[1.01] active:scale-[0.99] transition-transform"
                    >
                        <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-dmz-accent/20 blur-[100px] rounded-full" />

                        <div className="mb-auto relative z-10">
                            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6">
                                <Users className="text-white" size={24} />
                            </div>
                            <h3 className="text-2xl font-black text-white mb-3">Core Squad</h3>
                            <p className="text-neutral-400 text-sm leading-relaxed mb-8">
                                Conheça todos os nossos 44 agentes especializados orquestrados para sua empresa.
                            </p>
                        </div>

                        <Link
                            href="/app/agents"
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white text-black py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-neutral-200 transition-all relative z-10"
                        >
                            Ver Todos Agentes <ArrowRight size={18} />
                        </Link>
                    </motion.div>
                </div>

                {/* Bottom Row: Projects, History, Chat */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Card 3: Projects */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        onClick={() => window.location.href = '/app/projects'}
                        className="bg-white border border-neutral-100 rounded-[32px] p-8 shadow-sm flex flex-col cursor-pointer hover:shadow-md transition-shadow group"
                    >
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 bg-blue-50/50 rounded-xl flex items-center justify-center">
                                <FolderOpen className="text-blue-600" size={20} />
                            </div>
                            <h3 className="text-xl font-bold text-neutral-900">Seus Projetos</h3>
                        </div>

                        <div className="flex-1 flex flex-col gap-4 overflow-hidden">
                            {loading ? (
                                <div className="space-y-4">
                                    <div className="h-20 bg-neutral-50 rounded-2xl animate-pulse" />
                                    <div className="h-20 bg-neutral-50 rounded-2xl animate-pulse" />
                                </div>
                            ) : projects.length > 0 ? (
                                <div className="space-y-3">
                                    {projects.map((proj) => (
                                        <div key={proj.id} className="p-4 border border-neutral-100 rounded-2xl hover:border-dmz-accent/30 transition-all group cursor-pointer bg-white">
                                            <div className="flex justify-between items-start mb-1">
                                                <h4 className="text-sm font-black text-neutral-800 tracking-tight">{proj.name}</h4>
                                                <span className="text-[9px] font-bold bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full uppercase">{proj.status}</span>
                                            </div>
                                            <p className="text-[11px] text-neutral-400 line-clamp-1">{proj.description}</p>
                                            <div className="mt-3 w-full bg-neutral-50 h-1.5 rounded-full overflow-hidden">
                                                <div className="bg-blue-600 h-full transition-all duration-1000" style={{ width: `${proj.progress || 0}%` }} />
                                            </div>
                                        </div>
                                    ))}
                                    {projects.length === 1 && (
                                        <Link href="/app/projects" className="border-2 border-dashed border-neutral-100 rounded-2xl h-16 flex items-center justify-center group hover:border-dmz-accent transition-all">
                                            <Plus size={16} className="text-neutral-300 group-hover:text-dmz-accent" />
                                        </Link>
                                    )}
                                </div>
                            ) : (
                                <div className="flex-1 flex flex-col justify-center items-center text-center p-8 border-2 border-dashed border-neutral-100 rounded-2xl">
                                    <div className="w-12 h-12 bg-neutral-50 rounded-full flex items-center justify-center mb-4">
                                        <Plus className="text-neutral-300" size={20} />
                                    </div>
                                    <p className="text-sm text-neutral-400 font-medium">Você ainda não possui projetos ativos.</p>
                                    <Link href="/app/projects" className="text-blue-600 text-xs font-bold mt-2 hover:underline tracking-tight uppercase">Configurar Primeiro Projeto</Link>
                                </div>
                            )}
                        </div>

                        <Link href="/app/projects" className="flex items-center justify-between p-4 bg-neutral-50 rounded-2xl group hover:bg-blue-50 transition-colors">
                            <span className="text-sm font-bold text-neutral-700">Ver Gerenciador</span>
                            <ChevronRight size={16} className="text-neutral-400 group-hover:text-blue-600 transition-colors" />
                        </Link>
                    </motion.div>

                    {/* Card 4: History */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="bg-white border border-neutral-100 rounded-[32px] p-8 shadow-sm flex flex-col"
                    >
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 bg-purple-50/50 rounded-xl flex items-center justify-center">
                                <History className="text-purple-600" size={20} />
                            </div>
                            <h3 className="text-xl font-bold text-neutral-900">Histórico</h3>
                        </div>

                        <p className="text-neutral-400 text-sm leading-relaxed mb-auto">
                            Acompanhe o rastro de inteligência do squad. Cada decisão, artefato e report persistido na Memória Sagrada.
                        </p>

                        <div className="mt-8 space-y-3">
                            {[1, 2].map(i => (
                                <div key={i} className="h-4 bg-neutral-50 rounded-full w-full opacity-50" />
                            ))}
                            <div className="h-4 bg-neutral-50 rounded-full w-2/3 opacity-50" />
                        </div>

                        <Link href="/app/memory" className="mt-8 flex items-center justify-between p-4 border border-neutral-100 rounded-2xl group hover:border-purple-200 hover:bg-purple-50/10 transition-all">
                            <span className="text-sm font-bold text-neutral-700">Ver Logs de IA</span>
                            <ChevronRight size={16} className="text-neutral-400 group-hover:text-purple-600 transition-colors" />
                        </Link>
                    </motion.div>

                    {/* Card 5: Chat (Prominent) */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        onClick={() => window.location.href = '/chat'}
                        className="bg-gradient-to-br from-dmz-accent to-orange-600 rounded-[32px] p-8 shadow-xl shadow-dmz-accent/20 flex flex-col group cursor-pointer hover:scale-[1.01] active:scale-[0.99] transition-transform"
                    >
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                                <MessageSquare className="text-white" size={20} />
                            </div>
                            <h3 className="text-xl font-bold text-white">Construa seu projeto</h3>
                        </div>

                        <p className="text-white/80 text-lg font-medium leading-relaxed mb-auto italic">
                            &quot;Apresente seu projeto diretamente com o squad. Os agentes adequados se apresentarão para te ajudar.&quot;
                        </p>

                        <Link
                            href="/chat"
                            onClick={(e) => e.stopPropagation()}
                            className="mt-8 bg-black text-white py-5 rounded-2xl font-black text-center flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl"
                        >
                            <span className="tracking-tight">INICIAR CONVERSA</span>
                            <ArrowRight size={20} />
                        </Link>
                    </motion.div>
                </div>
            </main>
        </div>
    );
}

