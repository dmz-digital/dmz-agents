"use client";

import { useState, useRef, useEffect } from "react";
import {
    Send, Mic, Paperclip, Bot, User,
    Sparkles, ArrowLeft, MoreHorizontal,
    Music2, Code2, Paintbrush, ShieldCheck,
    Volume2, StopCircle, Play, Pause, Loader2,
    MessageSquare, Plus, Search, ChevronRight,
    Clock, Trash2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { v4 as uuidv4 } from 'uuid';
import { PromptBox } from "@/components/ui/chatgpt-prompt-input";

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
    audio_url?: string;
    file_url?: string;
    file_type?: string;
    agent_id?: string;
    agent?: {
        handle: string;
        name: string;
        color: string;
    };
    created_at: Date;
    isTyping?: boolean;
}

interface ChatSession {
    session_id: string;
    last_message: string;
    created_at: Date;
}

const AGENT_MAP: Record<string, any> = {
    orch: { name: "ORCH", color: "#E85D2F", icon: Music2 },
    ryan: { name: "Ryan", color: "#0891B2", icon: Code2 },
    aurora: { name: "Aurora", color: "#DB2777", icon: Paintbrush },
    theron: { name: "Theron", color: "#DC2626", icon: ShieldCheck }
};

// ── Components ───────────────────────────────────────────────────────────────

function ThinkingDots() {
    return (
        <div className="flex gap-1 px-2 py-1">
            {[0, 1, 2].map((i) => (
                <motion.div
                    key={i}
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1 }}
                    className="w-1.5 h-1.5 bg-neutral-300 rounded-full"
                />
            ))}
        </div>
    );
}

function AudioPlayer({ url }: { url: string }) {
    const [playing, setPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const toggle = () => {
        if (!audioRef.current) return;
        if (playing) audioRef.current.pause();
        else audioRef.current.play();
        setPlaying(!playing);
    };

    return (
        <div className="flex items-center gap-3 bg-white/10 p-2 px-4 rounded-2xl min-w-[200px]">
            <button onClick={toggle} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors">
                {playing ? <Pause size={14} fill="white" /> : <Play size={14} fill="white" className="ml-0.5" />}
            </button>
            <div className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden relative">
                <motion.div
                    animate={playing ? { x: ["0%", "100%"] } : {}}
                    transition={playing ? { duration: 10, repeat: Infinity, ease: "linear" } : {}}
                    className="absolute inset-0 bg-white w-full"
                    style={{ left: "-100%" }}
                />
            </div>
            <audio ref={audioRef} src={url} onEnded={() => setPlaying(false)} className="hidden" />
            <Volume2 size={14} className="text-white/60" />
        </div>
    );
}

export default function ChatPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentSessionId, setCurrentSessionId] = useState<string>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('dmz_chat_session');
            if (saved) return saved;
            const newId = uuidv4();
            localStorage.setItem('dmz_chat_session', newId);
            return newId;
        }
        return uuidv4();
    });

    const [userProfile, setUserProfile] = useState<any>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [isThinking, setIsThinking] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        document.title = "Chat de Projetos | DMZ - OS Agents";
        loadInitialData();
    }, []);

    useEffect(() => {
        loadHistory(currentSessionId);
    }, [currentSessionId]);

    const loadInitialData = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Load profile
        const { data: profile } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', user.id)
            .single();
        if (profile) setUserProfile(profile);

        // Load all sessions
        loadSessions(user.id);
    };

    const loadSessions = async (userId: string) => {
        const { data, error } = await supabase
            .from('dmz_agents_chat')
            .select('session_id, content, created_at')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (data) {
            // Group by session_id to get latest message per session
            const grouped: Record<string, ChatSession> = {};
            data.forEach(m => {
                if (!grouped[m.session_id]) {
                    grouped[m.session_id] = {
                        session_id: m.session_id,
                        last_message: m.content || "Áudio enviado",
                        created_at: new Date(m.created_at)
                    };
                }
            });
            setSessions(Object.values(grouped));
        }
    };

    const loadHistory = async (sessionId: string) => {
        setLoading(true);
        const { data, error } = await supabase
            .from('dmz_agents_chat')
            .select('*')
            .eq('session_id', sessionId)
            .order('created_at', { ascending: true });

        if (data && data.length > 0) {
            const formatted = data.map((m: any) => ({
                id: m.id,
                role: m.role,
                content: m.content,
                audio_url: m.audio_url,
                agent_id: m.agent_id,
                agent: m.agent_id ? {
                    handle: m.agent_id,
                    name: AGENT_MAP[m.agent_id]?.name || m.agent_id.toUpperCase(),
                    color: AGENT_MAP[m.agent_id]?.color || "#6B7280"
                } : undefined,
                created_at: new Date(m.created_at)
            }));
            setMessages(formatted);
        } else {
            setMessages([
                {
                    id: "welcome",
                    role: "assistant",
                    content: "Olá! Eu sou o @orch. Como posso orquestrar o seu projeto hoje? Você pode me contar sobre sua ideia ou enviar um áudio, e eu trarei os especialistas certos para o debate.",
                    agent: { handle: "orch", name: "ORCH", color: "#E85D2F" },
                    agent_id: "orch",
                    created_at: new Date()
                }
            ]);
        }
        setLoading(false);
    };

    const createNewSession = () => {
        const newId = uuidv4();
        localStorage.setItem('dmz_chat_session', newId);
        setCurrentSessionId(newId);
    };

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const saveMessage = async (msg: Partial<Message>) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase
            .from('dmz_agents_chat')
            .insert({
                user_id: user.id,
                session_id: currentSessionId,
                role: msg.role,
                content: msg.content,
                audio_url: msg.audio_url,
                file_url: msg.file_url,
                file_type: msg.file_type,
                agent_id: msg.agent_id,
                created_at: msg.created_at?.toISOString()
            })
            .select()
            .single();

        // Refresh sessions list
        loadSessions(user.id);
        return data;
    };

    const uploadFile = async (file: File) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;

        let bucket = "files";
        if (file.type.startsWith("image/")) bucket = "images";
        else if (file.type.startsWith("audio/")) bucket = "audio";

        const fileName = `${user.id}/${Date.now()}-${file.name}`;
        const { data, error } = await supabase.storage
            .from(bucket)
            .upload(fileName, file);

        if (error) {
            console.error("Upload error:", error);
            return null;
        }

        const { data: { publicUrl } } = supabase.storage
            .from(bucket)
            .getPublicUrl(fileName);

        return { url: publicUrl, type: file.type };
    };

    const handleSend = async (payload?: string | { text: string, audioUrl?: string, fileUrl?: string, fileType?: string, toolId?: string | null }) => {
        let text = "";
        let audioUrl = "";
        let fileUrl = "";
        let fileType = "";
        let toolId = null;

        if (typeof payload === 'string') {
            text = payload;
        } else if (payload && typeof payload === 'object') {
            text = payload.text;
            audioUrl = payload.audioUrl || "";
            fileUrl = payload.fileUrl || "";
            fileType = payload.fileType || "";
            toolId = payload.toolId || null;
        }

        if (!text.trim() && !audioUrl && !fileUrl) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            role: "user",
            content: text,
            audio_url: audioUrl,
            file_url: fileUrl,
            file_type: fileType,
            created_at: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        await saveMessage(userMsg);

        setIsThinking(true);

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://dmz-agents-production.up.railway.app";
            const response = await fetch(`${apiUrl}/chat`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: text,
                    project_id: "default",
                    tool: toolId,
                    file_url: fileUrl || audioUrl,
                    file_type: fileType || (audioUrl ? "audio/webm" : "")
                }),
            });

            if (!response.ok) throw new Error("Falha ao obter resposta.");

            const data = await response.json();
            const responseAgent = data.agent_id || "orch";
            const responseContent = data.content;

            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: responseContent,
                agent_id: responseAgent,
                agent: {
                    handle: responseAgent,
                    name: AGENT_MAP[responseAgent]?.name || responseAgent.toUpperCase(),
                    color: AGENT_MAP[responseAgent]?.color || "#6B7280"
                },
                created_at: new Date(),
                isTyping: true
            };

            setIsThinking(false);
            setMessages(prev => [...prev, aiMsg]);
            await saveMessage(aiMsg);
        } catch (err) {
            setIsThinking(false);
            const errorMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: "Desculpe, tive um problema ao conectar com o squad. Por favor, tente novamente em instantes.",
                agent_id: "orch",
                agent: AGENT_MAP.orch,
                created_at: new Date(),
            };
            setMessages(prev => [...prev, errorMsg]);
        }
    };

    const handlePromptSend = async (text: string, file?: File, toolId?: string | null) => {
        if (file) {
            const uploadResult = await uploadFile(file);
            if (uploadResult) {
                handleSend({
                    text,
                    fileUrl: uploadResult.url,
                    fileType: uploadResult.type,
                    toolId
                });
            } else {
                handleSend({ text, toolId });
            }
        } else {
            handleSend({ text, toolId });
        }
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];
            mediaRecorder.ondataavailable = (event) => audioChunksRef.current.push(event.data);
            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                await transcribeAudio(audioBlob);
            };
            mediaRecorder.start();
            setIsRecording(true);
        } catch (err) {
            alert("Não foi possível acessar o microfone.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        }
    };

    const transcribeAudio = async (blob: Blob) => {
        setIsThinking(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;
            const formData = new FormData();
            formData.append('file', blob);
            const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/transcribe-audio`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${session.access_token}` },
                body: formData,
            });
            if (!response.ok) throw new Error("Erro na transcrição");
            const result = await response.json();
            setIsThinking(false);
            if (result.text || result.audioUrl) {
                handleSend({ text: result.text || "", audioUrl: result.audioUrl });
            }
        } catch (err) {
            setIsThinking(false);
        }
    };

    const getUserInitials = () => {
        if (!userProfile?.full_name) return "?";
        return userProfile.full_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();
    };

    return (
        <div className="flex h-screen bg-[#FDFDFD] font-jakarta overflow-hidden">
            {/* Sidebar */}
            <AnimatePresence>
                {sidebarOpen && (
                    <motion.aside
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: 320, opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        className="h-full bg-white border-r border-neutral-100 flex flex-col shrink-0 overflow-hidden relative"
                    >
                        <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
                            <Link href="/app" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                                <div className="w-8 h-8 bg-white border border-neutral-100 rounded-lg flex items-center justify-center p-1.5 shadow-sm">
                                    <img src="/logo.svg" alt="Logo" className="w-full h-full" />
                                </div>
                                <span className="font-extrabold text-[#D8663E] text-sm tracking-tight">DMZ – OS Agents</span>
                            </Link>
                            <button onClick={createNewSession} className="p-2 hover:bg-neutral-50 rounded-xl text-neutral-400 group transition-all" title="Nova Conversa">
                                <Plus size={20} className="group-hover:text-dmz-accent transition-colors" />
                            </button>
                        </div>

                        <div className="p-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-300" size={14} />
                                <input
                                    type="text"
                                    placeholder="Buscar projeto..."
                                    className="w-full bg-neutral-50 border-none rounded-xl py-2.5 pl-9 pr-4 text-xs focus:ring-1 focus:ring-dmz-accent/20 transition-all outline-none"
                                />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto px-4 pb-8 space-y-2 custom-scrollbar">
                            <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest px-2 mb-4 mt-6">Histórico de Projetos</h4>
                            {sessions.map((s) => (
                                <button
                                    key={s.session_id}
                                    onClick={() => setCurrentSessionId(s.session_id)}
                                    className={`w-full p-4 rounded-2xl text-left border transition-all group relative ${s.session_id === currentSessionId
                                        ? "bg-white border-dmz-accent/20 shadow-sm"
                                        : "bg-transparent border-transparent hover:bg-neutral-50"
                                        }`}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <div className="flex items-center gap-2 truncate">
                                            <MessageSquare size={14} className={s.session_id === currentSessionId ? "text-dmz-accent" : "text-neutral-300"} />
                                            <span className={`text-xs font-bold truncate ${s.session_id === currentSessionId ? "text-neutral-900" : "text-neutral-500"}`}>
                                                {s.last_message}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-[9px] text-neutral-400 font-medium">
                                        <Clock size={10} />
                                        {new Date(s.created_at).toLocaleDateString()}
                                    </div>
                                    <div className={`absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity ${s.session_id === currentSessionId ? "text-dmz-accent" : "text-neutral-300"}`}>
                                        <ChevronRight size={14} />
                                    </div>
                                </button>
                            ))}
                        </div>

                        {userProfile && (
                            <div className="p-6 border-t border-neutral-100">
                                <Link href="/app/profile" className="flex items-center gap-3 group">
                                    <div className="w-10 h-10 rounded-2xl overflow-hidden bg-neutral-100 flex items-center justify-center border-2 border-white shadow-sm shrink-0">
                                        {userProfile.avatar_url ? (
                                            <img src={userProfile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-xs font-bold text-neutral-400">{getUserInitials()}</span>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-bold text-neutral-900 truncate group-hover:text-dmz-accent transition-colors">{userProfile.full_name}</div>
                                        <div className="text-[10px] text-neutral-400 font-medium truncate">Configurações de Perfil</div>
                                    </div>
                                </Link>
                            </div>
                        )}
                    </motion.aside>
                )}
            </AnimatePresence>

            {/* Main Chat Content */}
            <div className="flex-1 flex flex-col h-full relative">
                {/* Header */}
                <header className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between bg-white/80 backdrop-blur-md z-20">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="p-2 hover:bg-neutral-100 rounded-xl text-neutral-500 transition-colors"
                        >
                            <ArrowLeft size={20} className={sidebarOpen ? "" : "rotate-180 transition-transform"} />
                        </button>
                        <div>
                            <h1 className="text-lg font-black text-neutral-900 tracking-tight">Chat de Projetos</h1>
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Squad Online</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="p-2 hover:bg-neutral-100 rounded-xl text-neutral-400 transition-all">
                            <Sparkles size={20} />
                        </button>
                        <button className="p-2 hover:bg-neutral-100 rounded-xl text-neutral-400 transition-all">
                            <MoreHorizontal size={20} />
                        </button>
                    </div>
                </header>

                {/* Chat Area */}
                <div ref={scrollRef} className="flex-1 overflow-y-auto scroll-smooth bg-white">
                    <div className="max-w-4xl mx-auto w-full p-6 space-y-10 pb-32">
                        <AnimatePresence initial={false}>
                            {messages.map((msg) => (
                                <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                                >
                                    <div className={`max-w-[85%] flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                                        {/* Avatar */}
                                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border-2 border-white ${msg.role === "user"
                                            ? "bg-neutral-900 text-white overflow-hidden"
                                            : "bg-white border-neutral-100"
                                            }`}>
                                            {msg.role === "user" ? (
                                                userProfile?.avatar_url ? (
                                                    <img src={userProfile.avatar_url} className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-xs font-bold">{getUserInitials()}</span>
                                                )
                                            ) : (
                                                <Bot size={20} style={{ color: msg.agent?.color }} />
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="space-y-1.5 flex flex-col">
                                            {msg.agent && (
                                                <div className="flex items-center gap-2 px-1">
                                                    <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: msg.agent.color }}>
                                                        {msg.agent.name}
                                                    </span>
                                                    <span className="text-[10px] text-neutral-300 font-bold uppercase tracking-widest">
                                                        @{msg.agent.handle}
                                                    </span>
                                                </div>
                                            )}
                                            <div className={`p-4 rounded-2xl text-sm leading-relaxed ${msg.role === "user"
                                                ? "bg-neutral-900 text-white rounded-tr-none"
                                                : "bg-white border border-neutral-100 text-neutral-800 rounded-tl-none"
                                                }`}>
                                                {msg.audio_url ? (
                                                    <div className="flex flex-col gap-3">
                                                        <AudioPlayer url={msg.audio_url} />
                                                        {msg.content && <p className="pt-2 border-t border-white/10 italic text-white/70">{msg.content}</p>}
                                                    </div>
                                                ) : msg.file_url ? (
                                                    <div className="flex flex-col gap-3">
                                                        {msg.file_type?.startsWith("image/") ? (
                                                            <img src={msg.file_url} className="rounded-xl max-w-full h-auto shadow-lg" alt="Anexo" />
                                                        ) : (
                                                            <a href={msg.file_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-neutral-100 p-3 rounded-xl hover:bg-neutral-200 transition-colors text-neutral-700 font-bold decoration-none">
                                                                <Paperclip size={16} />
                                                                Ver anexo: {msg.file_type?.split('/')[1]?.toUpperCase() || 'Arquivo'}
                                                            </a>
                                                        )}
                                                        {msg.content && <p className="pt-2">{msg.content}</p>}
                                                    </div>
                                                ) : (
                                                    msg.content
                                                )}
                                            </div>
                                            <div className={`px-2 text-[9px] font-medium text-neutral-300 uppercase tracking-tighter ${msg.role === "user" ? "text-right" : "text-left"}`}>
                                                {msg.created_at.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}

                            {isThinking && (
                                <motion.div
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex justify-start"
                                >
                                    <div className="flex gap-4 items-center">
                                        <div className="w-10 h-10 rounded-2xl bg-white border border-neutral-100 flex items-center justify-center shrink-0">
                                            <Loader2 size={18} className="text-neutral-300 animate-spin" />
                                        </div>
                                        <div className="bg-white border border-neutral-100 p-3 px-4 rounded-2xl rounded-tl-none">
                                            <ThinkingDots />
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Input Area */}
                <div className="p-6 bg-white border-t border-neutral-100 absolute bottom-0 left-0 w-full bg-gradient-to-t from-white via-white to-transparent">
                    <div className="max-w-4xl mx-auto">
                        <PromptBox
                            onSend={handlePromptSend}
                            onStartRecording={startRecording}
                            onStopRecording={stopRecording}
                            isRecording={isRecording}
                        />
                    </div>
                </div>
            </div>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #F1F1F1;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #E5E5E5;
                }
            `}</style>
        </div>
    );
}
