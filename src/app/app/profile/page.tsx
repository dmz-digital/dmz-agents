"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
    User, Mail, Camera, Save, LogOut, ArrowLeft,
    AtSign, Shield, Loader2, CheckCircle2, AlertCircle, Plus
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Cropper from "react-easy-crop";
import { supabase } from "@/lib/supabase";
import AppHeader from "@/components/AppHeader";
import Link from "next/link";

// ── Image Cropping Logic ──────────────────────────────────────────────────────

async function getCroppedImg(imageSrc: string, pixelCrop: any) {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.addEventListener('load', () => resolve(img));
        img.addEventListener('error', (error) => reject(error));
        img.setAttribute('crossOrigin', 'anonymous');
        img.src = imageSrc;
    });

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) return null;

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
    );

    return new Promise<Blob | null>((resolve) => {
        canvas.toBlob((blob) => {
            resolve(blob);
        }, 'image/jpeg');
    });
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function ProfilePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState({
        full_name: "",
        username: "",
        avatar_url: ""
    });

    // Avatar upload/crop state
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [showCropper, setShowCropper] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        document.title = "Perfil | DMZ - OS Agents";
        async function loadData() {
            const { data: { user: authUser } } = await supabase.auth.getUser();
            if (!authUser) {
                router.push("/sign-in");
                return;
            }
            setUser(authUser);

            const { data: profileData } = await supabase
                .from("user_profiles")
                .select("*")
                .eq("id", authUser.id)
                .single();

            if (profileData) {
                const metadata = authUser.user_metadata;

                // Fallback to metadata if DB fields are empty
                const finalProfile = {
                    full_name: profileData.full_name || metadata.full_name || metadata.name || "",
                    username: profileData.username || metadata.user_name || authUser.email?.split('@')[0] || "",
                    avatar_url: profileData.avatar_url || metadata.avatar_url || metadata.picture || ""
                };

                setProfile(finalProfile);

                // If we pulled data from metadata that was missing in DB, update DB proactively
                if (!profileData.full_name && finalProfile.full_name || !profileData.avatar_url && finalProfile.avatar_url) {
                    await supabase
                        .from("user_profiles")
                        .update({
                            full_name: finalProfile.full_name,
                            avatar_url: finalProfile.avatar_url,
                            updated_at: new Date().toISOString()
                        })
                        .eq("id", authUser.id);
                }
            } else {
                // Profile doesn't exist, create it from metadata
                const metadata = authUser.user_metadata;
                const newProfile = {
                    id: authUser.id,
                    email: authUser.email,
                    full_name: metadata.full_name || metadata.name || "",
                    avatar_url: metadata.avatar_url || metadata.picture || "",
                    username: metadata.user_name || authUser.email?.split('@')[0] || "",
                };

                const { data: createdProfile } = await supabase
                    .from("user_profiles")
                    .upsert(newProfile)
                    .select()
                    .single();

                if (createdProfile) {
                    setProfile({
                        full_name: createdProfile.full_name || "",
                        username: createdProfile.username || "",
                        avatar_url: createdProfile.avatar_url || ""
                    });
                }
            }
            setLoading(false);
        }
        loadData();
    }, [router]);

    const onCropComplete = useCallback((_croppedArea: any, croppedAreaPixels: any) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                setImageSrc(reader.result as string);
                setShowCropper(true);
            };
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const file = e.dataTransfer.files[0];
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = () => {
                    setImageSrc(reader.result as string);
                    setShowCropper(true);
                };
            }
        }
    };

    const saveCroppedImage = async () => {
        if (!imageSrc || !croppedAreaPixels || !user) return;
        setSaving(true);
        try {
            const blob = await getCroppedImg(imageSrc, croppedAreaPixels);
            if (!blob) throw new Error("Could not crop image");

            const fileName = `${user.id}/${Date.now()}.jpg`;
            const { error: uploadError } = await supabase.storage
                .from("avatars")
                .upload(fileName, blob, { contentType: 'image/jpeg', upsert: true });

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from("avatars")
                .getPublicUrl(fileName);

            setProfile(prev => ({ ...prev, avatar_url: publicUrl }));
            setShowCropper(false);
            setMessage({ type: 'success', text: "Avatar pronto! Salve o perfil para aplicar." });
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message });
        } finally {
            setSaving(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage(null);

        try {
            const { error } = await supabase
                .from("user_profiles")
                .upsert({
                    id: user.id,
                    email: user.email,
                    full_name: profile.full_name,
                    username: profile.username,
                    avatar_url: profile.avatar_url,
                    updated_at: new Date().toISOString()
                });

            if (error) throw error;
            setMessage({ type: 'success', text: "Perfil atualizado com sucesso!" });
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message });
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/");
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#FDFDFD] flex items-center justify-center">
                <Loader2 className="text-dmz-accent animate-spin" size={32} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FDFDFD] pb-32">
            <header className="px-8 pt-12 pb-8 border-b border-neutral-100 mb-10 bg-white/50 backdrop-blur-md sticky top-0 z-20">
                <div className="max-w-3xl mx-auto flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                        <div className="w-10 h-10 bg-white border border-neutral-100 rounded-xl flex items-center justify-center p-2 shadow-sm">
                            <img src="/logo.svg" alt="DMZ OS Logo" className="w-full h-full" />
                        </div>
                        <div className="flex flex-col">
                            <h1 className="text-xl font-black text-[#D8663E] tracking-tight leading-none mb-1">Meu Perfil</h1>
                            <p className="text-[11px] text-neutral-400 font-medium">Configure seus dados e avatar</p>
                        </div>
                    </Link>

                    <Link href="/app" className="p-2 hover:bg-neutral-100 rounded-full transition-colors text-neutral-500">
                        <ArrowLeft size={20} />
                    </Link>
                </div>
            </header>

            <main className="px-8 max-w-3xl mx-auto">
                <div className="bg-white border border-neutral-100 rounded-[32px] p-8 shadow-sm">

                    {/* Avatar Section */}
                    <div className="flex flex-col items-center mb-12">
                        <div
                            className={`relative group cursor-pointer transition-all duration-300 ${isDragging ? "scale-105" : ""}`}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <div className={`w-32 h-32 rounded-[40px] bg-neutral-100 border-4 border-white shadow-xl overflow-hidden flex items-center justify-center transition-all ${isDragging ? "ring-4 ring-dmz-accent/20 border-dmz-accent/40" : "group-hover:border-dmz-accent/20"}`}>
                                {profile.avatar_url ? (
                                    <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <User size={64} className="text-neutral-300" />
                                )}
                                {isDragging && (
                                    <div className="absolute inset-0 bg-dmz-accent/10 backdrop-blur-sm flex items-center justify-center">
                                        <Plus className="text-dmz-accent" size={32} />
                                    </div>
                                )}
                            </div>
                            <button
                                className="absolute bottom-0 right-0 w-10 h-10 bg-dmz-accent text-white rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform shadow-dmz-accent/20"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    fileInputRef.current?.click();
                                }}
                            >
                                <Camera size={18} />
                            </button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleFileChange}
                            />
                        </div>
                        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-6">ARRASTE OU CLIQUE PARA MUDAR O AVATAR</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSave} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest px-1">Nome Completo</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300" size={18} />
                                    <input
                                        type="text"
                                        value={profile.full_name}
                                        onChange={e => setProfile(prev => ({ ...prev, full_name: e.target.value }))}
                                        placeholder="Seu nome"
                                        className="w-full bg-neutral-50 border-none rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-dmz-accent/20 transition-all outline-none"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest px-1">Username</label>
                                <div className="relative">
                                    <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300" size={18} />
                                    <input
                                        type="text"
                                        value={profile.username}
                                        onChange={e => setProfile(prev => ({ ...prev, username: e.target.value }))}
                                        placeholder="Seu @handle"
                                        className="w-full bg-neutral-50 border-none rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-dmz-accent/20 transition-all outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest px-1">Email (Primário)</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-200" size={18} />
                                <input
                                    type="text"
                                    disabled
                                    value={user?.email || ""}
                                    className="w-full bg-neutral-50/50 text-neutral-400 border-none rounded-2xl py-4 pl-12 pr-4 text-sm cursor-not-allowed"
                                />
                            </div>
                        </div>

                        {message && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className={`p-4 rounded-2xl flex items-center gap-3 ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}
                            >
                                {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                                <span className="text-sm font-medium">{message.text}</span>
                            </motion.div>
                        )}

                        <div className="pt-4 flex items-center justify-between border-t border-neutral-100 mt-8">
                            <button
                                type="button"
                                onClick={handleLogout}
                                className="flex items-center gap-2 text-neutral-400 hover:text-red-500 font-bold text-sm transition-colors group"
                            >
                                <LogOut size={18} className="group-hover:translate-x-1 transition-transform" />
                                Sair da conta
                            </button>

                            <button
                                type="submit"
                                disabled={saving}
                                className="bg-dmz-accent text-white px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-orange-600 transition-all shadow-xl shadow-dmz-accent/20 disabled:opacity-50"
                            >
                                {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                                Salvar Alterações
                            </button>
                        </div>
                    </form>
                </div>
            </main>

            {/* Cropper Modal */}
            <AnimatePresence>
                {showCropper && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white rounded-[32px] w-full max-w-xl overflow-hidden shadow-2xl"
                        >
                            <div className="p-6 border-b border-neutral-100 flex justify-between items-center">
                                <h3 className="font-black text-neutral-900">Ajustar Avatar</h3>
                                <button onClick={() => setShowCropper(false)} className="p-2 hover:bg-neutral-50 rounded-full transition-colors text-neutral-400"><X size={20} /></button>
                            </div>

                            <div className="relative h-80 bg-neutral-900">
                                <Cropper
                                    image={imageSrc!}
                                    crop={crop}
                                    zoom={zoom}
                                    aspect={1}
                                    onCropChange={setCrop}
                                    onCropComplete={onCropComplete}
                                    onZoomChange={setZoom}
                                    cropShape="round"
                                />
                            </div>

                            <div className="p-8">
                                <div className="flex flex-col gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Zoom</label>
                                        <input
                                            type="range"
                                            value={zoom}
                                            min={1} max={3} step={0.1}
                                            onChange={(e) => setZoom(Number(e.target.value))}
                                            className="w-full accent-dmz-accent"
                                        />
                                    </div>
                                    <div className="flex gap-4">
                                        <button
                                            onClick={() => setShowCropper(false)}
                                            className="flex-1 py-4 text-neutral-400 font-bold hover:bg-neutral-50 rounded-2xl transition-all"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            onClick={saveCroppedImage}
                                            disabled={saving}
                                            className="flex-1 py-4 bg-dmz-accent text-white font-bold rounded-2xl hover:bg-orange-600 shadow-lg shadow-dmz-accent/20 transition-all flex items-center justify-center gap-2"
                                        >
                                            {saving && <Loader2 className="animate-spin" size={18} />}
                                            Aplicar Corte
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

function X({ size, className }: { size: number, className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M18 6 6 18" /><path d="m6 6 12 12" />
        </svg>
    );
}
