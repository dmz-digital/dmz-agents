"use client";

import { useState, useRef, useEffect } from "react";
import {
    Send, Mic, Paperclip, Bot, User,
    Sparkles, ArrowLeft, MoreHorizontal,
    Music2, Code2, Paintbrush, ShieldCheck,
    Volume2, StopCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { v4 as uuidv4 } from 'uuid';

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
    agent_id?: string;
    agent?: {
        handle: string;
        name: string;
        color: string;
    };
    created_at: Date;
}

const AGENT_MAP: Record<string, any> = {
    orch: { name: "ORCH", color: "#E85D2F", icon: Music2 },
    ryan: { name: "Ryan", color: "#0891B2", icon: Code2 },
    aurora: { name: "Aurora", color: "#DB2777", icon: Paintbrush },
    theron: { name: "Theron", color: "#DC2626", icon: ShieldCheck }
};

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
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
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
                agent_id: msg.agent_id,
                created_at: msg.created_at?.toISOString()
            })
            .select()
            .single();

        return data;
    };

    const handleSend = async (textOverride?: string | React.MouseEvent) => {
        const text = typeof textOverride === 'string' ? textOverride : input;
        if (!text.trim()) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            role: "user",
            content: text,
            created_at: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        if (!textOverride) setInput("");

        const savedUserMsg = await saveMessage(userMsg);
        if (savedUserMsg) {
            setMessages(prev => prev.map(m => m.id === userMsg.id ? { ...m, id: savedUserMsg.id } : m));
        }

        // AI Response Logic
        setTimeout(async () => {
            const lower = text.toLowerCase();
            let responseAgent = "orch";
            let responseContent = "Entendido. Vou analisar como podemos estruturar isso.";

            if (lower.includes("site") || lower.includes("design") || lower.includes("visual")) {
                responseAgent = "aurora";
                responseContent = "Olá! Eu sou a @aurora, Chief of Design. Vi que você mencionou o visual. Posso ajudar a criar uma interface premium e um design system sólido para seu projeto.";
            } else if (lower.includes("codigo") || lower.includes("desenvolver") || lower.includes("app")) {
                responseAgent = "ryan";
                responseContent = "Aqui é o @ryan. Como desenvolvedor Full-Stack, já estou mapeando a arquitetura necessária para esse projeto. Vamos focar em performance?";
            } else if (lower.includes("legal") || lower.includes("privacidade") || lower.includes("termos")) {
                responseAgent = "theron";
                responseContent = "Sou o @theron, Legal Chief. Garanto que seguiremos todos os protocolos de compliance e proteção de dados desde o dia 1.";
            }

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
                created_at: new Date()
            };

            setMessages(prev => [...prev, aiMsg]);
            const savedAiMsg = await saveMessage(aiMsg);
            if (savedAiMsg) {
                setMessages(prev => prev.map(m => m.id === aiMsg.id ? { ...m, id: savedAiMsg.id } : m));
            }
        }, 1500);
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
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const formData = new FormData();
            formData.append('file', blob);

            const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/transcribe-audio`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${session.access_token}`,
                },
                body: formData,
            });

            if (!response.ok) throw new Error("Falha na transcrição");

            const result = await response.json();
            if (result.text) {
                handleSend(result.text);
            }
        } catch (err) {
            console.error("Transcription error:", err);
            alert("Erro ao transcrever áudio.");
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
                className="flex-1 overflow-y-auto p-6 space-y-8 scroll-smooth"
            >
                <AnimatePresence initial={false}>
                    {messages.map((msg) => (
                        <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 10, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                            <div className={`max-w-[80%] flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
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
                                            <span className="text-[10px] font-mono text-neutral-300">@{msg.agent.handle}</span>
                                        </div>
                                    )}
                                    <div className={`p-4 px-6 rounded-[24px] text-sm leading-relaxed ${msg.role === "user"
                                        ? "bg-dmz-accent text-white rounded-tr-none shadow-lg shadow-dmz-accent/10"
                                        : "bg-white border border-neutral-100 text-neutral-700 rounded-tl-none shadow-sm"
                                        }`}>
                                        {msg.content}
                                    </div>
                                    <div className={`text-[9px] font-medium text-neutral-300 uppercase tracking-tighter ${msg.role === "user" ? "text-right" : "text-left"}`}>
                                        {msg.created_at.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Input Area */}
            <div className="p-6 bg-white border-t border-neutral-100">
                <div className="max-w-4xl mx-auto flex items-end gap-3">
                    <div className="flex-1 bg-neutral-50 rounded-[28px] border border-neutral-100 focus-within:border-dmz-accent transition-all p-2 pr-4 flex items-end">
                        <button className="p-3 text-neutral-400 hover:text-dmz-accent transition-colors">
                            <Paperclip size={20} />
                        </button>
                        <textarea
                            rows={1}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend();
                                }
                            }}
                            placeholder="Conte sobre seu projeto ou faça uma pergunta..."
                            className="flex-1 bg-transparent border-none focus:ring-0 text-neutral-800 text-sm py-3 px-2 resize-none max-h-32"
                        />
                        <button
                            onClick={handleSend}
                            disabled={!input.trim()}
                            className={`p-3 rounded-full transition-all ${input.trim()
                                ? "bg-dmz-accent text-white shadow-lg shadow-dmz-accent/20"
                                : "text-neutral-300"
                                }`}
                        >
                            <Send size={18} />
                        </button>
                    </div>

                    <button
                        onClick={isRecording ? stopRecording : startRecording}
                        className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${isRecording
                            ? "bg-red-500 text-white animate-pulse"
                            : "bg-white border border-neutral-100 text-neutral-500 hover:border-dmz-accent"
                            }`}
                    >
                        {isRecording ? <StopCircle size={24} /> : <Mic size={24} />}
                    </button>
                </div>
                <div className="text-center mt-4">
                    <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-[2px]">
                        {isRecording ? "Gravando áudio..." : "Digite ou envie um áudio para debater"}
                    </p>
                </div>
            </div>
        </div>
    );
}
