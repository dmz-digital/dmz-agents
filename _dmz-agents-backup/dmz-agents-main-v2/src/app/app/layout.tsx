"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Bot, FolderOpen, Brain, Wrench, Users, LayoutDashboard, User } from "lucide-react";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AppLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const [profile, setProfile] = useState<any>(null);

    useEffect(() => {
        async function loadProfile() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const metadata = user.user_metadata;

            // Extract avatar from identities (works for Google, GitHub, etc.)
            const getOAuthAvatar = () => {
                // Check identities array for provider-specific avatar
                const identities = user.identities || [];
                for (const identity of identities) {
                    const id_data = identity.identity_data || {};
                    const avatar = id_data.avatar_url || id_data.picture;
                    if (avatar) return avatar;
                }
                // Fallback to user_metadata
                return metadata?.avatar_url || metadata?.picture || null;
            };

            const oauthAvatar = getOAuthAvatar();
            const oauthName = metadata?.full_name || metadata?.name || null;
            const oauthUsername = metadata?.user_name || metadata?.preferred_username || user.email?.split('@')[0] || "";

            // Fetch profile from DB
            const { data } = await supabase
                .from("user_profiles")
                .select("*")
                .eq("id", user.id)
                .single();

            if (data) {
                // Always sync avatar_url if OAuth provides one (keeps it fresh)
                const updates: any = {};
                if (oauthAvatar && data.avatar_url !== oauthAvatar) {
                    updates.avatar_url = oauthAvatar;
                }
                if (oauthName && !data.full_name) {
                    updates.full_name = oauthName;
                }
                if (Object.keys(updates).length > 0) {
                    const { data: updated } = await supabase
                        .from("user_profiles")
                        .update(updates)
                        .eq("id", user.id)
                        .select()
                        .single();
                    if (updated) { setProfile(updated); return; }
                }
                setProfile(data);
            } else {
                // No profile yet — create from OAuth metadata
                const { data: newProfile } = await supabase
                    .from("user_profiles")
                    .upsert({
                        id: user.id,
                        email: user.email,
                        full_name: oauthName || "",
                        avatar_url: oauthAvatar || "",
                        username: oauthUsername,
                    })
                    .select()
                    .single();
                if (newProfile) setProfile(newProfile);
            }
        }
        loadProfile();
    }, []);

    const getUserInitials = () => {
        if (!profile?.full_name) return "?";
        const names = profile.full_name.trim().split(' ');
        if (names.length >= 2) {
            return (names[0][0] + names[names.length - 1][0]).toUpperCase();
        }
        return names[0][0].toUpperCase();
    };

    const navItems = [
        { href: "/app", icon: LayoutDashboard, title: "Dashboard" },
        { href: "/app/agents", icon: Bot, title: "Squad Experts" },
        { href: "/app/projects", icon: FolderOpen, title: "Projects" },
        { href: "/app/memory", icon: Brain, title: "Memory" },
        { href: "/app/tools", icon: Wrench, title: "Tools" },
        {
            href: "/app/profile",
            icon: User,
            title: "Profile",
            isProfile: true
        },
    ];

    return (
        <div className="relative">
            <main className="pb-32">
                {children}
            </main>

            {/* Floating Navigation Pill */}
            <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 p-2 bg-white/80 backdrop-blur-md border border-neutral-200 shadow-xl rounded-full z-50 transition-all hover:bg-white">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center justify-center p-3 rounded-full transition-all ${isActive
                                ? "text-dmz-accent bg-orange-50/80 shadow-sm"
                                : "text-neutral-400 hover:text-dmz-accent hover:bg-orange-50/50"
                                }`}
                            title={item.title}
                        >
                            {item.isProfile ? (
                                <div className={`w-6 h-6 rounded-full overflow-hidden flex items-center justify-center relative ${isActive ? "ring-2 ring-dmz-accent ring-offset-2" : ""}`}>
                                    {profile?.avatar_url ? (
                                        <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className={`w-full h-full flex items-center justify-center text-[10px] font-bold ${isActive ? "bg-dmz-accent text-white" : "bg-neutral-100 text-neutral-400"}`}>
                                            {getUserInitials()}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <Icon size={22} strokeWidth={isActive ? 2 : 1.5} />
                            )}
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}
