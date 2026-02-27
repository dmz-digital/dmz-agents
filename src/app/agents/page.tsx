"use client";

import { useEffect, useState } from "react";
import {
    Bot, Search, Activity, Layers, Blocks, Music2, Users,
    Code2, ClipboardList, Target, CheckSquare, Zap, Rocket,
    Building2, ShieldAlert, Scale, Sparkles, Paintbrush,
    PenLine, BookOpen, Brain, FlaskConical
} from "lucide-react";
import { supabase } from "@/lib/supabase";

const ICONS: Record<string, any> = {
    Music2, Users, Code2, ClipboardList, Target, CheckSquare,
    Zap, Rocket, Building2, ShieldAlert, Scale, Search,
    Sparkles, Paintbrush, PenLine, BookOpen, Brain, FlaskConical, Bot
};

export default function AgentsPage() {
    const [agents, setAgents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        async function fetchAgents() {
            const { data, error } = await supabase
                .from("dmz_agents_definitions")
                .select("*")
                .order("active", { ascending: false });

            if (data) setAgents(data);
            setLoading(false);
        }
        fetchAgents();
    }, []);

    const filteredAgents = agents.filter(a =>
        a.name.toLowerCase().includes(search.toLowerCase()) ||
        a.handle.toLowerCase().includes(search.toLowerCase()) ||
        a.category.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="max-w-7xl mx-auto px-6 pt-12">
            <div className="mb-10">
                <h1 className="text-3xl font-extrabold tracking-tight text-dmz-text mb-1">Squad Agents</h1>
                <p className="text-dmz-muted">Manage and monitor your specialized AI workforce.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
                {[
                    { label: "Total Agents", value: agents.length, icon: Bot, color: "text-neutral-900", bg: "bg-neutral-100" },
                    { label: "Active Now", value: agents.filter(a => a.active).length, icon: Activity, color: "text-green-600", bg: "bg-green-50" },
                    { label: "Categories", value: new Set(agents.map(a => a.category)).size, icon: Layers, color: "text-purple-600", bg: "bg-purple-50" },
                    { label: "System Status", value: "Stable", icon: Blocks, color: "text-blue-600", bg: "bg-blue-50" },
                ].map((s) => (
                    <div key={s.label} className="bg-white p-5 rounded-2xl border border-dmz-border shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-2xl font-bold">{s.value}</span>
                            <div className={`p-2 rounded-xl ${s.bg}`}>
                                <s.icon size={18} className={s.color} />
                            </div>
                        </div>
                        <span className="text-xs font-semibold text-dmz-muted uppercase tracking-wider">{s.label}</span>
                    </div>
                ))}
            </div>

            <div className="flex flex-wrap items-center gap-3 mb-8">
                <div className="relative flex-1 min-w-[300px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-dmz-muted" size={16} />
                    <input
                        type="text"
                        placeholder="Search agents by name, handle or category..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-dmz-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-dmz-accent/20 focus:border-dmz-accent transition-all"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {loading ? (
                    <p>Loading agents...</p>
                ) : (
                    filteredAgents.map((agent) => {
                        const IconComponent = ICONS[agent.icon] || Bot;
                        return (
                            <div key={agent.id} className="group bg-white border border-dmz-border rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-dmz-accent/30 transition-all cursor-pointer">
                                <div className="flex justify-between items-start mb-5">
                                    <div className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110" style={{ backgroundColor: `${agent.color}10`, border: `1px solid ${agent.color}20` }}>
                                        <IconComponent size={22} style={{ color: agent.color }} />
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <div className={`w-2 h-2 rounded-full ${agent.active ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-neutral-300'}`} />
                                        <span className={`text-[10px] font-bold uppercase ${agent.active ? 'text-green-600' : 'text-neutral-400'}`}>
                                            {agent.active ? 'Online' : 'Offline'}
                                        </span>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <h3 className="text-lg font-bold text-dmz-text leading-tight">{agent.full_name || agent.name}</h3>
                                    <div className="flex items-center gap-1 mt-1">
                                        <span className="text-xs font-bold" style={{ color: agent.color }}>@</span>
                                        <span className="text-xs font-mono font-bold tracking-tight" style={{ color: agent.color }}>{agent.handle}</span>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2 pt-4 border-t border-neutral-50">
                                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider" style={{ backgroundColor: `${agent.color}12`, color: agent.color }}>
                                        {agent.category}
                                    </span>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
