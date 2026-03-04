"use client";

import { useState, useRef, useEffect } from "react";
import {
    Send, Mic, Paperclip, Bot, User,
    Sparkles, ArrowLeft, MoreHorizontal,
    Music2, Code2, Paintbrush, ShieldCheck,
    Volume2, StopCircle, Play, Pause, Loader2
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
    agent_id?: string;
    agent?: {
        handle: string;
        name: string;
        color: string;
    };
    created_at: Date;
    isTyping?: boolean;
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

function TypingText({ text, onComplete }: { text: string, onComplete?: () => void }) {
    const [displayed, setDisplayed] = useState("");

    useEffect(() => {
        let i = 0;
        const interval = setInterval(() => {
            setDisplayed(text.substring(0, i));
            i++;
            if (i > text.length) {
                clearInterval(interval);
                onComplete?.();
            }
        }, 15);
        return () => clearInterval(interval);
    }, [text]);

    return <span>{displayed}</span>;
}

export default function ChatPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const [sessionId] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('dmz_chat_session');
            if (saved) return saved;
            const newId = uuidv4();
            localStorage.setItem('dmz_chat_session', newId);
            return newId;
        }
        return uuidv4();
    });

    const [input, setInput] = useState("");
    const [isRecording, setIsRecording] = useState(false);
    const [isThinking, setIsThinking] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        document.title = "Chat | DMZ - OS Agents";
        async function loadHistory() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

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
                // Default first message
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
        }
        loadHistory();
    }, [sessionId]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const saveMessage = async (msg: Partial<Message>) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
            .from('dmz_agents_chat')
            .insert({
                user_id: user.id,
                session_id: sessionId,
                role: msg.role,
                content: msg.content,
                audio_url: msg.audio_url,
                agent_id: msg.agent_id,
                created_at: msg.created_at?.toISOString()
            })
            .select()
            .single();

        return data;
    };

    const handleSend = async (payload?: string | { text: string, audioUrl: string }) => {
        let text = "";
        let audioUrl = "";

        if (typeof payload === 'string') {
            text = payload;
        } else if (payload && typeof payload === 'object' && 'text' in payload) {
            text = payload.text;
            audioUrl = payload.audioUrl;
        }

        if (!text.trim() && !audioUrl) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            role: "user",
            content: text,
            audio_url: audioUrl,
            created_at: new Date()
        };

        setMessages(prev => [...prev, userMsg]);

        const savedUserMsg = await saveMessage(userMsg);
        if (savedUserMsg) {
            setMessages(prev => prev.map(m => m.id === userMsg.id ? { ...m, id: savedUserMsg.id } : m));
        }

        setIsThinking(true);

        // AI Response Logic
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://dmz-agents-production.up.railway.app";
            const response = await fetch(`${apiUrl}/chat`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    message: text,
                    project_id: "default"
                }),
            });

            if (!response.ok) {
                throw new Error("Falha ao obter resposta do squad.");
            }

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

            const savedAiMsg = await saveMessage(aiMsg);
            if (savedAiMsg) {
                setMessages(prev => prev.map(m => m.id === aiMsg.id ? { ...m, id: savedAiMsg.id } : m));
            }
        } catch (err: any) {
            console.error("Chat error:", err);
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

    const handlePromptSend = async (text: string, audioFile?: File | Blob) => {
        if (audioFile) {
            await transcribeAudio(audioFile as Blob);
            if (text.trim()) {
                handleSend(text);
            }
        } else {
            handleSend(text);
        }
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                audioChunksRef.current.push(event.data);
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                await transcribeAudio(audioBlob);
            };

            mediaRecorder.start();
            setIsRecording(true);
        } catch (err) {
            console.error("Error accessing microphone:", err);
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
            if (!session) {
                setIsThinking(false);
                return;
            }

            const formData = new FormData();
            formData.append('file', blob);

            const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/transcribe-audio`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${session.access_token}`,
                },
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || errorData.error || "Falha na transcrição");
            }

            const result = await response.json();
            setIsThinking(false);
            if (result.text || result.audioUrl) {
                handleSend({ text: result.text || "", audioUrl: result.audioUrl });
            }
        } catch (err: any) {
            setIsThinking(false);
            console.error("Transcription error:", err);
            alert(`Erro ao transcrever áudio: ${err.message}`);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-[#FDFDFD] font-jakarta">
            {/* Header */}
            <header className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-20">
                <div className="flex items-center gap-4">
                    <Link href="/app" className="p-2 hover:bg-neutral-100 rounded-full transition-colors text-neutral-500">
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-lg font-black text-neutral-900 tracking-tight">Central de Debate</h1>
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
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto scroll-smooth"
            >
                <div className="max-w-5xl mx-auto w-full p-6 space-y-8">
                    <AnimatePresence initial={false}>
                        {messages.map((msg) => (
                            <motion.div
                                key={msg.id}
                                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                            >
                                <div className={`max-w-[85%] flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                                    {/* Avatar */}
                                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${msg.role === "user"
                                        ? "bg-neutral-900 text-white"
                                        : "bg-white border border-neutral-100"
                                        }`}>
                                        {msg.role === "user" ? <User size={20} /> : <Bot size={20} style={{ color: msg.agent?.color }} />}
                                    </div>

                                    {/* Content */}
                                    <div className="space-y-2">
                                        {msg.agent && (
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-black uppercase tracking-widest" style={{ color: msg.agent.color }}>
                                                    {msg.agent.name}
                                                </span>
                                                <span className="text-[10px] text-neutral-300 font-bold uppercase tracking-widest">
                                                    @{msg.agent.handle}
                                                </span>
                                            </div>
                                        )}
                                        <div className={`p-4 rounded-[24px] shadow-sm text-sm leading-relaxed ${msg.role === "user"
                                            ? "bg-neutral-900 text-white rounded-tr-none"
                                            : "bg-white border border-neutral-100 text-neutral-800 rounded-tl-none"
                                            }`}>
                                            {msg.audio_url ? (
                                                <div className="flex flex-col gap-3">
                                                    <AudioPlayer url={msg.audio_url} />
                                                    {msg.content && <p className="pt-2 border-t border-white/10 italic text-white/70">{msg.content}</p>}
                                                </div>
                                            ) : (
                                                msg.content
                                            )}
                                        </div>
                                        <div className={`text-[9px] font-medium text-neutral-300 uppercase tracking-tighter ${msg.role === "user" ? "text-right" : "text-left"}`}>
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
                                    <div className="bg-white border border-neutral-100 p-3 px-4 rounded-[20px] rounded-tl-none shadow-sm">
                                        <ThinkingDots />
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Input Area */}
            <div className="p-6 bg-white border-t border-neutral-100">
                <div className="max-w-5xl mx-auto">
                    <PromptBox
                        onSend={handlePromptSend}
                        onStartRecording={startRecording}
                        onStopRecording={stopRecording}
                        isRecording={isRecording}
                    />
                </div>
            </div>
        </div>
    );
}
