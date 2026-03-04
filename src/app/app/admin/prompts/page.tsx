"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    ArrowLeft, Save, RotateCcw, Sparkles, AlertCircle,
    CheckCircle2, Loader2, Bot, Code2, FileText,
    Image as ImageIcon, Mic, Globe, Search, Users,
    ShieldCheck, Paintbrush, Music2, Activity, Layers,
    Target, Zap, BookOpen, Brain, Scale
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import AppHeader from "@/components/AppHeader";
import Link from "next/link";

// Category icon and color mappings
const CAT_ICONS: Record<string, any> = {
    Orchestration: Bot, Product: Target, Development: Code2,
    Security: ShieldCheck, Strategy: Brain, Design: Paintbrush,
    Copy: BookOpen, Frameworks: Layers, Data: Activity,
    Marketing: Zap, Sales: Scale, Chat: Mic
};

const CAT_COLORS: Record<string, string> = {
    Orchestration: "#E85D2F", Product: "#2563EB", Development: "#0891B2",
    Security: "#DC2626", Strategy: "#D97706", Design: "#DB2777",
    Copy: "#7C3AED", Frameworks: "#475569", Data: "#0369A1",
    Marketing: "#059669", Sales: "#10B981", Chat: "#E85D2F"
};

// Fixed system prompts that are not agents but tools/system
const SYSTEM_PROMPT_IDS = [
    "system_formatting", "voice_transcription", "tool_create_image",
    "tool_search_web", "tool_write_code", "attachment_pdf",
    "attachment_image", "attachment_audio"
];

interface AgentDef {
    id: string;
    name: string;
    handle: string;
    category: string;
}

function cn(...args: (string | boolean | undefined | null)[]) {
    return args.filter(Boolean).join(" ");
}

export default function PromptsAdmin() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
    const [selectedId, setSelectedId] = useState("orchestrator");
    const [prompts, setPrompts] = useState<Record<string, string>>({});
    const [originalPrompts, setOriginalPrompts] = useState<Record<string, string>>({});
    const [agents, setAgents] = useState<AgentDef[]>([]);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        document.title = "Editar Prompts | DMZ Admin";
        checkAdminAndLoad();
    }, []);

    async function checkAdminAndLoad() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { router.push("/sign-in"); return; }

        const { data: profile } = await supabase
            .from("user_profiles")
            .select("is_admin")
            .eq("id", user.id)
            .single();

        if (!profile?.is_admin) { router.push("/app"); return; }

        await loadAll();
    }

    async function loadAll() {
        setLoading(true);

        // Load all agents from DB dynamically
        const { data: agentsDefs } = await supabase
            .from("dmz_agents_definitions")
            .select("id, name, handle, category")
            .order("category")
            .order("name");

        const allAgents: AgentDef[] = agentsDefs || [];
        setAgents(allAgents);

        // Load all prompts
        const { data: promptsData } = await supabase
            .from("dmz_agents_prompts")
            .select("agent_id, content");

        const map: Record<string, string> = {};
        if (promptsData) promptsData.forEach(p => (map[p.agent_id] = p.content || ""));
        // Ensure all agents have an entry (even if empty)
        allAgents.forEach(a => { if (!map[a.id]) map[a.id] = ""; });

        setPrompts(map);
        setOriginalPrompts({ ...map });
        setLoading(false);
    }

    async function handleSave() {
        setSaving(true);
        setMessage(null);
        try {
            const { error } = await supabase
                .from("dmz_agents_prompts")
                .upsert(
                    { agent_id: selectedId, content: prompts[selectedId], version: 1, active: true },
                    { onConflict: "agent_id" }
                );
            if (error) throw error;
            setOriginalPrompts(prev => ({ ...prev, [selectedId]: prompts[selectedId] }));
            setMessage({ type: "success", text: "Prompt atualizado com sucesso!" });
        } catch (err: any) {
            setMessage({ type: "error", text: `Erro ao salvar: ${err.message}` });
        } finally {
            setSaving(false);
        }
    }

    const hasChanged = prompts[selectedId] !== originalPrompts[selectedId];
    const selectedAgent = agents.find(a => a.id === selectedId);
    const isSystem = SYSTEM_PROMPT_IDS.includes(selectedId);

    // Group agents by category
    const categories = Array.from(new Set(agents.map(a => a.category))).sort();

    // Filter by search
    const matchesSearch = (a: AgentDef) =>
        !searchQuery ||
        a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.handle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.id.toLowerCase().includes(searchQuery.toLowerCase());

    // Count prompts that are populated vs empty
    const totalAgents = agents.length;
    const populatedCount = agents.filter(a => (prompts[a.id] || "").length > 0).length;

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-white">
                <Loader2 className="w-8 h-8 text-dmz-accent animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FDFDFD] font-jakarta">
            <header className="px-8 pt-10 pb-4">
                <div className="max-w-7xl mx-auto">
                    <AppHeader
                        title="DMZ – OS Agents"
                        subtitle="Manage your squad specialists"
                        showButtons={false}
                    />
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-8 py-8">
                {/* Page Title + Stats */}
                <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-4">
                        <Link href="/app/admin" className="p-2 hover:bg-neutral-100 rounded-xl text-neutral-400 transition-all">
                            <ArrowLeft size={20} />
                        </Link>
                        <div>
                            <h1 className="text-3xl font-black text-neutral-900 tracking-tight">Prompts do Chat</h1>
                            <p className="text-sm font-medium text-neutral-400">Configure o comportamento core da inteligência.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="bg-white border border-neutral-100 rounded-2xl px-4 py-2.5 flex items-center gap-2">
                            <Users size={14} className="text-neutral-400" />
                            <span className="text-xs font-bold text-neutral-700">{populatedCount}/{totalAgents}</span>
                            <span className="text-[10px] text-neutral-400 font-medium">configurados</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar */}
                    <div className="lg:col-span-1 space-y-4">
                        {/* Search */}
                        <div className="relative">
                            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300" />
                            <input
                                type="text"
                                placeholder="Buscar agente..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-white border border-neutral-100 rounded-2xl text-xs font-medium text-neutral-700 outline-none focus:border-dmz-accent/30 transition-all placeholder:text-neutral-300"
                            />
                        </div>

                        {/* Agent List */}
                        <div className="bg-white border border-neutral-100 rounded-[32px] p-3 flex flex-col gap-0.5 max-h-[65vh] overflow-y-auto custom-scrollbar">
                            {categories.map(category => {
                                const catAgents = agents.filter(a => a.category === category && matchesSearch(a));
                                if (catAgents.length === 0) return null;
                                const CatIcon = CAT_ICONS[category] || Bot;
                                const catColor = CAT_COLORS[category] || "#475569";

                                return (
                                    <div key={category} className="mb-3 last:mb-0">
                                        <div className="px-3 py-1.5 text-[9px] font-black text-neutral-300 uppercase tracking-widest flex items-center gap-1.5">
                                            <CatIcon size={10} style={{ color: catColor }} />
                                            {category}
                                            <span className="text-neutral-200 font-medium ml-auto">{catAgents.length}</span>
                                        </div>
                                        {catAgents.map(a => {
                                            const hasPrompt = (prompts[a.id] || "").length > 0;
                                            return (
                                                <button
                                                    key={a.id}
                                                    onClick={() => { setSelectedId(a.id); setMessage(null); }}
                                                    className={cn(
                                                        "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[11px] font-bold transition-all text-left cursor-pointer",
                                                        selectedId === a.id
                                                            ? "bg-dmz-accent text-white shadow-lg shadow-dmz-accent/20"
                                                            : "text-neutral-500 hover:bg-neutral-50"
                                                    )}
                                                >
                                                    <span className={cn(
                                                        "w-1.5 h-1.5 rounded-full flex-shrink-0",
                                                        hasPrompt ? "bg-green-400" : "bg-neutral-200",
                                                        selectedId === a.id && hasPrompt && "bg-white",
                                                        selectedId === a.id && !hasPrompt && "bg-white/40"
                                                    )} />
                                                    <span className="truncate">{a.name}</span>
                                                    <span className={cn(
                                                        "text-[9px] font-mono ml-auto",
                                                        selectedId === a.id ? "text-white/60" : "text-neutral-300"
                                                    )}>@{a.handle}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                );
                            })}
                        </div>

                        <div className="p-5 bg-neutral-900 rounded-[28px] text-white">
                            <Sparkles className="text-orange-400 mb-3" size={20} />
                            <h4 className="text-[10px] font-black uppercase tracking-widest mb-1.5">Dica de Engenharia</h4>
                            <p className="text-[10px] leading-relaxed text-white/60 font-medium">
                                Cada prompt é carregado do banco a cada mensagem. Nenhum fallback hardcoded existe — configure todos os agentes aqui.
                            </p>
                        </div>
                    </div>

                    {/* Main Editor */}
                    <div className="lg:col-span-3 space-y-6">
                        <div className="bg-white border border-neutral-100 rounded-[40px] p-10 shadow-sm relative overflow-hidden">
                            {/* Editor Header */}
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-neutral-50 rounded-2xl flex items-center justify-center text-neutral-900">
                                        <Bot size={24} />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-black text-neutral-900">
                                            {selectedAgent?.name || selectedId}
                                        </h2>
                                        <p className="text-xs text-neutral-400 font-medium">
                                            ID: {selectedId}
                                            {selectedAgent && <span className="ml-2 text-neutral-300">• @{selectedAgent.handle} • {selectedAgent.category}</span>}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => setPrompts(prev => ({ ...prev, [selectedId]: originalPrompts[selectedId] }))}
                                        disabled={!hasChanged || saving}
                                        className="p-3 hover:bg-neutral-50 rounded-2xl text-neutral-400 transition-all disabled:opacity-30 cursor-pointer"
                                        title="Descartar Alterações"
                                    >
                                        <RotateCcw size={20} />
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        disabled={!hasChanged || saving}
                                        className="bg-dmz-accent text-white px-8 py-3.5 rounded-2xl font-bold text-sm shadow-xl shadow-dmz-accent/20 hover:bg-orange-600 transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                                    >
                                        {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                                        Salvar Prompt
                                    </button>
                                </div>
                            </div>

                            {/* Textarea */}
                            <div className="relative">
                                <textarea
                                    value={prompts[selectedId] ?? ""}
                                    onChange={e => setPrompts(prev => ({ ...prev, [selectedId]: e.target.value }))}
                                    placeholder="Escreva as instruções para a IA..."
                                    className="w-full h-[480px] p-8 bg-[#F9FAFB] border border-neutral-100 rounded-3xl text-sm font-medium leading-relaxed resize-none focus:ring-0 focus:border-dmz-accent/20 transition-all outline-none text-neutral-800"
                                />
                                {hasChanged && !saving && (
                                    <div className="absolute top-4 right-4 bg-orange-500 text-white text-[9px] font-black uppercase px-2 py-1 rounded-md animate-pulse">
                                        Não Salvo
                                    </div>
                                )}
                                {!(prompts[selectedId] || "").trim() && (
                                    <div className="absolute bottom-4 left-8 bg-amber-50 text-amber-700 border border-amber-100 text-[10px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                                        <AlertCircle size={12} />
                                        Prompt vazio — configure antes de usar este agente
                                    </div>
                                )}
                            </div>

                            {/* Feedback */}
                            <AnimatePresence>
                                {message && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        className={`mt-6 p-4 rounded-2xl flex items-center gap-3 ${message.type === "success"
                                            ? "bg-green-50 text-green-700 border border-green-100"
                                            : "bg-red-50 text-red-700 border border-red-100"
                                            }`}
                                    >
                                        {message.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                                        <span className="text-sm font-bold">{message.text}</span>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </main>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #E5E5E5; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #D1D5DB; }
            `}</style>
        </div>
    );
}
