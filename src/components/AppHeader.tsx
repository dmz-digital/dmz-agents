"use client";

import Link from "next/link";
import { ArrowRight, Plus } from "lucide-react";

interface AppHeaderProps {
    title?: string;
    subtitle?: string;
    showButtons?: boolean;
}

export default function AppHeader({
    title = "DMZ – OS Agents",
    subtitle = "Manage your squad specialists",
    showButtons = true
}: AppHeaderProps) {
    return (
        <div className="flex items-center justify-between mb-10 w-full">
            <Link href="/app" className="flex flex-col hover:opacity-80 transition-opacity">
                <h1 className="text-2xl font-black text-neutral-900 tracking-tight leading-none mb-1">
                    {title}
                </h1>
                <p className="text-[13px] text-neutral-400 font-medium">
                    {subtitle}
                </p>
            </Link>

            {showButtons && (
                <div className="flex items-center gap-3">
                    <Link
                        href="/app/projects?view=select"
                        className="flex items-center gap-2 bg-white border border-neutral-200 text-neutral-700 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-neutral-50 transition-all shadow-sm active:scale-95"
                    >
                        <Plus size={16} strokeWidth={3} />
                        Criar um projeto
                    </Link>

                    <Link
                        href="/app/projects"
                        className="flex items-center gap-2 bg-gradient-to-br from-[#E85D2F] to-[#D14D22] text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:opacity-90 transition-all shadow-lg shadow-orange-500/15 active:scale-95"
                    >
                        Utilizar Agentes
                        <ArrowRight size={16} strokeWidth={3} />
                    </Link>
                </div>
            )}
        </div>
    );
}
