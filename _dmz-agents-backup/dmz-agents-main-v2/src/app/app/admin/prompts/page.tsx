"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    ArrowLeft, Save, RotateCcw, Sparkles, AlertCircle,
    CheckCircle2, Loader2, Bot, Code2, FileText,
    Image as ImageIcon, Mic, Globe
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import AppHeader from "@/components/AppHeader";
import Link from "next/link";

const SYSTEM_PROMPTS = [
    { id: "orchestrator", label: "Prompt Mestre (Orchestrator)", category: "Chat", icon: Bot },
    { id: "voice_transcription", label: "Instruções de Áudio", category: "Chat", icon: Mic },
    { id: "tool_create_image", label: "Gerador de Imagem", category: "Ferramentas", icon: ImageIcon },
    { id: "tool_search_web", label: "Deep Web Research", category: "Ferramentas", icon: Globe },
    { id: "tool_write_code", label: "Especialista em Código", category: "Ferramentas", icon: Code2 },
    { id: "attachment_pdf", label: "Manipulação de PDF", category: "Anexos", icon: FileText },
    { id: "attachment_image", label: "Visão Computacional (Imagens)", category: "Anexos", icon: ImageIcon },
    { id: "attachment_audio", label: "Análise de Arquivos de Áudio", category: "Anexos", icon: Mic },
];

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

        await loadPrompts();
    }

    async function loadPrompts() {
        setLoading(true);
        const { data } = await supabase
            .from("dmz_agents_prompts")
            .select("agent_id, content")
            .in("agent_id", SYSTEM_PROMPTS.map(p => p.id));

        const map: Record<string, string> = {};
        if (data) data.forEach(p => (map[p.agent_id] = p.content));
        SYSTEM_PROMPTS.forEach(sp => { if (!map[sp.id]) map[sp.id] = ""; });

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
                    { agent_id: selectedId, content: prompts[selectedId], version: 1, active: true, updated_at: new Date().toISOString() },
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
    const selected = SYSTEM_PROMPTS.find(p => p.id === selectedId);
    const SelectedIcon = selected?.icon ?? Bot;

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-white">
                <Loader2 className="w-8 h-8 text-dmz-accent animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FDFDFD] font-jakarta">
            {/* Header — padrão das páginas internas */}
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
                {/* Page Title */}
                <div className="flex items-center gap-4 mb-10">
                    <Link href="/app/admin" className="p-2 hover:bg-neutral-100 rounded-xl text-neutral-400 transition-all">
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-black text-neutral-900 tracking-tight">Prompts do Chat</h1>
                        <p className="text-sm font-medium text-neutral-400">Configure o comportamento core da inteligência.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white border border-neutral-100 rounded-[32px] p-4 flex flex-col gap-1">
                            {["Chat", "Ferramentas", "Anexos"].map(category => (
                                <div key={category} className="mb-4 last:mb-0">
                                    <div className="px-4 py-2 text-[10px] font-black text-neutral-300 uppercase tracking-widest">
                                        {category}
                                    </div>
                                    {SYSTEM_PROMPTS.filter(p => p.category === category).map(p => {
                                        const Icon = p.icon;
                                        return (
                                            <button
                                                key={p.id}
                                                onClick={() => { setSelectedId(p.id); setMessage(null); }}
                                                className={cn(
                                                    "w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all text-left cursor-pointer",
                                                    selectedId === p.id
                                                        ? "bg-dmz-accent text-white shadow-lg shadow-dmz-accent/20"
                                                        : "text-neutral-500 hover:bg-neutral-50"
                                                )}
                                            >
                                                <Icon size={16} />
                                                {p.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>

                        <div className="p-6 bg-neutral-900 rounded-[32px] text-white">
                            <Sparkles className="text-orange-400 mb-4" size={24} />
                            <h4 className="text-xs font-black uppercase tracking-widest mb-2">Dica de Engenharia</h4>
                            <p className="text-[11px] leading-relaxed text-white/60 font-medium">
                                Use o prompt para definir o tom, restrições e comportamento do agente. Cada prompt é carregado dinamicamente a cada mensagem.
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
                                        <SelectedIcon size={24} />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-black text-neutral-900">{selected?.label}</h2>
                                        <p className="text-xs text-neutral-400 font-medium">ID: {selectedId}</p>
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
        </div>
    );
}
