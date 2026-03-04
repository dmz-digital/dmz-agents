"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AuthCallbackPage() {
    const router = useRouter();

    useEffect(() => {
        const handleAuthCallback = async () => {
            const { error } = await supabase.auth.getSession();
            if (error) {
                console.error("Auth callback error:", error.message);
                router.push("/sign-in?error=auth_callback_failed");
            } else {
                router.push("/app");
            }
        };

        handleAuthCallback();
    }, [router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-white">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-dmz-accent border-t-transparent rounded-full animate-spin" />
                <p className="text-sm font-bold text-neutral-400 uppercase tracking-widest animate-pulse">
                    Autenticando...
                </p>
            </div>
        </div>
    );
}
