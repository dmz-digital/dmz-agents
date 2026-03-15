"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    ArrowLeft, Save, RotateCcw, Sparkles, AlertCircle,
    CheckCircle2, Loader2, FileText, Mic, Settings,
    Volume2, Sliders, Type, MessageSquare
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import AppHeader from "@/components/AppHeader";
import Link from "next/link";

interface TelegramReportConfig {
    system_prompt: string;
}

export default function TelegramPromptsAdmin() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
    
    const [prompt, setPrompt] = useState<string>("");
    const [originalPrompt, setOriginalPrompt] = useState<string>("");

    useEffect(() => {
        document.title = "Prompt Telegram | DMZ Admin";
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

        await loadPrompt();
    }

    async function loadPrompt() {
        setLoading(true);
        // We use the dmz_agents_prompts table now
        const { data } = await supabase
            .from("dmz_agents_prompts")
            .select("content")
            .eq("agent_id", "yvi_telegram_report")
            .single();

        if (data?.content) {
            setPrompt(data.content);
            setOriginalPrompt(data.content);
        }
        setLoading(false);
    }

    async function handleSave() {
        setSaving(true);
        setMessage(null);
        try {
            const { error } = await supabase
                .from("dmz_agents_prompts")
                .upsert(
                    { agent_id: "yvi_telegram_report", content: prompt, version: 1, active: true },
                    { onConflict: "agent_id" }
                );
            if (error) throw error;
            setOriginalPrompt(prompt);
            setMessage({ type: "success", text: "Prompt do Telegram atualizado com sucesso!" });
        } catch (err: any) {
            setMessage({ type: "error", text: `Erro ao salvar: ${err.message}` });
        } finally {
            setSaving(false);
        }
    }

    const hasChanged = prompt !== originalPrompt;

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
                        subtitle="Prompt Telegram (Yvi)"
                        showButtons={false}
                    />
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-8 py-8">
                <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-4">
                        <Link href="/app/admin" className="p-2 hover:bg-neutral-100 rounded-xl text-neutral-400 transition-all">
                            <ArrowLeft size={20} />
                        </Link>
                        <div>
                            <h1 className="text-3xl font-black text-neutral-900 tracking-tight">Prompt Telegram (Yvi)</h1>
                            <p className="text-sm font-medium text-neutral-400">Gerencie a narrativa e o comportamento da Yvi no Telegram.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setPrompt(originalPrompt)}
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

                <div className="grid grid-cols-1 gap-8">
                    <div className="bg-white border border-neutral-100 rounded-[40px] p-8 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2.5 bg-dmz-accent/10 text-dmz-accent rounded-xl">
                                <MessageSquare size={20} />
                            </div>
                            <h3 className="font-black text-neutral-900">System Prompt (Yvi Telegram)</h3>
                        </div>
                        
                        <textarea
                            value={prompt}
                            onChange={e => setPrompt(e.target.value)}
                            placeholder="Escreva o prompt mestre da Yvi para o Telegram..."
                            className="w-full h-[500px] p-8 bg-neutral-50 border border-neutral-100 rounded-3xl text-sm font-medium leading-relaxed resize-none focus:ring-0 focus:border-dmz-accent/20 transition-all outline-none text-neutral-800"
                        />
                    </div>
                </div>

                <AnimatePresence>
                    {message && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className={`mt-8 p-5 rounded-[28px] flex items-center gap-4 ${message.type === "success"
                                ? "bg-green-50 text-green-700 border border-green-100"
                                : "bg-red-50 text-red-700 border border-red-100"
                                }`}
                        >
                            {message.type === "success" ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
                            <span className="text-sm font-bold">{message.text}</span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}
