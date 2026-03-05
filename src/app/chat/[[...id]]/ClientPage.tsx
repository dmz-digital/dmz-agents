"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import {
    Send, Mic, Paperclip, Bot, User,
    Sparkles, ArrowLeft, MoreHorizontal,
    Music2, Code2, Paintbrush, ShieldCheck,
    Volume2, StopCircle, Play, Pause, Loader2,
    MessageSquare, Plus, Search, ChevronRight,
    Clock, Trash2, Menu, Heart, Copy, Reply,
    Check, Pencil, BookOpen, Target, Brain, Scale, Activity,
    CloudUpload, Maximize, X, FileCode, PanelLeftClose, PanelLeftOpen, Download, Layout
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { v4 as uuidv4 } from 'uuid';
import { PromptBox } from "@/components/ui/chatgpt-prompt-input";

function splitIntoParagraphMessages(content: string): string[] {
    const parts: string[] = [];
    let currentPart = "";
    let inCodeBlock = false;
    let inList = false;

    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        if (line.trim().startsWith("```")) {
            inCodeBlock = !inCodeBlock;
        }

        const isListItem = /^[-*o•\d+]\s+(.*)/.test(line.trim());
        if (isListItem) inList = true;
        if (line.trim() === "") inList = false;

        currentPart += line + '\n';

        // Break at empty lines if outside code block/list
        if (line.trim() === "" && !inCodeBlock && !inList) {
            if (currentPart.trim()) {
                parts.push(currentPart.trim());
                currentPart = "";
            }
        }
    }
    if (currentPart.trim()) {
        parts.push(currentPart.trim());
    }

    // Group short parts for pacing
    const groupedParts: string[] = [];
    let currentGroup = "";
    for (const part of parts) {
        if (!currentGroup) {
            currentGroup = part;
        } else if (currentGroup.length + part.length < 400 && !part.includes("```")) {
            currentGroup += "\n\n" + part;
        } else {
            groupedParts.push(currentGroup);
            currentGroup = part;
        }
    }
    if (currentGroup) groupedParts.push(currentGroup);

    return groupedParts.length > 0 ? groupedParts : [content];
}

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
    audio_url?: string;
    file_url?: string;
    file_type?: string;
    file_name?: string;
    agent_id?: string;
    agent?: {
        handle: string;
        name: string;
        color: string;
    };
    created_at: Date;
    isTyping?: boolean;
    feedback?: string | null;
    db_id?: string; // real DB id for feedback updates
}

interface ChatSession {
    session_id: string;
    title: string;
    last_message: string;
    created_at: Date;
}

const AGENT_MAP: Record<string, any> = {
    orchestrator: { name: "ORCH", handle: "orch", color: "#E85D2F", icon: Music2 },
    developer: { name: "Ryan", handle: "ryan", color: "#0891B2", icon: Code2 },
    design_chief: { name: "Aurora", handle: "aurora", color: "#DB2777", icon: Paintbrush },
    legal_chief: { name: "Theron", handle: "theron", color: "#DC2626", icon: ShieldCheck },
    copy_chief: { name: "Cassandra", handle: "cassandra", color: "#7C3AED", icon: BookOpen },
    ux: { name: "Victoria", handle: "victoria", color: "#EC4899", icon: Paintbrush },
    po: { name: "Lucas", handle: "lucas", color: "#2563EB", icon: Target },
    db_sage: { name: "Sofia", handle: "sofia", color: "#0369A1", icon: Activity },
    analyst: { name: "Kanya", handle: "kanya", color: "#D97706", icon: Brain },
    pm: { name: "José", handle: "jose", color: "#2563EB", icon: Target },
    qa: { name: "Emma", handle: "emma", color: "#059669", icon: ShieldCheck },
    architect: { name: "Alex", handle: "alex", color: "#0891B2", icon: Code2 },
    devops: { name: "Oliver", handle: "oliver", color: "#0891B2", icon: Code2 },
    squad_manager: { name: "Syd", handle: "syd", color: "#7C3AED", icon: Music2 },
    cyber_chief: { name: "Constantine", handle: "constantine", color: "#DC2626", icon: ShieldCheck },
};

// Aliases for the frontend to handle legacy/backend handle names
const AGENT_HANDLE_TO_ID: Record<string, string> = {
    orch: "orchestrator", orchestrator: "orchestrator",
    ryan: "developer", developer: "developer",
    aurora: "design_chief", design_chief: "design_chief",
    theron: "legal_chief", legal_chief: "legal_chief",
    cassandra: "copy_chief", copy_chief: "copy_chief",
    victoria: "ux", ux: "ux",
    lucas: "po", po: "po",
    sofia: "db_sage", db_sage: "db_sage",
    kanya: "analyst", analyst: "analyst",
    jose: "pm", pm: "pm",
    emma: "qa", qa: "qa",
    alex: "architect", architect: "architect",
    oliver: "devops", devops: "devops",
    syd: "squad_manager", squad_manager: "squad_manager",
    constantine: "cyber_chief", cyber_chief: "cyber_chief",
};

// Strips ALL markdown markers and renders as clean text
function stripMarkdown(text: string): string {
    if (!text) return "";
    let res = text
        // Remove artifacts first
        .replace(/<dmz_artifact[\s\S]*?(?:<\/dmz_artifact>|$)/gi, '')
        // Remove code blocks
        .replace(/```[\s\S]*?```/g, '')
        // Remove images: ![alt](url) -> "" 
        .replace(/!\[([^\]]*)\]\(([^)]+?)\)/g, '')
        // Remove links: [text](url) → text
        .replace(/\[([^\]]+?)\]\(([^)]+?)\)/g, '$1')
        // Remove headers: # ## ### etc.
        .replace(/^#{1,6}\s+/gm, '')
        // Remove bold+italic: ***text***
        .replace(/\*{3}(.+?)\*{3}/g, '$1')
        // Remove bold: **text**
        .replace(/\*{2}(.+?)\*{2}/g, '$1')
        // Remove italic: *text*
        .replace(/(?<!\w)\*([^*]+?)\*(?!\w)/g, '$1')
        .replace(/(?<!\w)_([^_]+?)_(?!\w)/g, '$1')
        // Remove horizontal rules
        .replace(/^[-*_]{3,}$/gm, '')
        // Remove list markers
        .replace(/^\d+\.\s+/gm, '')
        .replace(/^[-*•]\s+/gm, '')
        // Clean up
        .replace(/\s+/g, ' ')
        .trim();
    return res;
}

type ContentBlock =
    | { type: 'text'; text: string }
    | { type: 'image'; url: string; alt: string }
    | { type: 'code'; language: string; code: string }
    | { type: 'artifact'; artifactType: string; filename: string; title: string; content: string; url?: string };

function formatMessageBlocks(text: string): ContentBlock[] {
    const blocks: ContentBlock[] = [];
    // Use environment variable if available, otherwise fallback to known ref
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://mqqiyyxcoutbmuszwejz.supabase.co";

    // Pre-process: if an artifact is wrapped in ```html ... ```, unwrap it
    let processedText = text.replace(/```[a-z]*\s*\n*(<dmz_artifact[\s\S]*?(?:<\/dmz_artifact>|$))\n*\s*(?:```|$)/g, '$1');

    // Regex elements to capture sequentially
    // 1: Artifact
    // 7: Image Markdown (supports ![alt](url) or [alt](url) if it looks like image file)
    // 10: Code Block
    const blockRegex = /(<dmz_artifact\s+type="([^"]+)"\s+filename="([^"]+)"\s+title="([^"]+)"(?:.*?url="([^"]+)")?>([\s\S]*?)(?:<\/dmz_artifact>|$))|((?:!)?\[([^\]]*)\]\(([^)]+?\.(?:png|jpg|jpeg|gif|webp|svg|heic)(?:\?[^)]+)?)\))|(```(\w*)\n?([\s\S]*?)(?:```|$))/gi;

    let lastIndex = 0;
    let match;

    while ((match = blockRegex.exec(processedText)) !== null) {
        const precedingText = processedText.slice(lastIndex, match.index);
        const cleanText = stripMarkdown(precedingText);
        if (cleanText) {
            blocks.push({ type: 'text', text: cleanText });
        }

        if (match[1]) {
            // Artifact matched
            let innerContent = match[6].trim();
            if (innerContent.startsWith('```')) {
                const lines = innerContent.split('\n');
                if (lines[0].startsWith('```')) lines.shift();
                if (lines.length > 0 && lines[lines.length - 1].startsWith('```')) lines.pop();
                innerContent = lines.join('\n').trim();
            }

            blocks.push({
                type: 'artifact',
                artifactType: match[2],
                filename: match[3],
                title: match[4],
                url: match[5],
                content: innerContent
            });
        } else if (match[7]) {
            // Image Markdown matched: [!][alt](url.ext)
            const alt = match[8] || "Imagem";
            let url = (match[9] || "").trim();

            // Handle relative paths
            if (url && !url.startsWith("http") && !url.startsWith("data:")) {
                if (url.startsWith("/")) url = url.slice(1);
                // Prepend Supabase Storage public URL if it looks like a bucket path
                if (url.includes("storage/v1/object/public/")) {
                    url = `${supabaseUrl}/${url}`;
                } else if (!url.includes("/")) {
                    url = `${supabaseUrl}/storage/v1/object/public/images/${url}`;
                } else {
                    url = `${supabaseUrl}/storage/v1/object/public/${url}`;
                }
            }

            blocks.push({ type: 'image', url, alt });
        } else if (match[10]) {
            // Code Block matched
            const language = match[11] || 'text';
            const code = match[12].trim();
            if (code) {
                blocks.push({ type: 'code', language, code });
            }
        }
        lastIndex = match.index + match[0].length;
    }

    const remainingText = processedText.slice(lastIndex);
    const cleanRemaining = stripMarkdown(remainingText);
    if (cleanRemaining) {
        blocks.push({ type: 'text', text: cleanRemaining });
    }

    return blocks;
}

function ThinkingStatus() {
    const [step, setStep] = useState(0);
    const steps = [
        "Analisando contexto e intenção...",
        "Orquestrando o melhor agente...",
        "Agente assumindo o controle...",
        "Executando a tarefa..."
    ];

    useEffect(() => {
        const timers = [
            setTimeout(() => setStep(1), 2000),
            setTimeout(() => setStep(2), 4000),
            setTimeout(() => setStep(3), 6500)
        ];
        return () => timers.forEach(clearTimeout);
    }, []);

    return (
        <div className="flex flex-col gap-2.5 py-1.5 px-2">
            {steps.map((text, i) => {
                if (i > step) return null;
                return (
                    <motion.div
                        initial={{ opacity: 0, x: -5 }}
                        animate={{ opacity: 1, x: 0 }}
                        key={i}
                        className={`flex items-center gap-3 text-xs ${i === step ? "text-neutral-800 font-medium" : "text-neutral-400"}`}
                    >
                        {i === step ? (
                            <Loader2 size={12} className="animate-spin text-dmz-accent" />
                        ) : (
                            <Check size={12} className="text-green-500" />
                        )}
                        <span>{text}</span>
                    </motion.div>
                );
            })}
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
    const params = useParams();
    const router = useRouter();

    // Client-side fallback for static exports where params might be empty on first render
    const [currentSessionId, setCurrentSessionId] = useState<string | null>(() => {
        if (typeof window !== "undefined") {
            const parts = window.location.pathname.split("/").filter(Boolean);
            if (parts[0] === "chat" && parts[1]) {
                return parts[1];
            }
        }
        return Array.isArray(params?.id) ? params.id[0] : (params?.id as string) || null;
    });

    const [messages, setMessages] = useState<Message[]>([]);
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [loading, setLoading] = useState(true);

    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
    const [editingTitle, setEditingTitle] = useState("");
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [previewHtml, setPreviewHtml] = useState<string | null>(null);
    const [previewMode, setPreviewMode] = useState<'visual' | 'code'>('visual');
    const [previewWidth, setPreviewWidth] = useState(50); // percentage
    const isDraggingRef = useRef(false);
    const dragStartXRef = useRef(0);
    const dragStartWidthRef = useRef(50);

    const [userProfile, setUserProfile] = useState<any>(null);
    const [isThinking, setIsThinking] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    // Initial effect for basic setup
    useEffect(() => {
        document.title = "Chat de Projetos | DMZ - OS Agents";
        loadInitialData();
        setTimeout(() => inputRef.current?.focus(), 100);
    }, []);

    // Ensure the session ID is set and URL is synced avoiding infinite loops
    useEffect(() => {
        if (!currentSessionId) {
            // Generate a fresh ID uniquely once if genuinely missing
            const newId = uuidv4();
            setCurrentSessionId(newId);
            window.history.replaceState(null, '', `/chat/${newId}`);
        } else {
            // If we have params later from Next.js hydration, sync it if needed
            let routeId = Array.isArray(params?.id) ? params.id[0] : (params?.id as string);
            if (routeId && routeId !== currentSessionId) {
                // If the user actually navigated via Next.js router
                // (e.g., clicking on a session in the sidebar)
                // then currentSessionId should update to match
                setCurrentSessionId(routeId);
            }
        }
    }, [params, currentSessionId]);

    // Force URL synchronization for masked domains/iframes
    useEffect(() => {
        if (currentSessionId) {
            const expectedPath = `/chat/${currentSessionId}`;
            if (window.location.pathname !== expectedPath) {
                try {
                    window.history.replaceState(null, '', expectedPath);
                } catch (e) {
                    console.warn("Failed to update history state:", e);
                }
            }
        }
    }, [currentSessionId]);

    // Effect to load history when session changes
    useEffect(() => {
        if (currentSessionId) {
            loadHistory(currentSessionId);
        }
    }, [currentSessionId]);

    useEffect(() => {
        const timer = setTimeout(async () => {
            if (searchQuery.length < 2) {
                setSearchResults([]);
                return;
            }
            setIsSearching(true);
            const { data } = await supabase
                .from('dmz_agents_chat')
                .select('session_id, content, created_at')
                .ilike('content', `%${searchQuery}%`)
                .order('created_at', { ascending: false })
                .limit(20);

            if (data) {
                const uniqueSessions: Record<string, any> = {};
                data.forEach(m => {
                    if (!uniqueSessions[m.session_id]) {
                        uniqueSessions[m.session_id] = {
                            session_id: m.session_id,
                            last_message: m.content,
                            created_at: m.created_at
                        };
                    }
                });
                setSearchResults(Object.values(uniqueSessions));
            }
            setIsSearching(false);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const loadInitialData = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profile } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', user.id)
            .single();
        if (profile) setUserProfile(profile);
        loadSessions(user.id);
    };

    const loadSessions = async (userId: string) => {
        const { data } = await supabase
            .from('dmz_agents_chat')
            .select('session_id, content, created_at')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (data) {
            const grouped: Record<string, ChatSession> = {};
            data.forEach(m => {
                if (!grouped[m.session_id]) {
                    const content = m.content || "Áudio enviado";
                    const cleanTitle = stripMarkdown(content);
                    grouped[m.session_id] = {
                        session_id: m.session_id,
                        title: cleanTitle.length > 50 ? cleanTitle.substring(0, 50) + "..." : (cleanTitle || "Nova Conversa"),
                        last_message: content,
                        created_at: new Date(m.created_at)
                    };
                }
            });
            setSessions(Object.values(grouped).sort((a, b) => b.created_at.getTime() - a.created_at.getTime()));
        }
    };

    const loadHistory = async (sessionId: string) => {
        setLoading(true);
        const { data } = await supabase
            .from('dmz_agents_chat')
            .select('*')
            .eq('session_id', sessionId)
            .order('created_at', { ascending: true });

        if (data && data.length > 0) {
            const formatted = data.map((m: any) => ({
                id: m.id,
                role: m.role,
                content: m.content || "",
                audio_url: m.audio_url || undefined,
                file_url: m.file_url || undefined,
                file_type: m.file_type || undefined,
                file_name: m.file_url ? decodeURIComponent((m.file_url as string).split('/').pop()?.replace(/^[a-f0-9-]+_/, '') || 'arquivo') : undefined,
                agent_id: m.agent_id,
                agent: m.agent_id ? {
                    handle: m.agent_id === "orchestrator" ? "orch" : (AGENT_MAP[m.agent_id]?.handle || m.agent_id),
                    name: AGENT_MAP[m.agent_id]?.name || m.agent_id.toUpperCase(),
                    color: AGENT_MAP[m.agent_id]?.color || "#6B7280"
                } : undefined,
                feedback: m.feedback || null,
                db_id: m.id,
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
        router.push(`/chat/${newId}`);
    };

    const copyMessage = (msg: Message) => {
        const clean = stripMarkdown(msg.content);
        navigator.clipboard.writeText(clean);
        setCopiedId(msg.id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const replyToMessage = (msg: Message) => {
        const clean = stripMarkdown(msg.content);
        const quote = clean.length > 120 ? clean.substring(0, 120) + "..." : clean;
        if (inputRef.current) {
            (inputRef.current as any).value = `> ${quote}\n\n`;
            inputRef.current.focus();
        }
    };

    const startEditingSession = (e: React.MouseEvent, s: ChatSession) => {
        e.stopPropagation();
        setEditingSessionId(s.session_id);
        setEditingTitle(s.title);
    };

    const saveSessionTitle = async (sessionId: string) => {
        if (!editingTitle.trim()) {
            setEditingSessionId(null);
            return;
        }
        setSessions(prev => prev.map(s => s.session_id === sessionId ? { ...s, title: editingTitle.trim() } : s));
        const { data } = await supabase
            .from('dmz_agents_chat')
            .select('id')
            .eq('session_id', sessionId)
            .order('created_at', { ascending: true })
            .limit(1);
        if (data && data[0]) {
            await supabase.from('dmz_agents_chat').update({ metadata: { title: editingTitle.trim() } }).eq('id', data[0].id);
        }
        setEditingSessionId(null);
    };

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const saveMessage = async (msg: Partial<Message>) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || !currentSessionId) return;

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

        if (error) return null;

        const { data: { publicUrl } } = supabase.storage
            .from(bucket)
            .getPublicUrl(fileName);

        return { url: publicUrl, type: effectiveMime, isAudio, isImage };
    };

    const handleSend = async (payload?: string | { text: string, audioUrl?: string, fileUrl?: string, fileType?: string, fileName?: string, toolId?: string | null }) => {
        let text = "";
        let audioUrl = "";
        let fileUrl = "";
        let fileType = "";
        let fileName = "";
        let toolId = null;

        if (typeof payload === 'string') {
            text = payload;
        } else if (payload && typeof payload === 'object') {
            text = payload.text;
            audioUrl = payload.audioUrl || "";
            fileUrl = payload.fileUrl || "";
            fileType = payload.fileType || "";
            fileName = payload.fileName || "";
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
            file_name: fileName,
            created_at: new Date()
        };

        const newMessages = [...messages, userMsg];
        setMessages(newMessages);
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
                    file_type: fileType || (audioUrl ? "audio/webm" : ""),
                    history: newMessages.map(m => ({ role: m.role, content: m.content }))
                }),
            });

            if (!response.ok) throw new Error("Falha ao obter resposta.");

            const data = await response.json();
            const responseAgent = data.agent_id || "orchestrator";
            const responseContent = data.content;
            const responseAgentID = AGENT_HANDLE_TO_ID[responseAgent] || "orchestrator";

            const paragraphParts = splitIntoParagraphMessages(responseContent);
            setIsThinking(false);

            for (let i = 0; i < paragraphParts.length; i++) {
                const aiMsg: Message = {
                    id: (Date.now() + i).toString(),
                    role: "assistant",
                    content: paragraphParts[i],
                    agent_id: responseAgentID,
                    agent: {
                        handle: responseAgent,
                        name: AGENT_MAP[responseAgentID]?.name || responseAgent.toUpperCase(),
                        color: AGENT_MAP[responseAgentID]?.color || "#6B7280"
                    },
                    created_at: new Date(),
                    isTyping: true
                };

                setMessages(prev => [...prev, aiMsg]);
                await saveMessage(aiMsg);
                if (i < paragraphParts.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }
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

            const tempMsg: Message = {
                id: `temp-${Date.now()}`,
                role: "user",
                content: text || (isAudioFile ? "" : `📎 ${file.name}`),
                created_at: new Date()
            };
            if (!isAudioFile || text) {
                setMessages(prev => [...prev, tempMsg]);
            }
            setIsThinking(true);

            const uploadResult = await uploadFile(file);
            if (!uploadResult) {
                setIsThinking(false);
                return;
            }

            handleSend({
                text: text || (uploadResult.isAudio ? "" : `📎 ${file.name}`),
                fileUrl: uploadResult.url,
                fileType: uploadResult.type,
                fileName: file.name,
                toolId
            });
        } else {
            handleSend({ text, toolId });
        }
    };

    const getUserInitials = () => {
        if (!userProfile?.full_name) return "US";
        return userProfile.full_name.split(" ").map((n: string) => n[0]).join("").toUpperCase().substring(0, 2);
    };

    if (!currentSessionId) return null;

    // Drag handlers for the splitter
    const handleSplitterMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        isDraggingRef.current = true;
        dragStartXRef.current = e.clientX;
        dragStartWidthRef.current = previewWidth;
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';

        const handleMouseMove = (ev: MouseEvent) => {
            if (!isDraggingRef.current) return;
            const containerWidth = window.innerWidth;
            const deltaX = ev.clientX - dragStartXRef.current;
            // Moving left = increase preview, moving right = decrease preview
            const deltaPct = (deltaX / containerWidth) * 100;
            const newWidth = Math.min(80, Math.max(25, dragStartWidthRef.current - deltaPct));
            setPreviewWidth(newWidth);
        };

        const handleMouseUp = () => {
            isDraggingRef.current = false;
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    return (
        <div className="flex h-screen bg-[#FDFDFD] overflow-hidden">
            {/* Sidebar */}
            <AnimatePresence>
                {sidebarOpen && (
                    <motion.aside
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: 320, opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        className="absolute md:relative z-50 h-full bg-white border-r border-neutral-100 flex flex-col shrink-0 overflow-hidden shadow-2xl md:shadow-none"
                    >
                        <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
                            <Link href="/app" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                                <div className="w-8 h-8 bg-white border border-neutral-100 rounded-lg flex items-center justify-center p-1.5">
                                    <Bot size={18} className="text-neutral-500" />
                                </div>
                                <span className="font-extrabold text-[#D8663E] text-sm tracking-tight">DMZ – OS Agents</span>
                            </Link>
                            <div className="flex items-center gap-1">
                                <button onClick={() => setIsSearchOpen(true)} className="p-2 hover:bg-neutral-50 rounded-xl text-neutral-400 group transition-all" title="Buscar">
                                    <Search size={18} className="group-hover:text-dmz-accent transition-colors" />
                                </button>
                                <button onClick={createNewSession} className="p-2 hover:bg-neutral-50 rounded-xl text-neutral-400 group transition-all" title="Nova Conversa">
                                    <Plus size={20} className="group-hover:text-dmz-accent transition-colors" />
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto px-4 pb-8 space-y-2 custom-scrollbar">
                            <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest px-2 mb-4 mt-6">Histórico de Projetos</h4>
                            {sessions.map((s) => (
                                <div
                                    key={s.session_id}
                                    onClick={() => {
                                        setCurrentSessionId(s.session_id);
                                        router.push(`/chat/${s.session_id}`);
                                    }}
                                    className={`w-full p-4 rounded-2xl text-left border transition-all group relative cursor-pointer ${s.session_id === currentSessionId
                                        ? "bg-white border-dmz-accent/20"
                                        : "bg-neutral-50 border-transparent group-hover:bg-white group-hover:border-neutral-200"
                                        }`}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <div className="flex items-center gap-2 truncate flex-1 min-w-0">
                                            <MessageSquare size={14} className={`shrink-0 ${s.session_id === currentSessionId ? "text-dmz-accent" : "text-neutral-300"}`} />
                                            {editingSessionId === s.session_id ? (
                                                <input
                                                    autoFocus
                                                    type="text"
                                                    value={editingTitle}
                                                    onChange={(e) => setEditingTitle(e.target.value)}
                                                    onBlur={() => saveSessionTitle(s.session_id)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') saveSessionTitle(s.session_id);
                                                        if (e.key === 'Escape') setEditingSessionId(null);
                                                    }}
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="text-xs font-bold text-neutral-900 bg-neutral-50 border border-neutral-200 rounded-lg px-2 py-0.5 flex-1 min-w-0 outline-none focus:border-dmz-accent/40"
                                                />
                                            ) : (
                                                <span
                                                    className={`text-xs font-bold truncate ${s.session_id === currentSessionId ? "text-neutral-900" : "text-neutral-500"}`}
                                                    onDoubleClick={(e) => startEditingSession(e as any, s)}
                                                >
                                                    {s.title}
                                                </span>
                                            )}
                                        </div>
                                        {editingSessionId !== s.session_id && (
                                            <button
                                                onClick={(e) => startEditingSession(e, s)}
                                                className="p-1 rounded-md opacity-0 group-hover:opacity-100 hover:bg-neutral-100 transition-all text-neutral-300 hover:text-neutral-500"
                                                title="Renomear"
                                            >
                                                <Pencil size={11} />
                                            </button>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 text-[9px] text-neutral-400 font-medium">
                                        <Clock size={10} />
                                        {new Date(s.created_at).toLocaleDateString()} • {new Date(s.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {userProfile && (
                            <div className="p-6 border-t border-neutral-100">
                                <Link href="/app/profile" className="flex items-center gap-3 group">
                                    <div className="w-10 h-10 rounded-2xl overflow-hidden bg-neutral-100 flex items-center justify-center border border-neutral-200 shrink-0">
                                        {userProfile?.avatar_url ? (
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

            {/* Main Content Wrapper */}
            <div className="flex-1 flex overflow-hidden min-w-0">
                {/* Main Chat Area */}
                <main
                    className="flex flex-col relative h-full min-w-0 bg-white shadow-sm shrink-0"
                    style={{ width: previewHtml ? `calc(${100 - previewWidth}% - 2px)` : '100%' }}
                >
                    {/* Header */}
                    <div className="h-16 border-b border-neutral-100 px-6 flex items-center justify-between shrink-0 bg-white/80 backdrop-blur-md sticky top-0 z-30">
                        <div className="flex items-center gap-4 min-w-0">
                            <button
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                className="p-2 hover:bg-neutral-50 rounded-xl text-neutral-400 transition-colors"
                            >
                                {sidebarOpen ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
                            </button>
                            <div className="h-4 w-[1px] bg-neutral-100 md:block hidden" />
                            <h2 className="text-sm font-bold text-neutral-900 truncate tracking-tight">
                                {sessions.find(s => s.session_id === currentSessionId)?.title || "Nova Conversa"}
                            </h2>
                        </div>
                    </div>

                    {/* Messages Container */}
                    <div
                        ref={scrollRef}
                        className="flex-1 overflow-y-auto px-6 py-8 pb-32 custom-scrollbar scroll-smooth"
                    >
                        <div className="max-w-3xl mx-auto space-y-12">
                            {messages.map((msg, i) => {
                                const isUser = msg.role === "user";
                                const agent = msg.agent;

                                return (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        key={msg.id}
                                        className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
                                    >
                                        <div className={`flex gap-4 max-w-[85%] ${isUser ? "flex-row-reverse" : "flex-row"}`}>
                                            <div className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center border shadow-sm ${isUser ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-100"}`}>
                                                {isUser ? <User size={16} className="text-white" /> : <Bot size={16} style={{ color: agent?.color || '#D8663E' }} />}
                                            </div>

                                            <div className="flex flex-col gap-2 min-w-0">
                                                <div className="flex items-center gap-2 px-1">
                                                    <span className="text-[10px] font-black text-neutral-900 uppercase tracking-wider">
                                                        {isUser ? "Você" : agent?.name || "Assistente"}
                                                    </span>
                                                    {!isUser && agent?.handle && (
                                                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-neutral-100 text-neutral-500">
                                                            @{agent.handle}
                                                        </span>
                                                    )}
                                                    <span className="text-[9px] text-neutral-300 font-medium">
                                                        {msg.created_at.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>

                                                <div className={`relative px-5 py-4 rounded-[24px] ${isUser ? "bg-neutral-900 text-white shadow-lg shadow-neutral-900/10" : "bg-white border border-neutral-100 text-neutral-800"}`}>
                                                    <div className="space-y-4">
                                                        {!isUser && msg.isTyping && i === messages.length - 1 ? (
                                                            <TypingMessage text={msg.content} onComplete={() => {
                                                                setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, isTyping: false } : m));
                                                            }} />
                                                        ) : (
                                                            <>
                                                                {formatMessageBlocks(msg.content).map((block, bi) => {
                                                                    if (block.type === 'text') {
                                                                        const lines = block.text.split('\n').filter(l => l.trim().length > 0);
                                                                        return (
                                                                            <div key={bi} className="space-y-3">
                                                                                {lines.map((l, li) => <p key={li} className="leading-relaxed text-[13px] sm:text-[14px]">{l}</p>)}
                                                                            </div>
                                                                        );
                                                                    }
                                                                    if (block.type === 'image') {
                                                                        return (
                                                                            <div key={bi} className="my-4 rounded-2xl overflow-hidden border border-neutral-100 group relative">
                                                                                <img src={block.url} alt={block.alt} title={block.url} className="w-full h-auto max-h-[400px] object-contain bg-neutral-50" />
                                                                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                                                                    <a href={block.url} target="_blank" rel="noreferrer" className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-neutral-500 hover:text-dmz-accent shadow-xl flex items-center gap-1.5 transition-all active:scale-95 border border-neutral-100">
                                                                                        <Maximize size={10} />
                                                                                        Ver original
                                                                                    </a>
                                                                                </div>
                                                                            </div>
                                                                        );
                                                                    }
                                                                    if (block.type === 'code') {
                                                                        return (
                                                                            <div key={bi} className="my-6 rounded-2xl overflow-hidden border border-neutral-200 bg-[#1E1E1E] shadow-xl group">
                                                                                <div className="px-4 py-2 border-b border-white/5 bg-white/5 flex items-center justify-between">
                                                                                    <div className="flex items-center gap-2">
                                                                                        <FileCode size={12} className="text-white/40" />
                                                                                        <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{block.language}</span>
                                                                                    </div>
                                                                                    <button
                                                                                        onClick={() => navigator.clipboard.writeText(block.code)}
                                                                                        className="p-1 hover:bg-white/10 rounded-md transition-all"
                                                                                    >
                                                                                        <Copy size={12} className="text-white/40 hover:text-white" />
                                                                                    </button>
                                                                                </div>
                                                                                <pre className="p-4 overflow-x-auto custom-scrollbar">
                                                                                    <code className="text-xs text-neutral-200 font-mono leading-relaxed">{block.code}</code>
                                                                                </pre>
                                                                            </div>
                                                                        );
                                                                    }
                                                                    if (block.type === 'artifact') {
                                                                        const isHtml = block.artifactType === 'html' || block.filename.endsWith('.html');
                                                                        return (
                                                                            <div key={bi} className="my-6 border border-neutral-200 rounded-[28px] overflow-hidden bg-white shadow-xl shadow-neutral-100/50 group/art">
                                                                                <div className="p-5 flex items-center justify-between border-b border-neutral-50 bg-neutral-50/50">
                                                                                    <div className="flex items-center gap-4 min-w-0">
                                                                                        <div className="w-10 h-10 rounded-2xl bg-white border border-neutral-100 flex items-center justify-center text-dmz-accent shadow-sm">
                                                                                            {isHtml ? <Layout size={20} /> : <FileCode size={20} />}
                                                                                        </div>
                                                                                        <div className="min-w-0">
                                                                                            <div className="text-[13px] font-black text-neutral-900 truncate tracking-tight">{block.title}</div>
                                                                                            <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">{block.filename}</div>
                                                                                        </div>
                                                                                    </div>
                                                                                    <div className="flex items-center gap-2">
                                                                                        {isHtml && (
                                                                                            <button
                                                                                                onClick={() => {
                                                                                                    setPreviewHtml(block.content);
                                                                                                    setPreviewMode('visual');
                                                                                                }}
                                                                                                className="px-4 py-2 bg-neutral-900 hover:bg-black text-white rounded-xl text-[11px] font-black flex items-center gap-2 transition-all shadow-lg active:scale-95"
                                                                                            >
                                                                                                <Maximize size={12} />
                                                                                                Visualizar
                                                                                            </button>
                                                                                        )}
                                                                                        <button
                                                                                            onClick={() => {
                                                                                                const blob = new Blob([block.content], { type: 'text/plain' });
                                                                                                const url = URL.createObjectURL(blob);
                                                                                                const a = document.createElement('a');
                                                                                                a.href = url;
                                                                                                a.download = block.filename;
                                                                                                a.click();
                                                                                                URL.revokeObjectURL(url);
                                                                                            }}
                                                                                            className="p-2 border border-neutral-200 hover:bg-neutral-50 rounded-xl text-neutral-500 transition-all active:scale-90"
                                                                                            title="Download"
                                                                                        >
                                                                                            <Download size={16} />
                                                                                        </button>
                                                                                    </div>
                                                                                </div>
                                                                                <div className="p-4 bg-neutral-50/30">
                                                                                    <div className="bg-[#1e1e1e] rounded-2xl p-4 overflow-hidden border border-neutral-200">
                                                                                        <pre className="text-[11px] text-neutral-300 font-mono whitespace-pre-wrap line-clamp-[10] scrollbar-hide">
                                                                                            {block.content}
                                                                                        </pre>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        );
                                                                    }
                                                                    return null;
                                                                })}
                                                            </>
                                                        )}
                                                    </div>

                                                    {msg.audio_url && <div className="mt-4"><AudioPlayer url={msg.audio_url} isUser={isUser} /></div>}

                                                    <div className={`absolute bottom-[-28px] ${isUser ? 'right-2' : 'left-2'} flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity`}>
                                                        <button
                                                            onClick={() => copyMessage(msg)}
                                                            className="p-1 rounded-md hover:bg-neutral-100 transition-all cursor-pointer"
                                                            title="Copiar"
                                                        >
                                                            {copiedId === msg.id ? (
                                                                <Check size={12} className="text-green-500" />
                                                            ) : (
                                                                <Copy size={12} className="text-neutral-400 hover:text-neutral-600" />
                                                            )}
                                                        </button>
                                                        {(formatMessageBlocks(msg.content).some(b => b.type === 'artifact' || b.type === 'image') || msg.file_url) ? (
                                                            <button
                                                                onClick={async () => {
                                                                    const forceDownload = async (url: string, filename: string) => {
                                                                        try {
                                                                            const resp = await fetch(url);
                                                                            const blob = await resp.blob();
                                                                            const blobUrl = URL.createObjectURL(blob);
                                                                            const a = document.createElement('a');
                                                                            a.href = blobUrl;
                                                                            a.download = filename;
                                                                            document.body.appendChild(a);
                                                                            a.click();
                                                                            document.body.removeChild(a);
                                                                            URL.revokeObjectURL(blobUrl);
                                                                        } catch {
                                                                            // Fallback: open with download hint
                                                                            const a = document.createElement('a');
                                                                            a.href = url;
                                                                            a.download = filename;
                                                                            a.setAttribute('download', filename);
                                                                            document.body.appendChild(a);
                                                                            a.click();
                                                                            document.body.removeChild(a);
                                                                        }
                                                                    };

                                                                    if (msg.file_url) {
                                                                        const ext = msg.file_url.split('.').pop()?.split('?')[0] || 'file';
                                                                        await forceDownload(msg.file_url, msg.file_name || `download.${ext}`);
                                                                        return;
                                                                    }
                                                                    const block = formatMessageBlocks(msg.content).find(b => b.type === 'artifact' || b.type === 'image');
                                                                    if (!block) return;
                                                                    if (block.type === 'artifact') {
                                                                        const blob = new Blob([block.content], { type: 'text/html' });
                                                                        const url = URL.createObjectURL(blob);
                                                                        const a = document.createElement('a');
                                                                        a.href = url;
                                                                        a.download = block.filename || 'artifact.html';
                                                                        document.body.appendChild(a);
                                                                        a.click();
                                                                        document.body.removeChild(a);
                                                                        URL.revokeObjectURL(url);
                                                                    } else if (block.type === 'image') {
                                                                        await forceDownload(block.url, `image-${Date.now()}.png`);
                                                                    }
                                                                }}
                                                                className="p-1 rounded-md hover:bg-neutral-100 transition-all cursor-pointer"
                                                                title="Baixar"
                                                            >
                                                                <Download size={12} className="text-neutral-400 hover:text-neutral-600" />
                                                            </button>
                                                        ) : (
                                                            <button
                                                                onClick={() => replyToMessage(msg)}
                                                                className="p-1 rounded-md hover:bg-neutral-100 transition-all cursor-pointer"
                                                                title="Responder"
                                                            >
                                                                <Reply size={12} className="text-neutral-400 hover:text-neutral-600" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}

                            {isThinking && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4">
                                    <div className="w-8 h-8 rounded-xl bg-orange-50/50 flex items-center justify-center border border-dmz-accent/10">
                                        <Sparkles size={16} className="text-dmz-accent" />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <span className="text-[10px] font-black text-neutral-600 uppercase tracking-widest px-1">Orquestrador</span>
                                        <div className="bg-neutral-50/30 border border-neutral-100 rounded-[24px] p-2 min-w-[240px]">
                                            <ThinkingStatus />
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 p-6 z-40">
                        <div className="max-w-3xl mx-auto">
                            <PromptBox onSend={handlePromptSend} />
                        </div>
                    </div>
                </main>

                <AnimatePresence>
                    {isSearchOpen && (
                        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-24 px-6 md:px-0 bg-white/20 backdrop-blur-md">
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                className="w-full max-w-2xl bg-white rounded-[32px] shadow-[0_32px_128px_-16px_rgba(0,0,0,0.1)] border border-neutral-100 overflow-hidden"
                            >
                                <div className="p-4 border-b border-neutral-100 flex items-center gap-4">
                                    <Search className="text-neutral-400 ml-2" size={20} />
                                    <input
                                        autoFocus
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Buscar em todas as conversas..."
                                        className="flex-1 bg-transparent py-4 outline-none text-neutral-800 font-medium"
                                    />
                                    <button onClick={() => setIsSearchOpen(false)} className="p-2 hover:bg-neutral-100 rounded-xl text-neutral-400">
                                        <X size={20} />
                                    </button>
                                </div>
                                <div className="max-h-[400px] overflow-y-auto p-4 space-y-2">
                                    {isSearching ? (
                                        <div className="p-8 text-center text-neutral-400">Buscando na memória...</div>
                                    ) : searchResults.length > 0 ? (
                                        searchResults.map(res => (
                                            <div
                                                key={res.session_id}
                                                onClick={() => {
                                                    router.push(`/chat/${res.session_id}`);
                                                    setIsSearchOpen(false);
                                                }}
                                                className="p-4 rounded-2xl hover:bg-neutral-50 cursor-pointer border border-transparent hover:border-neutral-100 transition-all group"
                                            >
                                                <div className="flex justify-between items-center mb-1">
                                                    <div className="flex items-center gap-2">
                                                        <MessageSquare size={14} className="text-dmz-accent" />
                                                        <span className="text-xs font-black text-neutral-900 tracking-tight">Sessão {res.session_id.substring(0, 8)}</span>
                                                    </div>
                                                    <span className="text-[10px] text-neutral-400">{new Date(res.created_at).toLocaleDateString()}</span>
                                                </div>
                                                <p className="text-xs text-neutral-500 line-clamp-2 italic">&quot;{res.last_message}&quot;</p>
                                            </div>
                                        ))
                                    ) : searchQuery.length > 1 ? (
                                        <div className="p-8 text-center text-neutral-400">Nenhum resultado encontrado.</div>
                                    ) : (
                                        <div className="p-8 text-center text-neutral-400">Digite para buscar no rastro de IA...</div>
                                    )}
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* Draggable Splitter + Preview Panel */}
                {previewHtml && (
                    <>
                        {/* Splitter Handle */}
                        <div
                            onMouseDown={handleSplitterMouseDown}
                            className="w-[2px] h-full shrink-0 bg-neutral-200 relative group z-50"
                            style={{ cursor: 'col-resize' }}
                        >
                            <div className="absolute inset-y-0 -left-[4px] -right-[4px]" style={{ cursor: 'col-resize' }} />
                        </div>

                        {/* Preview Panel */}
                        <div className="h-full flex flex-col bg-white shrink-0 shadow-[-4px_0_24px_-12px_rgba(0,0,0,0.1)]" style={{ width: `${previewWidth}%` }}>
                            <div className="h-16 border-b border-neutral-100 px-6 flex items-center justify-between bg-white shrink-0">
                                <div className="flex items-center gap-6">
                                    <h3 className="text-sm font-black text-neutral-900 tracking-tight flex items-center gap-3">
                                        <Layout size={18} className="text-dmz-accent" />
                                        Visualização
                                    </h3>
                                    <div className="flex bg-neutral-100 p-1 rounded-xl">
                                        <button
                                            onClick={() => setPreviewMode('visual')}
                                            className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${previewMode === 'visual' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-400 hover:text-neutral-600'}`}
                                        >
                                            •• Preview
                                        </button>
                                        <button
                                            onClick={() => setPreviewMode('code')}
                                            className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${previewMode === 'code' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-400 hover:text-neutral-600'}`}
                                        >
                                            &lt;/&gt; Código
                                        </button>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setPreviewHtml(null)}
                                    className="w-10 h-10 rounded-2xl bg-neutral-100 flex items-center justify-center text-neutral-500 hover:bg-neutral-200 hover:text-neutral-900 transition-all active:scale-95 shadow-sm"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="flex-1 overflow-hidden bg-neutral-50 p-4">
                                {previewMode === 'visual' ? (
                                    <div className="w-full h-full bg-white rounded-2xl overflow-hidden border border-neutral-100 shadow-xl relative">
                                        <iframe
                                            srcDoc={`
                                            <!DOCTYPE html>
                                            <html>
                                                <head>
                                                    <meta charset="utf-8">
                                                    <meta name="viewport" content="width=device-width, initial-scale=1">
                                                    <script src="https://unpkg.com/@tailwindcss/browser@4"></script>
                                                    <style>
                                                        body { margin: 0; padding: 0 }
                                                        ::-webkit-scrollbar { width: 8px; }
                                                        ::-webkit-scrollbar-track { background: #f9fafb; }
                                                        ::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 4px; }
                                                        ::-webkit-scrollbar-thumb:hover { background: #d1d5db; }
                                                    </style>
                                                </head>
                                                <body>${previewHtml}</body>
                                            </html>
                                        `}
                                            className="w-full h-full border-none"
                                            title="Preview"
                                        />
                                    </div>
                                ) : (
                                    <div className="w-full h-full bg-[#1e1e1e] rounded-2xl overflow-hidden border border-neutral-800 shadow-xl p-6 font-mono text-[13px] text-neutral-300 overflow-y-auto whitespace-pre-wrap custom-scrollbar">
                                        {previewHtml}
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

function TypingMessage({ text, onComplete }: { text: string; onComplete?: () => void }) {
    const [displayed, setDisplayed] = useState('');
    const [done, setDone] = useState(false);
    const cleanText = stripMarkdown(text);
    useEffect(() => {
        if (done) return;
        let i = 0;
        const speed = Math.max(8, Math.min(25, 1200 / (cleanText.length || 1)));
        const timer = setInterval(() => {
            i++;
            setDisplayed(cleanText.slice(0, i));
            if (i >= cleanText.length) {
                clearInterval(timer);
                setDone(true);
                onComplete?.();
            }
        }, speed);
        return () => clearInterval(timer);
    }, [cleanText, done, onComplete]);
    const lines = displayed.split('\n').filter(l => l.trim().length > 0);
    return (
        <div className="space-y-3">
            {lines.map((line, i) => (
                <p key={i} className="leading-relaxed text-[13px] sm:text-[14px]">{line}{!done && i === lines.length - 1 && (
                    <span className="inline-block w-0.5 h-4 bg-neutral-400 ml-0.5 animate-pulse align-text-bottom" />
                )}</p>
            ))}
        </div>
    );
}
