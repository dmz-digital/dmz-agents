"use client";

import { useState } from "react";
import Link from "next/link";
import { Bot, Mail, ArrowRight, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
    const [sent, setSent] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            setSent(true);
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-dmz-bg flex items-center justify-center p-6 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-orange-50/30 via-transparent to-transparent">

            <div className="w-full max-w-md">
                <div className="bg-white border border-neutral-100 shadow-2xl rounded-[40px] p-10 md:p-14">
                    {!sent ? (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex justify-center mb-8">
                                <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center">
                                    <Mail size={32} className="text-dmz-accent" strokeWidth={1.5} />
                                </div>
                            </div>

                            <h1 className="text-3xl font-black text-neutral-900 mb-3 tracking-tight text-center">Recuperar senha</h1>
                            <p className="text-sm text-neutral-500 text-center mb-10 leading-relaxed px-4">
                                Digite seu email abaixo e enviaremos um link para você resetar sua senha.
                            </p>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest px-1">Email</label>
                                    <input
                                        type="email"
                                        required
                                        placeholder="exemplo@email.com"
                                        className="w-full bg-neutral-50 border-none rounded-2xl py-4 px-6 text-sm outline-none focus:ring-2 focus:ring-dmz-accent/20 transition-all"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-dmz-accent text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-orange-500 transition-all shadow-xl shadow-dmz-accent/20"
                                >
                                    {loading ? "Enviando..." : "Enviar Link de Recuperação"}
                                </button>
                            </form>
                        </div>
                    ) : (
                        <div className="text-center animate-in zoom-in-95 duration-500">
                            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-8">
                                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center animate-bounce">
                                    <Bot size={24} className="text-white" />
                                </div>
                            </div>
                            <h2 className="text-2xl font-black text-neutral-900 mb-4">Email enviado!</h2>
                            <p className="text-neutral-500 text-sm mb-10 leading-relaxed px-2">
                                Se este email estiver cadastrado, você receberá instruções em instantes. Verifique também sua caixa de spam.
                            </p>
                            <button onClick={() => setSent(false)} className="text-dmz-accent font-bold text-sm hover:underline">
                                Tentar outro email
                            </button>
                        </div>
                    )}

                    <div className="mt-12 pt-8 border-t border-neutral-100 flex justify-center">
                        <Link href="/sign-in" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-neutral-400 hover:text-dmz-accent transition-colors">
                            <ArrowLeft size={14} /> Voltar para Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
