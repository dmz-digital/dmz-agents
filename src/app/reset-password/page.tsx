"use client";

import { useState } from "react";
import Link from "next/link";
import { Lock, ArrowRight, Check } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ResetPasswordPage() {
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const [formData, setFormData] = useState({ password: "", confirmPassword: "" });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            router.push("/sign-in");
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-dmz-bg flex items-center justify-center p-6">
            <div className="w-full max-w-md">
                <div className="bg-white border border-neutral-100 shadow-2xl rounded-[40px] p-10 md:p-14">
                    <div className="text-center mb-10">
                        <h1 className="text-3xl font-black text-neutral-900 mb-3 tracking-tight">Nova Senha</h1>
                        <p className="text-sm text-neutral-500 font-medium">Crie uma senha forte para proteger seu squad.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest px-1">Nova Senha</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300" size={18} />
                                <input
                                    type="password"
                                    required
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    placeholder="••••••••"
                                    className="w-full bg-neutral-50 border-none rounded-2xl py-4 pl-12 pr-4 text-sm outline-none focus:ring-2 focus:ring-dmz-accent/20 transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest px-1">Confirmar Nova Senha</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300" size={18} />
                                <input
                                    type="password"
                                    required
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    placeholder="••••••••"
                                    className="w-full bg-neutral-50 border-none rounded-2xl py-4 pl-12 pr-4 text-sm outline-none focus:ring-2 focus:ring-dmz-accent/20 transition-all"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || formData.password !== formData.confirmPassword || !formData.password}
                            className="w-full bg-dmz-accent text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-orange-500 transition-all shadow-xl shadow-dmz-accent/20 disabled:opacity-50"
                        >
                            {loading ? "Salvando..." : "Redefinir Senha"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
