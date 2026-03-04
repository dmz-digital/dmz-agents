"use client";

import Link from "next/link";
import { Bot, FolderOpen, Brain, Wrench, Users, LayoutDashboard } from "lucide-react";
import { usePathname } from "next/navigation";

export default function AppLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    const navItems = [
        { href: "/app", icon: LayoutDashboard, title: "Dashboard" },
        { href: "/app/agents", icon: Bot, title: "Squad Experts" },
        { href: "/app/projects", icon: FolderOpen, title: "Projects" },
        { href: "/app/memory", icon: Brain, title: "Memory" },
        { href: "/app/tools", icon: Wrench, title: "Tools" },
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
                            <Icon size={22} strokeWidth={isActive ? 2 : 1.5} />
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}
