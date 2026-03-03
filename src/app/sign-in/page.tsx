"use client";

import { useState } from "react";
import Link from "next/link";
import { Bot, Mail, Lock, ArrowRight, Chrome } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SignInPage() {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Simulate login
        setTimeout(() => {
            setLoading(false);
            router.push("/app/agents");
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-dmz-bg flex items-center justify-center p-6 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-orange-100/20 via-transparent to-transparent">

            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="flex flex-col items-center mb-10">
                    <div className="w-16 h-16 bg-white border border-neutral-100 shadow-xl rounded-2xl flex items-center justify-center mb-6">
                        <Bot size={32} className="text-dmz-accent" strokeWidth={1.5} />
                    </div>
                    <h1 className="text-3xl font-black tracking-tight text-neutral-900 mb-2">Bem-vindo de volta</h1>
                    <p className="text-sm text-neutral-500 font-medium">O seu squad de agentes está aguardando você.</p>
                </div>

                {/* Card */}
                <div className="bg-white border border-neutral-100 shadow-2xl shadow-neutral-200/50 rounded-[32px] p-10">

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest px-1">Usuário / Email</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300" size={18} />
                                <input
                                    type="text"
                                    required
                                    placeholder="Seu email ou username"
                                    className="w-full bg-neutral-50 border-none rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-dmz-accent/20 transition-all outline-none"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between px-1">
                                <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest">Senha</label>
                                <Link href="/forgot-password" size={11} className="text-[11px] font-bold text-dmz-accent hover:underline">Esqueceu a senha?</Link>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300" size={18} />
                                <input
                                    type="password"
                                    required
                                    placeholder="••••••••"
                                    className="w-full bg-neutral-50 border-none rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-dmz-accent/20 transition-all outline-none"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-dmz-accent text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-orange-500 transition-all shadow-xl shadow-dmz-accent/20 disabled:opacity-50"
                        >
                            {loading ? "Entrando..." : (
                                <>Entrar no Dashboard <ArrowRight size={18} /></>
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="flex items-center gap-4 my-8">
                        <div className="flex-1 h-px bg-neutral-100" />
                        <span className="text-[10px] font-black text-neutral-300 uppercase tracking-widest">Ou continue com</span>
                        <div className="flex-1 h-px bg-neutral-100" />
                    </div>

                    <button className="w-full bg-white border border-neutral-200 py-3.5 rounded-2xl font-bold text-neutral-600 flex items-center justify-center gap-3 hover:bg-neutral-50 transition-all">
                        <div className="w-5 h-5 flex items-center justify-center">
                            <Chrome size={18} />
                        </div>
                        Entrar com Google
                    </button>
                </div>

                <p className="text-center mt-8 text-sm text-neutral-500">
                    Não tem uma conta? <Link href="/sign-up" className="text-dmz-accent font-bold hover:underline">Cadastre-se</Link>
                </p>
            </div>
        </div>
    );
}
