"use client";
// Version: 1.0.1 - Force build for video background
import { useState, useEffect } from "react";
import Link from "next/link";
import {
    Bot, Mail, Lock, ArrowRight,
    User, Phone, Globe, MapPin, Check,
    ChevronDown, Search, ArrowLeft
} from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

// ── Mock Data ────────────────────────────────────────────────────────────────

const COUNTRIES = [
    { name: "Brasil", ddi: "+55", flag: "🇧🇷" },
    { name: "Portugal", ddi: "+351", flag: "🇵🇹" },
    { name: "Estados Unidos", ddi: "+1", flag: "🇺🇸" },
    { name: "Reino Unido", ddi: "+44", flag: "🇬🇧" },
    { name: "Canadá", ddi: "+1", flag: "🇨🇦" },
    { name: "Alemanha", ddi: "+49", flag: "🇩🇪" },
    { name: "França", ddi: "+33", flag: "🇫🇷" },
    { name: "Espanha", ddi: "+34", flag: "🇪🇸" },
    { name: "Itália", ddi: "+39", flag: "🇮🇹" },
    { name: "Japão", ddi: "+81", flag: "🇯🇵" },
    { name: "China", ddi: "+86", flag: "🇨🇳" },
    { name: "Angola", ddi: "+244", flag: "🇦🇴" },
    { name: "Moçambique", ddi: "+258", flag: "🇲🇿" },
    { name: "Argentina", ddi: "+54", flag: "🇦🇷" },
    { name: "Chile", ddi: "+56", flag: "🇨🇱" },
    { name: "Colômbia", ddi: "+57", flag: "🇨🇴" },
    { name: "México", ddi: "+52", flag: "🇲🇽" },
    { name: "Austrália", ddi: "+61", flag: "🇦🇺" },
    { name: "Índia", ddi: "+91", flag: "🇮🇳" },
    { name: "Rússia", ddi: "+7", flag: "🇷🇺" },
    { name: "África do Sul", ddi: "+27", flag: "🇿🇦" },
    { name: "Suíça", ddi: "+41", flag: "🇨🇭" },
    { name: "Suécia", ddi: "+46", flag: "🇸🇪" },
    { name: "Noruega", ddi: "+47", flag: "🇳🇴" },
    { name: "Holanda", ddi: "+31", flag: "🇳🇱" },
    { name: "Bélgica", ddi: "+32", flag: "🇧🇪" },
    { name: "Irlanda", ddi: "+353", flag: "🇮🇪" },
    { name: "Nova Zelândia", ddi: "+64", flag: "🇳🇿" },
    { name: "Uruguai", ddi: "+598", flag: "🇺🇾" },
    { name: "Paraguai", ddi: "+595", flag: "🇵🇾" },
    { name: "Peru", ddi: "+51", flag: "🇵🇪" },
    { name: "Bolívia", ddi: "+591", flag: "🇧🇴" },
    { name: "Equador", ddi: "+593", flag: "🇪🇨" },
    { name: "Venezuela", ddi: "+58", flag: "🇻🇪" },
    { name: "Panamá", ddi: "+507", flag: "🇵🇦" },
    { name: "Costa Rica", ddi: "+506", flag: "🇨🇷" },
    { name: "Cuba", ddi: "+53", flag: "🇨🇺" },
    { name: "Israel", ddi: "+972", flag: "🇮🇱" },
    { name: "Egito", ddi: "+20", flag: "🇪🇬" },
    { name: "Nigéria", ddi: "+234", flag: "🇳🇬" },
    { name: "Coreia do Sul", ddi: "+82", flag: "🇰🇷" },
    { name: "Turquia", ddi: "+90", flag: "🇹🇷" },
    { name: "Grécia", ddi: "+30", flag: "🇬🇷" },
    { name: "Polônia", ddi: "+48", flag: "🇵🇱" },
    { name: "Áustria", ddi: "+43", flag: "🇦🇹" },
    { name: "Dinamarca", ddi: "+45", flag: "🇩🇰" },
    { name: "Finlândia", ddi: "+358", flag: "🇫🇮" },
    { name: "Singapura", ddi: "+65", flag: "🇸🇬" },
    { name: "Tailândia", ddi: "+66", flag: "🇹🇭" },
    { name: "Indonésia", ddi: "+62", flag: "🇮🇩" },
].sort((a, b) => a.name.localeCompare(b.name));

// ── Components ────────────────────────────────────────────────────────────────

function PasswordCriteria({ met, label }: { met: boolean, label: string }) {
    return (
        <div className="flex items-center gap-2">
            <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center transition-all ${met ? 'bg-green-500' : 'bg-neutral-200'}`}>
                <Check size={8} className="text-white" strokeWidth={4} />
            </div>
            <span className={`text-[10px] font-bold uppercase tracking-wider ${met ? 'text-green-600' : 'text-neutral-400'}`}>
                {label}
            </span>
        </div>
    );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function SignUpPage() {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    // Form states
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        ddi: "+55",
        phone: "",
        country: "Brasil",
        state: "",
        password: "",
        confirmPassword: "",
    });

    // Password Validation
    const checks = {
        upper: /[A-Z]/.test(formData.password),
        lower: /[a-z]/.test(formData.password),
        special: /[@#$*%^]/.test(formData.password),
        length: formData.password.length >= 6 && formData.password.length <= 12,
        match: formData.password === formData.confirmPassword && formData.password !== "",
    };

    const isFormValid = Object.values(checks).every(Boolean) &&
        formData.firstName && formData.lastName && formData.email && formData.phone;

    const [error, setError] = useState<string | null>(null);

    const handleGoogleLogin = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo: `${window.location.origin}/auth/callback` }
        });
        if (error) setError(error.message);
    };

    const handleGithubLogin = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'github',
            options: { redirectTo: `${window.location.origin}/auth/callback` }
        });
        if (error) setError(error.message);
    };

    const handleNext = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (step === 1) setStep(2);
        else {
            setLoading(true);
            try {
                const { data, error: signUpError } = await supabase.auth.signUp({
                    email: formData.email,
                    password: formData.password,
                    options: {
                        data: {
                            full_name: `${formData.firstName} ${formData.lastName}`
                        }
                    }
                });

                if (signUpError) throw signUpError;
                if (!data.user) throw new Error("Erro ao criar usuário");

                // Profile is usually created by trigger, but let's ensure it exists
                const { error: profileError } = await supabase
                    .from("user_profiles")
                    .upsert({
                        id: data.user.id,
                        email: formData.email,
                        full_name: `${formData.firstName} ${formData.lastName}`,
                        username: formData.email.split('@')[0],
                        created_at: new Date().toISOString()
                    });

                if (profileError) console.error("Profile creation error:", profileError);

                router.push("/app");
            } catch (err: any) {
                setError(err.message || "Erro ao criar conta");
                setLoading(false);
            }
        }
    };

    return (
        <div className="min-h-screen relative flex items-center justify-center p-6 overflow-hidden">
            {/* Video Background */}
            <video
                autoPlay
                loop
                muted
                playsInline
                className="absolute top-0 left-0 w-full h-full object-cover z-0"
            >
                <source src="/video-bg.mp4" type="video/mp4" />
            </video>

            {/* Dark Overlay */}
            <div className="absolute top-0 left-0 w-full h-full bg-black/60 backdrop-blur-[2px] z-10" />

            <div className="w-full max-w-xl relative z-20">
                {/* Step Indicator */}
                <div className="flex justify-center gap-3 mb-10">
                    <div className={`h-1.5 rounded-full transition-all duration-500 ${step === 1 ? 'w-12 bg-dmz-accent' : 'w-4 bg-white/20'}`} />
                    <div className={`h-1.5 rounded-full transition-all duration-500 ${step === 2 ? 'w-12 bg-dmz-accent' : 'w-4 bg-white/20'}`} />
                </div>

                {/* Card */}
                <div className="bg-white border border-neutral-100 shadow-2xl shadow-neutral-200/50 rounded-[40px] overflow-hidden">

                    <div className="p-10 md:p-14">
                        {step === 1 ? (
                            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="text-center">
                                    <h1 className="text-3xl font-black text-neutral-900 mb-3 tracking-tight">Criar sua conta</h1>
                                    <p className="text-sm text-neutral-500 font-medium">Junte-se à revolução dos squads de IA autônomos.</p>
                                </div>

                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            onClick={handleGoogleLogin}
                                            type="button"
                                            className="w-full bg-white border border-neutral-200 py-3.5 rounded-2xl font-bold text-sm text-neutral-700 flex items-center justify-center gap-2 hover:bg-neutral-50 hover:border-neutral-300 hover:-translate-y-0.5 active:scale-[0.98] transition-all cursor-pointer"
                                        >
                                            <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                            </svg>
                                            Google
                                        </button>
                                        <button
                                            onClick={handleGithubLogin}
                                            type="button"
                                            className="w-full bg-neutral-900 text-white py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-neutral-800 hover:-translate-y-0.5 active:scale-[0.98] transition-all border border-neutral-800 cursor-pointer"
                                        >
                                            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
                                            </svg>
                                            GitHub
                                        </button>
                                    </div>

                                    <div className="flex items-center gap-4 py-2">
                                        <div className="flex-1 h-px bg-neutral-100" />
                                        <span className="text-[10px] font-black text-neutral-300 uppercase tracking-widest">Ou use seu email</span>
                                        <div className="flex-1 h-px bg-neutral-100" />
                                    </div>

                                    <form onSubmit={handleNext} className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest px-1">Email Profissional</label>
                                            <div className="relative">
                                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300" size={18} />
                                                <input
                                                    type="email"
                                                    required
                                                    value={formData.email}
                                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                    placeholder="exemplo@dmzlabs.co"
                                                    className="w-full bg-neutral-50 border-none rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-dmz-accent/20 transition-all outline-none"
                                                />
                                            </div>
                                        </div>
                                        <button type="submit" className="w-full bg-dmz-accent text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-orange-500 hover:-translate-y-0.5 active:scale-[0.98] transition-all shadow-xl shadow-dmz-accent/20">
                                            Continuar cadastro <ArrowRight size={18} />
                                        </button>
                                    </form>
                                </div>
                            </div>
                        ) : (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                                <button onClick={() => setStep(1)} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-neutral-400 hover:text-dmz-accent mb-8 transition-colors">
                                    <ArrowLeft size={14} /> Voltar
                                </button>

                                <h2 className="text-2xl font-black text-neutral-900 mb-8 tracking-tight">Complete seu perfil</h2>

                                <form onSubmit={handleNext} className="space-y-6">
                                    {/* Name Group */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest px-1">Nome</label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.firstName}
                                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                                className="w-full bg-neutral-50 border-none rounded-2xl py-4 px-4 text-sm outline-none focus:ring-2 focus:ring-dmz-accent/20 transition-all"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest px-1">Sobrenome</label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.lastName}
                                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                                className="w-full bg-neutral-50 border-none rounded-2xl py-4 px-4 text-sm outline-none focus:ring-2 focus:ring-dmz-accent/20 transition-all"
                                            />
                                        </div>
                                    </div>

                                    {/* Phone / DDI */}
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest px-1">Telefone / WhatsApp</label>
                                        <div className="flex gap-2">
                                            <div className="relative w-32 shrink-0">
                                                <select
                                                    value={formData.ddi}
                                                    onChange={(e) => setFormData({ ...formData, ddi: e.target.value })}
                                                    className="w-full bg-neutral-50 border-none rounded-2xl py-4 pl-4 pr-8 text-sm outline-none appearance-none cursor-pointer focus:ring-2 focus:ring-dmz-accent/20 transition-all"
                                                >
                                                    {COUNTRIES.map(c => (
                                                        <option key={c.name} value={c.ddi}>{c.flag} {c.ddi}</option>
                                                    ))}
                                                </select>
                                                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                                            </div>
                                            <input
                                                type="tel"
                                                required
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                placeholder="(00) 00000-0000"
                                                className="flex-1 bg-neutral-50 border-none rounded-2xl py-4 px-4 text-sm outline-none focus:ring-2 focus:ring-dmz-accent/20 transition-all"
                                            />
                                        </div>
                                    </div>

                                    {/* Country / State */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest px-1">País</label>
                                            <div className="relative">
                                                <select
                                                    value={formData.country}
                                                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                                    className="w-full bg-neutral-50 border-none rounded-2xl py-4 pl-4 pr-10 text-sm outline-none appearance-none cursor-pointer focus:ring-2 focus:ring-dmz-accent/20 transition-all"
                                                >
                                                    {COUNTRIES.map(c => (
                                                        <option key={c.name} value={c.name}>{c.name}</option>
                                                    ))}
                                                </select>
                                                <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest px-1">Estado</label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.state}
                                                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                                placeholder="Ex: São Paulo"
                                                className="w-full bg-neutral-50 border-none rounded-2xl py-4 px-4 text-sm outline-none focus:ring-2 focus:ring-dmz-accent/20 transition-all"
                                            />
                                        </div>
                                    </div>

                                    {/* Password Selection */}
                                    <div className="space-y-4 pt-2">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest px-1">Senha</label>
                                                <input
                                                    type="password"
                                                    required
                                                    value={formData.password}
                                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                    placeholder="••••••••"
                                                    className="w-full bg-neutral-50 border-none rounded-2xl py-4 px-4 text-sm outline-none focus:ring-2 focus:ring-dmz-accent/20 transition-all"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest px-1">Confirmar Senha</label>
                                                <input
                                                    type="password"
                                                    required
                                                    value={formData.confirmPassword}
                                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                                    placeholder="••••••••"
                                                    className="w-full bg-neutral-50 border-none rounded-2xl py-4 px-4 text-sm outline-none focus:ring-2 focus:ring-dmz-accent/20 transition-all"
                                                />
                                            </div>
                                        </div>

                                        {/* Password Rules Indicators */}
                                        <div className="bg-neutral-50 p-6 rounded-3xl space-y-3">
                                            <div className="grid grid-cols-2 gap-y-3">
                                                <PasswordCriteria met={checks.upper} label="Letra Maiúscula" />
                                                <PasswordCriteria met={checks.lower} label="Letra Minúscula" />
                                                <PasswordCriteria met={checks.special} label="Caractere Especial" />
                                                <PasswordCriteria met={checks.length} label="6-12 Caracteres" />
                                            </div>
                                            <div className="pt-3 border-t border-neutral-200">
                                                <PasswordCriteria met={checks.match} label="Senhas Coincidem" />
                                            </div>
                                        </div>
                                    </div>

                                    {error && (
                                        <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-xs font-medium border border-red-100">
                                            {error}
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={!isFormValid || loading}
                                        className="w-full bg-dmz-accent text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-orange-500 hover:-translate-y-0.5 active:scale-[0.98] transition-all shadow-xl shadow-dmz-accent/20 disabled:opacity-30 disabled:grayscale"
                                    >
                                        {loading ? "Criando Conta..." : "Finalizar Cadastro e Iniciar"}
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>

                </div>

                <p className="text-center mt-10 text-sm text-neutral-300">
                    Já tem uma conta? <Link href="/sign-in" className="text-dmz-accent font-bold hover:underline">Fazer Login</Link>
                </p>
            </div>
        </div>
    );
}
