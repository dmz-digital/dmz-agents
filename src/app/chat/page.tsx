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
    orch: { name: "ORCH", handle: "orch", color: "#E85D2F", icon: Music2 },
    ryan: { name: "Ryan", handle: "ryan", color: "#0891B2", icon: Code2 },
    aurora: { name: "Aurora", handle: "aurora", color: "#DB2777", icon: Paintbrush },
    theron: { name: "Theron", handle: "theron", color: "#DC2626", icon: ShieldCheck }
};

// Strips markdown/list remnants and renders as natural paragraphs
function formatMessage(text: string): string[] {
    return text
        .split('\n')
        .map(line => line
            // Remove numbered list prefixes: "1. ", "2. ", etc.
            .replace(/^\d+\.\s+/, '')
            // Remove bullet prefixes: "- ", "* ", "• "
            .replace(/^[-*•]\s+/, '')
            // Remove leading colons used as sub-headers
            .replace(/^([A-ZÁÉÍÓÚÂÊÔÃÕ][^:]{0,40}):\s*$/, '$1')
            .trim()
        )
        .filter(line => line.length > 0);
}

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

function AudioPlayer({ url, isUser = false }: { url: string, isUser?: boolean }) {
    const [playing, setPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const toggle = () => {
        if (!audioRef.current) return;
        if (playing) audioRef.current.pause();
        else audioRef.current.play();
        setPlaying(!playing);
    };

    return (
        <div className={`flex items-center gap-3 p-2 px-4 rounded-2xl min-w-[200px] ${isUser ? 'bg-white/10' : 'bg-neutral-50'}`}>
            <button onClick={toggle} className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isUser ? 'bg-white/20 hover:bg-white/30' : 'bg-dmz-accent/10 hover:bg-dmz-accent/20'}`}>
                {playing ? (
                    <Pause size={14} className={isUser ? 'text-white' : 'text-dmz-accent'} fill="currentColor" />
                ) : (
                    <Play size={14} className={`${isUser ? 'text-white' : 'text-dmz-accent'} ml-0.5`} fill="currentColor" />
                )}
            </button>
            <div className={`flex-1 h-1 rounded-full overflow-hidden relative ${isUser ? 'bg-white/20' : 'bg-neutral-200'}`}>
                <motion.div
                    animate={playing ? { x: ["0%", "100%"] } : {}}
                    transition={playing ? { duration: 10, repeat: Infinity, ease: "linear" } : {}}
                    className={`absolute inset-0 w-full ${isUser ? 'bg-white' : 'bg-dmz-accent'}`}
                    style={{ left: "-100%" }}
                />
            </div>
            <audio ref={audioRef} src={url} onEnded={() => setPlaying(false)} className="hidden" />
            <Volume2 size={14} className={isUser ? 'text-white/60' : 'text-neutral-400'} />
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
    const inputRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        document.title = "Chat de Projetos | DMZ - OS Agents";
        loadInitialData();
        // Auto-focus textarea on mount
        setTimeout(() => inputRef.current?.focus(), 100);
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

        const ext = file.name.split('.').pop()?.toLowerCase() || '';
        const audioExts = ['mp3', 'wav', 'ogg', 'oga', 'opus', 'm4a', 'aac', 'flac', 'wma', '3gp', '3gpp', 'amr', 'caf', 'webm'];
        const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg', 'heic', 'heif', 'avif'];

        const isAudio = file.type.startsWith("audio/") || audioExts.includes(ext);
        const isImage = file.type.startsWith("image/") || imageExts.includes(ext);

        // Determine bucket and effective MIME type
        let bucket = "files";
        let effectiveMime = file.type;
        if (isAudio) {
            bucket = "audio";
            if (!effectiveMime || effectiveMime === 'application/octet-stream') {
                effectiveMime = `audio/${ext === 'mp3' ? 'mpeg' : ext}`;
            }
        } else if (isImage) {
            bucket = "images";
        }

        const fileName = `${user.id}/${Date.now()}-${file.name}`;
        const { data, error } = await supabase.storage
            .from(bucket)
            .upload(fileName, file, { contentType: effectiveMime || undefined });

        if (error) {
            console.error("[uploadFile] error:", error.message, "bucket:", bucket, "file:", file.name, file.type);
            return null;
        }

        const { data: { publicUrl } } = supabase.storage
            .from(bucket)
            .getPublicUrl(fileName);

        console.log("[uploadFile] success:", publicUrl, "type:", effectiveMime, "isAudio:", isAudio);
        return { url: publicUrl, type: effectiveMime, isAudio, isImage };
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
        if (!text.trim() && !file) return;

        if (file) {
            const ext = file.name.split('.').pop()?.toLowerCase() || '';
            const audioExts = ['mp3', 'wav', 'ogg', 'oga', 'opus', 'm4a', 'aac', 'flac', 'wma', '3gp', '3gpp', 'amr', 'caf', 'webm'];
            const isAudioFile = file.type.startsWith("audio/") || audioExts.includes(ext);

            // Show immediate user message
            const tempMsg: Message = {
                id: `temp-${Date.now()}`,
                role: "user",
                content: text || (isAudioFile ? `🎤 ${file.name}` : `📎 ${file.name}`),
                created_at: new Date()
            };
            setMessages(prev => [...prev, tempMsg]);
            setIsThinking(true);

            // 1. Upload to Supabase
            const uploadResult = await uploadFile(file);
            if (!uploadResult) {
                setIsThinking(false);
                const errMsg: Message = {
                    id: Date.now().toString(),
                    role: "assistant",
                    content: "Não consegui fazer o upload do arquivo. Verifique se o tipo é suportado e tente novamente.",
                    agent_id: "orch",
                    agent: AGENT_MAP.orch,
                    created_at: new Date()
                };
                setMessages(prev => [...prev, errMsg]);
                return;
            }

            // Remove temp, show real user message with AudioPlayer
            setMessages(prev => prev.filter(m => m.id !== tempMsg.id));

            if (isAudioFile) {
                // 2. Show user message with audio player immediately
                const userAudioMsg: Message = {
                    id: Date.now().toString(),
                    role: "user",
                    content: text || "",
                    audio_url: uploadResult.url,
                    created_at: new Date()
                };
                setMessages(prev => [...prev, userAudioMsg]);
                await saveMessage(userAudioMsg);

                // 3. Show transcription progress
                const progressMsg: Message = {
                    id: `progress-${Date.now()}`,
                    role: "assistant",
                    content: "📝 Transcrevendo áudio... isso pode levar alguns minutos para arquivos longos.",
                    agent_id: "orch",
                    agent: AGENT_MAP.orch,
                    created_at: new Date()
                };
                setMessages(prev => [...prev, progressMsg]);

                // 4. Call /transcribe endpoint
                try {
                    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://dmz-agents-production.up.railway.app";
                    const transcribeResp = await fetch(`${apiUrl}/transcribe`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            audio_url: uploadResult.url,
                            file_name: file.name
                        }),
                    });

                    // Remove progress message
                    setMessages(prev => prev.filter(m => m.id !== progressMsg.id));

                    if (!transcribeResp.ok) {
                        throw new Error("Falha na transcrição");
                    }

                    const transcribeData = await transcribeResp.json();
                    const transcription = transcribeData.transcription || "";

                    if (!transcription) {
                        setIsThinking(false);
                        const errMsg: Message = {
                            id: Date.now().toString(),
                            role: "assistant",
                            content: "Não consegui transcrever o áudio. O arquivo pode estar corrompido ou vazio.",
                            agent_id: "orch",
                            agent: AGENT_MAP.orch,
                            created_at: new Date()
                        };
                        setMessages(prev => [...prev, errMsg]);
                        return;
                    }

                    // 5. Send transcription to /chat for agent response
                    setIsThinking(false);
                    const contextMessage = text
                        ? `${text}\n\nTranscrição do áudio enviado:\n${transcription}`
                        : `Transcrição do áudio enviado:\n${transcription}`;

                    await handleSend({
                        text: contextMessage,
                        fileUrl: uploadResult.url,
                        fileType: uploadResult.type,
                        toolId
                    });

                } catch (err) {
                    setIsThinking(false);
                    setMessages(prev => prev.filter(m => m.id !== progressMsg.id));
                    const errMsg: Message = {
                        id: Date.now().toString(),
                        role: "assistant",
                        content: "Erro ao transcrever o áudio. Tente novamente ou envie um arquivo menor.",
                        agent_id: "orch",
                        agent: AGENT_MAP.orch,
                        created_at: new Date()
                    };
                    setMessages(prev => [...prev, errMsg]);
                }
            } else {
                // Non-audio file: send directly
                setIsThinking(false);
                await handleSend({ text, fileUrl: uploadResult.url, fileType: uploadResult.type, toolId });
            }
        } else {
            await handleSend({ text, toolId });
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
                        <button className="p-2 hover:bg-neutral-100 rounded-xl text-neutral-400 transition-all" title="Gerar Insight do Debate">
                            <Sparkles size={20} />
                        </button>
                        <button className="p-2 hover:bg-neutral-100 rounded-xl text-neutral-400 transition-all" title="Opções da Conversa">
                            <MoreHorizontal size={20} />
                        </button>
                    </div>
                </header>

                {/* Chat Area */}
                <div ref={scrollRef} className="flex-1 overflow-y-auto scroll-smooth bg-white custom-scrollbar">
                    <div className="max-w-4xl mx-auto w-full p-6 space-y-6 pb-48">
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
                                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border-2 border-white ${msg.role === "user"
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
                                            <div className={`py-4 px-6 rounded-[28px] text-[15px] leading-relaxed transition-all ${msg.role === "user"
                                                ? "bg-neutral-900 text-white rounded-tr-none border border-neutral-800"
                                                : "bg-[#F3F4F6] border border-neutral-100 text-neutral-800 rounded-tl-none"
                                                }`}>
                                                {msg.audio_url ? (
                                                    <div className="flex flex-col gap-3">
                                                        <AudioPlayer url={msg.audio_url} isUser={msg.role === "user"} />
                                                        {msg.content && <p className={`pt-2 border-t italic ${msg.role === 'user' ? 'border-white/10 text-white/70' : 'border-neutral-100 text-neutral-500'}`}>{msg.content}</p>}
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
                                                    <div className="space-y-3">
                                                        {formatMessage(msg.content).map((line, i) => (
                                                            <p key={i} className="leading-relaxed">{line}</p>
                                                        ))}
                                                    </div>
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

                <div className="p-6 sticky bottom-0 left-0 w-full bg-gradient-to-t from-white via-white/100 to-transparent z-30">
                    <div className="max-w-4xl mx-auto">
                        <PromptBox
                            ref={inputRef}
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
