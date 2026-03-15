"use client";

import { useState, useEffect, Suspense } from "react";
import { 
    CreditCard, CheckCircle2, ArrowLeft, ShieldCheck, 
    Lock, Zap, Star, Layout, Users, Sparkles,
    Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

// ── Plans Configuration ───────────────────────────────────────────────────────

const PLANS = {
    pro: {
        name: "DMZ Pro",
        price: "R$ 297",
        features: ["Até 5 projetos ativos", "Squads de 12 agentes", "MCP Server Premium", "Relatórios Diários"]
    },
    elite: {
        name: "DMZ Elite",
        price: "R$ 997",
        features: ["Projetos Ilimitados", "Squad Completo (86+ agentes)", "White-label reports", "Suporte Prioritário 24/7"]
    }
};

type PlanKey = keyof typeof PLANS;

function CheckoutContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const planKey = (searchParams.get("plan") || "pro") as PlanKey;
    const plan = PLANS[planKey] || PLANS.pro;

    const [method, setMethod] = useState<"card" | "pix">("card");
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<"idle" | "processing" | "success">("idle");

    const handlePayment = async () => {
        setLoading(true);
        // Simulação de processamento premium
        await new Promise(r => setTimeout(r, 2500));
        setStatus("success");
        setLoading(false);
        
        // Em produção, aqui redirecionaríamos para o Stripe ou geraríamos o Pix real
        setTimeout(() => {
            router.push("/app");
        }, 3000);
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white selection:bg-dmz-accent font-jakarta">
            {/* Dark background particles/mesh could go here */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(232,93,47,0.05),transparent_50%)]" />
            
            <div className="max-w-5xl mx-auto px-6 py-20 relative z-10">
                <Link href="/#pricing" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-neutral-500 hover:text-white mb-12 transition-all group">
                    <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Voltar aos planos
                </Link>

                <div className="grid md:grid-cols-5 gap-12 items-start">
                    
                    {/* Summary Column */}
                    <div className="md:col-span-2 space-y-8">
                        <div className="bg-white/5 border border-white/10 rounded-[40px] p-10 backdrop-blur-xl">
                            <div className="flex items-center gap-3 bg-dmz-accent/10 px-4 py-1.5 rounded-full w-fit mb-6">
                                <Star size={12} className="text-dmz-accent" />
                                <span className="text-[10px] font-black text-dmz-accent uppercase tracking-widest">Upgrade de Conta</span>
                            </div>
                            
                            <h1 className="text-4xl font-black mb-2 tracking-tight">{plan.name}</h1>
                            <div className="flex items-baseline gap-2 mb-8">
                                <span className="text-3xl font-black text-white">{plan.price}</span>
                                <span className="text-neutral-500 text-sm">/mês</span>
                            </div>

                            <div className="space-y-4">
                                {plan.features.map((f, i) => (
                                    <div key={i} className="flex items-center gap-3 text-sm text-neutral-400">
                                        <CheckCircle2 size={16} className="text-dmz-accent shrink-0" />
                                        {f}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="px-6 flex items-center gap-4 text-neutral-500">
                            <ShieldCheck size={24} className="text-neutral-700" />
                            <div>
                                <h4 className="text-xs font-bold text-neutral-300">Pagamento 100% Seguro</h4>
                                <p className="text-[10px] leading-relaxed">Seus dados são criptografados e processados via Stripe & PCI DSS.</p>
                            </div>
                        </div>
                    </div>

                    {/* Payment Column */}
                    <div className="md:col-span-3">
                        <AnimatePresence mode="wait">
                            {status === "idle" ? (
                                <motion.div 
                                    key="form"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="bg-white rounded-[40px] overflow-hidden shadow-2xl shadow-black/50 border border-neutral-100"
                                >
                                    {/* Tabs */}
                                    <div className="flex border-b border-neutral-100">
                                        <button 
                                            onClick={() => setMethod("card")}
                                            className={`flex-1 py-6 text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all ${method === "card" ? 'bg-white text-neutral-900' : 'bg-neutral-50 text-neutral-400 hover:bg-neutral-100'}`}
                                        >
                                            <CreditCard size={16} /> Cartão de Crédito
                                        </button>
                                        <button 
                                            onClick={() => setMethod("pix")}
                                            className={`flex-1 py-6 text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all ${method === "pix" ? 'bg-white text-neutral-900' : 'bg-neutral-50 text-neutral-400 hover:bg-neutral-100'}`}
                                        >
                                            <Zap size={16} className="text-teal-500" /> Pix Instantâneo
                                        </button>
                                    </div>

                                    <div className="p-10 md:p-12">
                                        {method === "card" ? (
                                            <div className="space-y-6">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest px-1">Número do Cartão</label>
                                                    <div className="relative">
                                                        <input disabled className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl py-4 px-5 text-neutral-900 outline-none focus:border-dmz-accent/40 focus:bg-white transition-all shadow-sm" placeholder="0000 0000 0000 0000" />
                                                        <CreditCard className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-300" size={18} />
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest px-1">Validade</label>
                                                        <input disabled className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl py-4 px-5 text-neutral-900 outline-none focus:border-dmz-accent/40 transition-all" placeholder="MM/YY" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest px-1">CVC</label>
                                                        <div className="relative">
                                                            <input disabled className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl py-4 px-5 text-neutral-900 outline-none focus:border-dmz-accent/40 transition-all" placeholder="123" />
                                                            <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-300" size={16} />
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest px-1">Nome no Cartão</label>
                                                    <input disabled className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl py-4 px-5 text-neutral-900 outline-none focus:border-dmz-accent/40 transition-all" placeholder="Como impresso no cartão" />
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center text-center space-y-6">
                                                <div className="w-48 h-48 rounded-3xl overflow-hidden border border-neutral-100 shadow-xl bg-white p-2">
                                                    <img src="/pix-qr.png" alt="Pix QR Code" className="w-full h-full object-cover" />
                                                </div>
                                                <div className="space-y-2">
                                                    <h3 className="text-neutral-900 font-black tracking-tight">Escaneie o QR Code</h3>
                                                    <p className="text-[11px] text-neutral-500 leading-relaxed max-w-[240px]">
                                                        O pagamento é aprovado instantaneamente e você terá acesso ao squad completo.
                                                    </p>
                                                </div>
                                                <div className="w-full bg-neutral-50 border border-dashed border-neutral-300 rounded-2xl p-4 flex items-center justify-between">
                                                    <code className="text-[10px] text-neutral-600 font-mono truncate mr-4">00020101021226850014br.gov.bcb.pix...</code>
                                                    <button className="text-[10px] font-black text-dmz-accent uppercase cursor-pointer hover:opacity-80">Copiar</button>
                                                </div>
                                            </div>
                                        )}

                                        <button
                                            onClick={handlePayment}
                                            disabled={loading}
                                            className="w-full mt-10 bg-neutral-900 text-white py-5 rounded-[24px] font-black uppercase tracking-widest text-[11px] hover:bg-black hover:-translate-y-1 active:scale-[0.98] transition-all shadow-xl shadow-neutral-200 flex items-center justify-center gap-3 disabled:opacity-50"
                                        >
                                            {loading ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} className="text-dmz-accent" />}
                                            Finalizar Pagamento e Ativar Squad
                                        </button>
                                        
                                        <div className="mt-8 flex items-center justify-center gap-6">
                                            <img src="/logo.svg" className="h-4 opacity-10 grayscale" />
                                            <div className="h-4 w-px bg-neutral-100" />
                                            <span className="text-[9px] font-black text-neutral-300 uppercase tracking-widest">Powered by Stripe</span>
                                        </div>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div 
                                    key="success"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="bg-white rounded-[40px] p-12 text-center shadow-2xl border border-neutral-100"
                                >
                                    <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-green-200">
                                        <CheckCircle2 size={40} className="text-white" />
                                    </div>
                                    <h2 className="text-3xl font-black text-neutral-900 mb-4 tracking-tight">Pagamento Aprovado!</h2>
                                    <p className="text-neutral-500 text-sm mb-10 leading-relaxed max-w-sm mx-auto">
                                        Parabéns! Seu squad de <span className="text-neutral-900 font-bold">@dmz-agents</span> está sendo inicializado agora. Prepare-se para a proatividade.
                                    </p>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3 justify-center mb-8">
                                            <div className="flex -space-x-3">
                                                {[1,2,3,4].map(i => <div key={i} className="w-10 h-10 rounded-full bg-neutral-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-neutral-400 animate-pulse">@{i}</div>)}
                                            </div>
                                            <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Inicializando Especialistas...</span>
                                        </div>
                                        <div className="w-full bg-neutral-100 h-1 rounded-full overflow-hidden">
                                            <motion.div initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 2.5 }} className="bg-dmz-accent h-full" />
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function CheckoutPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#050505] flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-dmz-accent border-t-transparent rounded-full animate-spin" />
            </div>
        }>
            <CheckoutContent />
        </Suspense>
    );
}
