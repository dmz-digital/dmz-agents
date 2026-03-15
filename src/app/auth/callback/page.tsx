"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AuthCallbackPage() {
    const router = useRouter();

    useEffect(() => {
        const handleAuthCallback = async () => {
            const { data: { session }, error } = await supabase.auth.getSession();
            if (error) {
                console.error("Auth callback error:", error.message);
                router.push("/sign-in?error=auth_callback_failed");
                return;
            }

            if (session?.user) {
                const user = session.user;
                const metadata = user.user_metadata;

                // Sync profile data from OAuth metadata
                const { error: profileError } = await supabase
                    .from("user_profiles")
                    .upsert({
                        id: user.id,
                        email: user.email,
                        full_name: metadata.full_name || metadata.name || "",
                        avatar_url: metadata.avatar_url || metadata.picture || "",
                        username: metadata.user_name || user.email?.split('@')[0] || "",
                        updated_at: new Date().toISOString()
                    }, { onConflict: 'id' });

                if (profileError) {
                    console.error("Error syncing profile:", profileError);
                }
            }

            if (typeof window !== 'undefined' && (window.location.hash.includes('type=recovery') || window.location.search.includes('type=recovery'))) {
                router.push("/reset-password");
                return;
            }

            router.push("/app");
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
