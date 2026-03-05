"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    ArrowLeft, Cpu, Save, Check, RefreshCw,
    MessageSquare, Image, Mic, GitBranch, Sparkles, Wrench
} from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import AppHeader from "@/components/AppHeader";
import Link from "next/link";

interface AIModel {
    id: string;
    purpose: string;
    model_id: string;
    provider: string;
    display_name: string;
    description: string;
    active: boolean;
    config: Record<string, unknown>;
    updated_at: string;
}

const PURPOSE_META: Record<string, { label: string; icon: React.ElementType; color: string }> = {
    chat: { label: "Chat Principal", icon: MessageSquare, color: "bg-blue-500" },
    chat_fallback: { label: "Chat Fallback", icon: RefreshCw, color: "bg-slate-500" },
    image_generation: { label: "Geração de Imagens", icon: Image, color: "bg-pink-500" },
    transcription: { label: "Transcrição de Áudio", icon: Mic, color: "bg-green-500" },
    routing: { label: "Roteamento de Agentes", icon: GitBranch, color: "bg-purple-500" },
    prompt_engineering: { label: "Engenharia de Prompts", icon: Sparkles, color: "bg-amber-500" },
};

export default function AdminModelsPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [models, setModels] = useState<AIModel[]>([]);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editValues, setEditValues] = useState<Partial<AIModel>>({});
    const [saving, setSaving] = useState<string | null>(null);
    const [saved, setSaved] = useState<string | null>(null);

    useEffect(() => {
        document.title = "Modelos de IA | Admin | DMZ";
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

        await loadModels();
        setLoading(false);
    }

    async function loadModels() {
        const { data } = await supabase
            .from("admin_system_models")
            .select("*")
            .order("purpose");
        if (data) setModels(data);
    }

    function startEdit(model: AIModel) {
        setEditingId(model.id);
        setEditValues({
            model_id: model.model_id,
            provider: model.provider,
            display_name: model.display_name,
            description: model.description,
            active: model.active,
        });
    }

    async function saveModel(id: string) {
        setSaving(id);
        const { error } = await supabase
            .from("admin_system_models")
            .update({
                ...editValues,
                updated_at: new Date().toISOString(),
            })
            .eq("id", id);

        if (!error) {
            setSaved(id);
            setEditingId(null);
            await loadModels();
            setTimeout(() => setSaved(null), 2000);
        }
        setSaving(null);
    }

    async function toggleActive(model: AIModel) {
        await supabase
            .from("admin_system_models")
            .update({ active: !model.active, updated_at: new Date().toISOString() })
            .eq("id", model.id);
        await loadModels();
    }

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
            <header className="px-8 pt-10 pb-4">
                <div className="max-w-5xl mx-auto">
                    <AppHeader title="DMZ – OS Agents" subtitle="Manage your squad specialists" showButtons={false} />
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-8 py-8">
                <div className="flex items-center gap-4 mb-10">
                    <Link href="/app/admin" className="p-2 hover:bg-neutral-100 rounded-xl text-neutral-400 transition-all">
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <div className="bg-emerald-50 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                                <Cpu size={10} className="text-emerald-600" />
                                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Admin</span>
                            </div>
                        </div>
                        <h1 className="text-3xl font-black text-neutral-900 tracking-tight">Modelos de IA</h1>
                        <p className="text-sm text-neutral-400 font-medium mt-1">Configure os modelos utilizados em cada funcionalidade do sistema.</p>
                    </div>
                </div>

                <div className="space-y-4">
                    {models.map((model, idx) => {
                        const meta = PURPOSE_META[model.purpose] || { label: model.purpose, icon: Wrench, color: "bg-neutral-500" };
                        const Icon = meta.icon;
                        const isEditing = editingId === model.id;
                        const isSaved = saved === model.id;

                        return (
                            <motion.div
                                key={model.id}
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className={`bg-white border rounded-2xl p-6 transition-all ${isEditing ? "border-emerald-300 shadow-lg shadow-emerald-500/5" :
                                        isSaved ? "border-green-300" :
                                            "border-neutral-100 hover:border-neutral-200"
                                    } ${!model.active ? "opacity-50" : ""}`}
                            >
                                <div className="flex items-start gap-4">
                                    <div className={`w-11 h-11 ${meta.color} text-white rounded-xl flex items-center justify-center shrink-0 shadow-md`}>
                                        <Icon size={20} />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-1">
                                            <h3 className="text-base font-black text-neutral-900">{meta.label}</h3>
                                            <span className="text-[9px] font-bold text-neutral-300 uppercase tracking-wider bg-neutral-50 px-2 py-0.5 rounded-full">
                                                {model.purpose}
                                            </span>
                                            {!model.active && (
                                                <span className="text-[9px] font-bold text-red-400 uppercase tracking-wider bg-red-50 px-2 py-0.5 rounded-full">
                                                    Inativo
                                                </span>
                                            )}
                                        </div>

                                        {isEditing ? (
                                            <div className="space-y-3 mt-3">
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div>
                                                        <label className="text-[10px] font-black text-neutral-400 uppercase tracking-wider mb-1 block">Model ID</label>
                                                        <input
                                                            value={editValues.model_id || ""}
                                                            onChange={(e) => setEditValues({ ...editValues, model_id: e.target.value })}
                                                            className="w-full px-3 py-2 text-sm font-mono font-bold border border-neutral-200 rounded-xl focus:outline-none focus:border-emerald-400 bg-neutral-50"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] font-black text-neutral-400 uppercase tracking-wider mb-1 block">Provider</label>
                                                        <select
                                                            value={editValues.provider || "google"}
                                                            onChange={(e) => setEditValues({ ...editValues, provider: e.target.value })}
                                                            className="w-full px-3 py-2 text-sm font-bold border border-neutral-200 rounded-xl focus:outline-none focus:border-emerald-400 bg-neutral-50"
                                                        >
                                                            <option value="google">Google (Gemini)</option>
                                                            <option value="anthropic">Anthropic (Claude)</option>
                                                            <option value="openai">OpenAI (GPT)</option>
                                                        </select>
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="text-[10px] font-black text-neutral-400 uppercase tracking-wider mb-1 block">Nome de Exibição</label>
                                                    <input
                                                        value={editValues.display_name || ""}
                                                        onChange={(e) => setEditValues({ ...editValues, display_name: e.target.value })}
                                                        className="w-full px-3 py-2 text-sm font-bold border border-neutral-200 rounded-xl focus:outline-none focus:border-emerald-400 bg-neutral-50"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] font-black text-neutral-400 uppercase tracking-wider mb-1 block">Descrição</label>
                                                    <input
                                                        value={editValues.description || ""}
                                                        onChange={(e) => setEditValues({ ...editValues, description: e.target.value })}
                                                        className="w-full px-3 py-2 text-sm font-medium border border-neutral-200 rounded-xl focus:outline-none focus:border-emerald-400 bg-neutral-50"
                                                    />
                                                </div>
                                                <div className="flex items-center gap-3 pt-2">
                                                    <button
                                                        onClick={() => saveModel(model.id)}
                                                        disabled={saving === model.id}
                                                        className="flex items-center gap-2 px-5 py-2 bg-emerald-500 text-white text-xs font-black uppercase tracking-wider rounded-xl hover:bg-emerald-600 transition-all disabled:opacity-50"
                                                    >
                                                        {saving === model.id ? (
                                                            <RefreshCw size={14} className="animate-spin" />
                                                        ) : (
                                                            <Save size={14} />
                                                        )}
                                                        Salvar
                                                    </button>
                                                    <button
                                                        onClick={() => setEditingId(null)}
                                                        className="px-5 py-2 text-xs font-black uppercase tracking-wider text-neutral-400 hover:text-neutral-600 transition-colors"
                                                    >
                                                        Cancelar
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <code className="text-sm font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
                                                        {model.model_id}
                                                    </code>
                                                    <span className="text-[10px] font-bold text-neutral-300 uppercase">
                                                        {model.provider}
                                                    </span>
                                                </div>
                                                {model.description && (
                                                    <p className="text-xs text-neutral-400 font-medium mt-2">{model.description}</p>
                                                )}
                                            </>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0">
                                        {isSaved && (
                                            <div className="flex items-center gap-1 text-green-500">
                                                <Check size={14} />
                                                <span className="text-[10px] font-bold">Salvo</span>
                                            </div>
                                        )}
                                        {!isEditing && (
                                            <>
                                                <button
                                                    onClick={() => toggleActive(model)}
                                                    className={`w-10 h-5 rounded-full transition-all relative ${model.active ? "bg-emerald-500" : "bg-neutral-200"}`}
                                                >
                                                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${model.active ? "left-5" : "left-0.5"}`} />
                                                </button>
                                                <button
                                                    onClick={() => startEdit(model)}
                                                    className="px-4 py-2 text-[10px] font-black uppercase tracking-wider text-neutral-400 border border-neutral-100 rounded-xl hover:border-neutral-300 hover:text-neutral-600 transition-all"
                                                >
                                                    Editar
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Info Footer */}
                <div className="mt-8 p-6 bg-neutral-50 rounded-2xl border border-neutral-100">
                    <div className="flex items-start gap-3">
                        <Cpu size={18} className="text-neutral-300 mt-0.5 shrink-0" />
                        <div>
                            <p className="text-xs font-bold text-neutral-500 mb-1">Como funciona</p>
                            <p className="text-xs text-neutral-400 leading-relaxed">
                                O backend consulta esta tabela para determinar qual modelo usar em cada operação.
                                Altere o <code className="font-mono bg-neutral-100 px-1 rounded">Model ID</code> para trocar o modelo sem precisar alterar código.
                                Modelos inativos usarão o fallback padrão.
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
