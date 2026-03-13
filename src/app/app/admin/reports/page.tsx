"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    ArrowLeft, Save, RotateCcw, Sparkles, AlertCircle,
    CheckCircle2, Loader2, FileText, Mic, Settings,
    Volume2, Sliders, Type
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import AppHeader from "@/components/AppHeader";
import Link from "next/link";

interface ReportsConfig {
    system_prompt: string;
    voice_id: string;
    model_id: string;
    voice_settings: {
        stability: number;
        similarity_boost: number;
        style: number;
        use_speaker_boost: boolean;
        speed?: number;
    };
}

const DEFAULT_CONFIG: ReportsConfig = {
    system_prompt: "Você é um narrador amigável...",
    voice_id: "r2fkFV8WAqXq2AqBpgJT",
    model_id: "eleven_multilingual_v2",
    voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
        style: 0.0,
        use_speaker_boost: true,
        speed: 1.0
    }
};

export default function ReportsAdmin() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
    
    const [config, setConfig] = useState<ReportsConfig>(DEFAULT_CONFIG);
    const [originalConfig, setOriginalConfig] = useState<ReportsConfig>(DEFAULT_CONFIG);

    useEffect(() => {
        document.title = "Configurar Relatórios | DMZ Admin";
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

        await loadConfig();
    }

    async function loadConfig() {
        setLoading(true);
        const { data } = await supabase
            .from("dmz_agents_config")
            .select("value")
            .eq("key", "reports_config")
            .single();

        if (data?.value) {
            const loaded = data.value as ReportsConfig;
            setConfig(loaded);
            setOriginalConfig({ ...loaded });
        }
        setLoading(false);
    }

    async function handleSave() {
        setSaving(true);
        setMessage(null);
        try {
            const { error } = await supabase
                .from("dmz_agents_config")
                .upsert(
                    { key: "reports_config", value: config, updated_at: new Date().toISOString() },
                    { onConflict: "key" }
                );
            if (error) throw error;
            setOriginalConfig({ ...config });
            setMessage({ type: "success", text: "Configurações atualizadas com sucesso!" });
        } catch (err: any) {
            setMessage({ type: "error", text: `Erro ao salvar: ${err.message}` });
        } finally {
            setSaving(false);
        }
    }

    const hasChanged = JSON.stringify(config) !== JSON.stringify(originalConfig);

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
                        subtitle="Relatórios e Voz"
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
                            <h1 className="text-3xl font-black text-neutral-900 tracking-tight">Relatórios & Voz</h1>
                            <p className="text-sm font-medium text-neutral-400">Configure a narrativa e os parâmetros da ElevenLabs.</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Narrative Section */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white border border-neutral-100 rounded-[40px] p-8 shadow-sm">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2.5 bg-pink-50 text-pink-500 rounded-xl">
                                    <Type size={20} />
                                </div>
                                <h3 className="font-black text-neutral-900">Prompt do Sistema (Storytelling)</h3>
                            </div>
                            
                            <textarea
                                value={config.system_prompt}
                                onChange={e => setConfig({ ...config, system_prompt: e.target.value })}
                                placeholder="Descreva como o squad deve narrar o relatório..."
                                className="w-full h-80 p-6 bg-neutral-50 border border-neutral-100 rounded-3xl text-sm font-medium leading-relaxed resize-none focus:ring-0 focus:border-dmz-accent/20 transition-all outline-none text-neutral-800 mb-4"
                            />
                            <div className="flex items-center gap-2 text-[10px] text-neutral-400 font-bold bg-neutral-50 p-4 rounded-2xl border border-neutral-100 italic">
                                Use {'{user_first_name}'} e {'{date_str}'} como variáveis dinâmicas.
                            </div>
                        </div>
                    </div>

                    {/* ElevenLabs Settings */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white border border-neutral-100 rounded-[40px] p-8 shadow-sm h-full flex flex-col">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="p-2.5 bg-blue-50 text-blue-500 rounded-xl">
                                    <Mic size={20} />
                                </div>
                                <h3 className="font-black text-neutral-900">Parâmetros ElevenLabs</h3>
                            </div>

                            <div className="space-y-6 flex-grow">
                                <div>
                                    <label className="text-[10px] font-black uppercase text-neutral-400 tracking-widest block mb-2">Voice ID</label>
                                    <input
                                        type="text"
                                        value={config.voice_id}
                                        onChange={e => setConfig({ ...config, voice_id: e.target.value })}
                                        className="w-full px-4 py-3 bg-neutral-50 border border-neutral-100 rounded-2xl text-xs font-bold text-neutral-700 outline-none focus:border-dmz-accent/30 transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="text-[10px] font-black uppercase text-neutral-400 tracking-widest block mb-2">Stability ({config.voice_settings.stability})</label>
                                    <input
                                        type="range"
                                        min="0"
                                        max="1"
                                        step="0.05"
                                        value={config.voice_settings.stability}
                                        onChange={e => setConfig({ 
                                            ...config, 
                                            voice_settings: { ...config.voice_settings, stability: parseFloat(e.target.value) } 
                                        })}
                                        className="w-full accent-dmz-accent"
                                    />
                                    <div className="flex justify-between mt-1">
                                        <span className="text-[9px] text-neutral-300 font-bold uppercase">Mais Variável</span>
                                        <span className="text-[9px] text-neutral-300 font-bold uppercase">Mais Estável</span>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] font-black uppercase text-neutral-400 tracking-widest block mb-2">Similarity Boost ({config.voice_settings.similarity_boost})</label>
                                    <input
                                        type="range"
                                        min="0"
                                        max="1"
                                        step="0.05"
                                        value={config.voice_settings.similarity_boost}
                                        onChange={e => setConfig({ 
                                            ...config, 
                                            voice_settings: { ...config.voice_settings, similarity_boost: parseFloat(e.target.value) } 
                                        })}
                                        className="w-full accent-dmz-accent"
                                    />
                                    <div className="flex justify-between mt-1 text-[9px] text-neutral-300 font-bold uppercase">
                                        <span>Menos Real</span>
                                        <span>Mais Realismo</span>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] font-black uppercase text-neutral-400 tracking-widest block mb-1">Velocidade ({config.voice_settings.speed || 1.0})</label>
                                    <input
                                        type="range"
                                        min="0.5"
                                        max="2"
                                        step="0.1"
                                        value={config.voice_settings.speed || 1.0}
                                        onChange={e => setConfig({ 
                                            ...config, 
                                            voice_settings: { ...config.voice_settings, speed: parseFloat(e.target.value) } 
                                        })}
                                        className="w-full accent-dmz-accent"
                                    />
                                    <div className="flex justify-between mt-1 text-[9px] text-neutral-300 font-bold uppercase">
                                        <span>Devagar</span>
                                        <span>Rápido</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3 mt-10">
                                <button
                                    onClick={handleSave}
                                    disabled={!hasChanged || saving}
                                    className="w-full bg-dmz-accent text-white py-4 rounded-2xl font-bold text-sm shadow-xl shadow-dmz-accent/20 hover:bg-orange-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                                >
                                    {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                                    Salvar Alterações
                                </button>
                                <button
                                    onClick={() => setConfig({ ...originalConfig })}
                                    disabled={!hasChanged || saving}
                                    className="w-full bg-neutral-50 text-neutral-400 py-3 rounded-2xl font-bold text-xs hover:bg-neutral-100 transition-all disabled:opacity-30 cursor-pointer"
                                >
                                    Descartar Alterações
                                </button>
                            </div>
                        </div>
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
