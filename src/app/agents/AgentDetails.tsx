"use client";

import { useEffect, useState } from "react";
import { X, Zap, Terminal, Code, Sparkles, Bot, Clock, ShieldCheck, Cpu } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function AgentDetails({ agent, onClose, icons }: { agent: any; onClose: () => void; icons: Record<string, any> }) {
    const [details, setDetails] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchFullDetails() {
            setLoading(true);
            try {
                // Fetch prompt
                const { data: prompts } = await supabase
                    .from("dmz_agents_prompts")
                    .select("content")
                    .eq("agent_id", agent.id)
                    .eq("active", true)
                    .maybeSingle();

                // Fetch skills
                const { data: skills } = await supabase
                    .from("dmz_agents_skills")
                    .select("*")
                    .eq("agent_id", agent.id)
                    .order("sort_order", { ascending: true });

                setDetails({
                    prompt: prompts?.content || "No active production prompt defined for this agent version.",
                    skills: skills || []
                });
            } catch (err) {
                console.error("Error fetching agent details:", err);
            } finally {
                setLoading(false);
            }
        }
        if (agent) {
            fetchFullDetails();
            // Prevent scrolling on body when modal is open
            document.body.style.overflow = "hidden";
        }
        return () => {
            document.body.style.overflow = "unset";
        }
    }, [agent]);

    if (!agent) return null;

    const IconComponent = icons[agent.icon] || Bot;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-end">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm transition-opacity animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Panel */}
            <div className="relative w-full max-w-2xl h-full bg-white shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-500 ease-out flex flex-col border-l border-neutral-100">

                {/* Header */}
                <div className="p-8 border-b border-neutral-100 flex justify-between items-start sticky top-0 bg-white/90 backdrop-blur-md z-20">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center transition-transform"
                            style={{ backgroundColor: `${agent.color}15`, border: `1px solid ${agent.color}30` }}>
                            <IconComponent size={32} style={{ color: agent.color }} />
                        </div>
                        <div>
                            <h2 className="text-3xl font-extrabold text-dmz-text tracking-tight">{agent.full_name || agent.name}</h2>
                            <div className="flex items-center gap-3 mt-1.5">
                                <div className="flex items-center gap-1.5">
                                    <span className="text-sm font-mono font-bold" style={{ color: agent.color }}>@{agent.handle}</span>
                                </div>
                                <span className="text-neutral-300 text-sm">•</span>
                                <span className="text-xs uppercase font-bold text-dmz-muted tracking-widest">{agent.category}</span>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2.5 hover:bg-neutral-100 rounded-xl transition-all group active:scale-95"
                    >
                        <X size={22} className="text-dmz-muted group-hover:text-dmz-text" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-8 space-y-12 pb-24">

                    {/* Status Stats */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-neutral-50/50 p-4 rounded-2xl border border-neutral-100 shadow-sm">
                            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block mb-2">Availability</span>
                            <div className="flex items-center gap-2">
                                <div className={`w-2.5 h-2.5 rounded-full ${agent.active ? 'bg-green-500 animate-pulse' : 'bg-neutral-300'}`} />
                                <span className="text-sm font-bold text-dmz-text">{agent.active ? 'Operational' : 'Offline'}</span>
                            </div>
                        </div>
                        <div className="bg-neutral-50/50 p-4 rounded-2xl border border-neutral-100 shadow-sm">
                            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block mb-2">Primary Model</span>
                            <div className="flex items-center gap-2">
                                <Cpu size={14} className="text-dmz-accent" />
                                <span className="text-sm font-bold text-dmz-text">Gemini 2.0 P</span>
                            </div>
                        </div>
                        <div className="bg-neutral-50/50 p-4 rounded-2xl border border-neutral-100 shadow-sm">
                            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block mb-2">Health</span>
                            <div className="flex items-center gap-2 text-green-600">
                                <ShieldCheck size={14} />
                                <span className="text-sm font-bold">Excellent</span>
                            </div>
                        </div>
                    </div>

                    {/* Skills Section */}
                    <section>
                        <div className="flex items-center gap-2.5 mb-6">
                            <div className="p-2 bg-dmz-accent/10 rounded-xl">
                                <Zap size={18} className="text-dmz-accent fill-dmz-accent" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold uppercase tracking-wider text-dmz-text">Mastered Capabilities</h3>
                                <p className="text-[10px] font-medium text-dmz-muted uppercase tracking-tighter">Verified core skills for this agent</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                            {loading ? (
                                [1, 2, 3].map(i => <div key={i} className="h-16 bg-neutral-50 animate-pulse rounded-2xl" />)
                            ) : details?.skills.length > 0 ? (
                                details.skills.map((skill: any) => (
                                    <div key={skill.id} className="flex items-center justify-between p-4 rounded-2xl border border-neutral-100 bg-white hover:border-dmz-accent/20 hover:shadow-md hover:shadow-neutral-200/20 transition-all group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-neutral-50 border border-neutral-100 flex items-center justify-center text-dmz-muted group-hover:text-dmz-accent group-hover:bg-dmz-accent/5 transition-colors">
                                                <Code size={16} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-dmz-text group-hover:text-dmz-accent transition-colors">{skill.name}</p>
                                                <p className="text-xs text-dmz-muted font-medium pr-4">{skill.description}</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-1 shrink-0">
                                            <span className="text-[9px] font-extrabold uppercase py-1 px-2.5 rounded-lg bg-neutral-100 text-neutral-500 border border-neutral-200">
                                                {skill.level}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-8 text-center bg-neutral-50 rounded-2xl border border-dashed border-neutral-200 text-dmz-muted italic text-sm">
                                    No registered skills found for this agent.
                                </div>
                            )}
                        </div>
                    </section>

                    {/* System Prompt Section */}
                    <section>
                        <div className="flex items-center gap-2.5 mb-6">
                            <div className="p-2 bg-neutral-900 rounded-xl">
                                <Terminal size={18} className="text-white" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold uppercase tracking-wider text-dmz-text">Core Identity & Instructions</h3>
                                <p className="text-[10px] font-medium text-dmz-muted uppercase tracking-tighter">System-level configuration rules</p>
                            </div>
                        </div>
                        <div className="bg-neutral-900 rounded-3xl p-8 relative group border border-white/5 shadow-2xl shadow-neutral-900/20 overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <Terminal size={80} className="text-white" />
                            </div>
                            <div className="flex items-center gap-2 mb-6 border-b border-white/10 pb-4">
                                <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                                <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                                <span className="ml-2 text-[10px] font-mono font-bold text-white/30 uppercase tracking-widest">system_identity.cfg</span>
                            </div>
                            <div className="max-h-[400px] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-white/10 custom-scrollbar">
                                <pre className="text-sm font-mono text-neutral-300 whitespace-pre-wrap leading-relaxed">
                                    {loading ? (
                                        <div className="space-y-2">
                                            <div className="h-4 bg-white/5 rounded w-3/4 animate-pulse" />
                                            <div className="h-4 bg-white/5 rounded w-full animate-pulse" />
                                            <div className="h-4 bg-white/5 rounded w-5/6 animate-pulse" />
                                        </div>
                                    ) : details?.prompt}
                                </pre>
                            </div>
                        </div>
                    </section>

                    {/* History Mockup */}
                    <section>
                        <div className="flex items-center gap-2.5 mb-6">
                            <div className="p-2 bg-neutral-100 rounded-xl">
                                <Clock size={18} className="text-dmz-text" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold uppercase tracking-wider text-dmz-text">Recent Activity</h3>
                                <p className="text-[10px] font-medium text-dmz-muted uppercase tracking-tighter">Last missions and interactions</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="p-4 rounded-2xl bg-white border border-neutral-100 flex items-center justify-between opacity-60 grayscale">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center text-green-600">
                                        <Bot size={14} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-dmz-text">Sprint Planning Support</p>
                                        <p className="text-[10px] text-dmz-muted">Completed 2 hours ago • Project WIS-ENGINE</p>
                                    </div>
                                </div>
                                <span className="text-[9px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded-md">SUCCESS</span>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Footer Action */}
                <div className="p-8 border-t border-neutral-100 mt-auto bg-white/80 backdrop-blur-md sticky bottom-0 z-20">
                    <button className="w-full h-14 bg-dmz-accent text-white rounded-2xl font-bold shadow-xl shadow-dmz-accent/20 hover:bg-dmz-accent/90 hover:shadow-2xl hover:shadow-dmz-accent/30 hover:-translate-y-0.5 active:translate-y-0 active:shadow-lg transition-all flex items-center justify-center gap-3 text-lg leading-none">
                        <Sparkles size={20} className="animate-pulse" />
                        Interact with {agent.handle.toUpperCase()}
                    </button>
                    <p className="text-[10px] text-center mt-4 font-bold text-neutral-300 uppercase tracking-[2px]">DMZ OS Terminal v1.0.4</p>
                </div>
            </div>

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.2);
                }
            `}</style>
        </div>
    );
}

