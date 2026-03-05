"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
    Send, Mic, Paperclip, Bot, User,
    Sparkles, ArrowLeft, MoreHorizontal,
    Music2, Code2, Paintbrush, ShieldCheck,
    Volume2, StopCircle, Play, Pause, Loader2,
    MessageSquare, Plus, Search, ChevronRight,
    Clock, Trash2, Menu, Heart, Copy, Reply,
    Check, Pencil, BookOpen, Target, Brain, Scale, Activity,
    CloudUpload
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

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
    return text
        // Remove headers: # ## ### etc.
        .replace(/^#{1,6}\s+/gm, '')
        // Remove horizontal rules: --- or ***
        .replace(/^[-*_]{3,}$/gm, '')
        // Remove bold+italic: ***text*** or ___text___
        .replace(/\*{3}(.+?)\*{3}/g, '$1')
        .replace(/_{3}(.+?)_{3}/g, '$1')
        // Remove bold: **text** or __text__
        .replace(/\*{2}(.+?)\*{2}/g, '$1')
        .replace(/_{2}(.+?)_{2}/g, '$1')
        // Remove italic: *text* or _text_
        .replace(/(?<!\w)\*([^*]+?)\*(?!\w)/g, '$1')
        .replace(/(?<!\w)_([^_]+?)_(?!\w)/g, '$1')
        // Remove inline code: `text`
        .replace(/`([^`]+?)`/g, '$1')
        // Remove links: [text](url) → text
        .replace(/\[([^\]]+?)\]\([^)]+?\)/g, '$1')
        // Remove images: ![alt](url)
        .replace(/!\[([^\]]*)\]\([^)]+?\)/g, '$1')
        // Remove blockquotes: > text
        .replace(/^>\s?/gm, '')
        // Remove numbered list prefixes: "1. "
        .replace(/^\d+\.\s+/gm, '')
        // Remove bullet prefixes: "- ", "* ", "• "
        .replace(/^[-*•]\s+/gm, '')
        // Clean up extra whitespace
        .replace(/\n{3,}/g, '\n\n');
}

// Extract inline images from markdown before stripping
function extractImages(text: string): { url: string; alt: string }[] {
    const imgs: { url: string; alt: string }[] = [];
    const re = /!\[([^\]]*)\]\(([^)]+)\)/g;
    let m;
    while ((m = re.exec(text)) !== null) {
        imgs.push({ alt: m[1], url: m[2] });
    }
    return imgs;
}

type ContentBlock =
    | { type: 'text'; text: string }
    | { type: 'image'; url: string; alt: string }
    | { type: 'code'; language: string; code: string };

function formatMessageBlocks(text: string): ContentBlock[] {
    const blocks: ContentBlock[] = [];
    const images = extractImages(text);

    // Remove image markdown from text before processing
    let remaining = text.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '');

    // Split by code blocks (```language\n...\n```)
    const codeBlockRegex = /```(\w*)\n?([\s\S]*?)```/g;
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(remaining)) !== null) {
        // Text before code block
        const before = remaining.slice(lastIndex, match.index);
        const cleanBefore = stripMarkdown(before).trim();
        if (cleanBefore) {
            blocks.push({ type: 'text', text: cleanBefore });
        }

        // Code block itself
        const language = match[1] || 'text';
        const code = match[2].trim();
        if (code) {
            blocks.push({ type: 'code', language, code });
        }

        lastIndex = match.index + match[0].length;
    }

    // Remaining text after last code block
    const after = remaining.slice(lastIndex);
    const cleanAfter = stripMarkdown(after).trim();
    if (cleanAfter) {
        blocks.push({ type: 'text', text: cleanAfter });
    }

    // Append images at end
    for (const img of images) {
        blocks.push({ type: 'image', url: img.url, alt: img.alt });
    }
    return blocks;
}

function formatMessage(text: string): string[] {
    const cleaned = stripMarkdown(text);
    return cleaned
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);
}

// Typing effect component for assistant messages
function TypingMessage({ text, onComplete }: { text: string; onComplete?: () => void }) {
    const [displayed, setDisplayed] = useState('');
    const [done, setDone] = useState(false);
    const cleanText = stripMarkdown(text);

    useEffect(() => {
        if (done) return;
        let i = 0;
        const speed = Math.max(8, Math.min(25, 1200 / cleanText.length)); // adaptive speed
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
    }, [cleanText]);

    const lines = displayed.split('\n').filter(l => l.trim().length > 0);

    return (
        <div className="space-y-3">
            {lines.map((line, i) => (
                <p key={i} className="leading-relaxed">{line}{!done && i === lines.length - 1 && (
                    <span className="inline-block w-0.5 h-4 bg-neutral-400 ml-0.5 animate-pulse align-text-bottom" />
                )}</p>
            ))}
        </div>
    );
}

function ThinkingDots() {
    return (
        <div className="flex gap-1 px-2 py-1">
            {[0, 1, 2].map((i) => (
                <motion.div
                    key={i}
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1 }}
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: '#838485' }}
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
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
    const [editingTitle, setEditingTitle] = useState("");
    const [copiedId, setCopiedId] = useState<string | null>(null);

    useEffect(() => {
        const timer = setTimeout(async () => {
            if (searchQuery.length < 2) {
                setSearchResults([]);
                return;
            }

            setIsSearching(true);
            const { data, error } = await supabase
                .from('dmz_agents_chat')
                .select('session_id, content, created_at')
                .ilike('content', `%${searchQuery}%`)
                .order('created_at', { ascending: false })
                .limit(20);

            if (data) {
                // Unique by session, prefer last_message but keep snippet
                const uniqueSessions: Record<string, any> = {};
                data.forEach(m => {
                    if (!uniqueSessions[m.session_id]) {
                        uniqueSessions[m.session_id] = {
                            session_id: m.session_id,
                            last_message: m.content, // Show the match snippet
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
                    const content = m.content || "Áudio enviado";
                    grouped[m.session_id] = {
                        session_id: m.session_id,
                        title: content.length > 40 ? content.substring(0, 40) + "..." : content,
                        last_message: content,
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
        localStorage.setItem('dmz_chat_session', newId);
        setCurrentSessionId(newId);
    };

    // Like / Feedback toggle
    const toggleFeedback = async (msg: Message) => {
        const newFeedback = msg.feedback === 'like' ? null : 'like';
        // Update local state
        setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, feedback: newFeedback } : m));
        // Persist to DB
        if (msg.db_id) {
            await supabase.from('dmz_agents_chat').update({ feedback: newFeedback }).eq('id', msg.db_id);
        }
    };

    // Copy message to clipboard
    const copyMessage = (msg: Message) => {
        const clean = stripMarkdown(msg.content);
        navigator.clipboard.writeText(clean);
        setCopiedId(msg.id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    // Reply to a message — quote it and focus input
    const replyToMessage = (msg: Message) => {
        const clean = stripMarkdown(msg.content);
        const quote = clean.length > 120 ? clean.substring(0, 120) + "..." : clean;
        if (inputRef.current) {
            (inputRef.current as any).value = `> ${quote}\n\n`;
            inputRef.current.focus();
        }
    };

    // Session rename
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
        // Update local state
        setSessions(prev => prev.map(s => s.session_id === sessionId ? { ...s, title: editingTitle.trim() } : s));
        // Store title in metadata of first message in session
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
                    isTyping: true // Effect handles typing display
                };

                setMessages(prev => [...prev, aiMsg]);
                await saveMessage(aiMsg);

                // Small delay between simulated message sends for pacing
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

            // Show immediate user message (NOT for audio as per item 7)
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
                            agent_id: "orchestrator",
                            agent: AGENT_MAP.orchestrator,
                            created_at: new Date()
                        };
                        setMessages(prev => [...prev, errMsg]);
                        return;
                    }

                    // 5. Send transcription to /chat for agent response
                    setIsThinking(false);
                    const contextMessage = text
                        ? `${text}\n\n[Transcrição Interna do Áudio]:\n${transcription}`
                        : `[Transcrição Interna do Áudio]:\n${transcription}`;

                    await handleSend({
                        text: contextMessage,
                        audioUrl: uploadResult.url,
                        fileType: uploadResult.type,
                        toolId
                    });

                } catch (err) {
                    setIsThinking(false);
                    const errMsg: Message = {
                        id: Date.now().toString(),
                        role: "assistant",
                        content: "Erro ao transcrever o áudio. Tente novamente ou envie um arquivo menor.",
                        agent_id: "orchestrator",
                        agent: AGENT_MAP.orchestrator,
                        created_at: new Date()
                    };
                    setMessages(prev => [...prev, errMsg]);
                }
            } else {
                // Non-audio file: send directly
                setIsThinking(false);
                await handleSend({ text, fileUrl: uploadResult.url, fileType: uploadResult.type, fileName: file.name, toolId });
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
        <div className="flex h-screen bg-[#FDFDFD] font-jakarta overflow-hidden relative">
            {/* Sidebar Overlay for Mobile */}
            <AnimatePresence>
                {sidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSidebarOpen(false)}
                        className="md:hidden absolute inset-0 bg-neutral-900/40 z-40 backdrop-blur-sm"
                    />
                )}
            </AnimatePresence>

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
                                <div className="w-8 h-8 bg-white border border-neutral-100 rounded-lg flex items-center justify-center p-1.5 shadow-sm">
                                    <img src="/logo.svg" alt="Logo" className="w-full h-full" />
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

                        {/* Search Input Removed as per preference */}


                        <div className="flex-1 overflow-y-auto px-4 pb-8 space-y-2 custom-scrollbar">
                            <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest px-2 mb-4 mt-6">Histórico de Projetos</h4>
                            {sessions.map((s) => (
                                <div
                                    key={s.session_id}
                                    onClick={() => setCurrentSessionId(s.session_id)}
                                    className={`w-full p-4 rounded-2xl text-left border transition-all group relative cursor-pointer ${s.session_id === currentSessionId
                                        ? "bg-white border-dmz-accent/20 shadow-sm"
                                        : "bg-transparent border-transparent hover:bg-neutral-50"
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
                                        {new Date(s.created_at).toLocaleDateString()}
                                    </div>
                                </div>
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

            {/* Global Search Modal */}
            <AnimatePresence>
                {isSearchOpen && (
                    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsSearchOpen(false)}
                            className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -20 }}
                            className="relative w-full max-w-xl mx-4 bg-white rounded-3xl shadow-2xl border border-neutral-100 overflow-hidden flex flex-col max-h-[60vh]"
                        >
                            <div className="p-5 border-b border-neutral-50 flex items-center gap-4 bg-neutral-50/50">
                                <Search className="text-neutral-400" size={20} />
                                <input
                                    autoFocus
                                    type="text"
                                    placeholder="Buscar em conversas e títulos..."
                                    className="flex-1 bg-transparent border-none outline-none text-sm font-medium text-neutral-800 placeholder:text-neutral-400"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                {isSearching && <Loader2 className="animate-spin text-dmz-accent" size={16} />}
                                <button
                                    onClick={() => setIsSearchOpen(false)}
                                    className="text-[10px] font-black uppercase tracking-widest text-neutral-400 hover:text-neutral-600 transition-colors"
                                >
                                    Esc
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                                {searchQuery.length < 2 ? (
                                    <div className="flex flex-col items-center justify-center py-12 text-neutral-300">
                                        <Search size={40} className="mb-4 opacity-20" />
                                        <p className="text-xs font-bold uppercase tracking-widest">Digite para buscar</p>
                                    </div>
                                ) : searchResults.length > 0 ? (
                                    <div className="space-y-1">
                                        {searchResults.map((res) => (
                                            <button
                                                key={res.session_id}
                                                onClick={() => {
                                                    setCurrentSessionId(res.session_id);
                                                    setIsSearchOpen(false);
                                                    setSearchQuery("");
                                                }}
                                                className="w-full p-4 rounded-2xl text-left hover:bg-neutral-50 transition-all flex items-center gap-4 group"
                                            >
                                                <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center shrink-0 group-hover:bg-dmz-accent/10 transition-colors">
                                                    <MessageSquare size={18} className="text-neutral-400 group-hover:text-dmz-accent transition-colors" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-sm font-bold text-neutral-800 truncate mb-0.5">{res.last_message}</div>
                                                    <div className="text-[10px] text-neutral-400 font-medium">
                                                        Sessão: {res.session_id.slice(0, 8)} • {new Date(res.created_at).toLocaleDateString()}
                                                    </div>
                                                </div>
                                                <ChevronRight size={16} className="text-neutral-200 group-hover:text-neutral-400 transition-colors" />
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-12 text-neutral-300 font-jakarta">
                                        <p className="text-xs font-bold uppercase tracking-widest">Nenhum resultado encontrado</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Main Chat Content */}
            <div className="flex-1 flex flex-col h-full relative">
                <header className="px-4 md:px-6 py-4 border-b border-neutral-100 flex items-center justify-between bg-white/80 backdrop-blur-md z-20">
                    <div className="flex items-center gap-3 md:gap-4">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="md:hidden p-2 hover:bg-neutral-100 rounded-xl text-neutral-500 transition-colors"
                        >
                            <Menu size={20} />
                        </button>
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="hidden md:block p-2 hover:bg-neutral-100 rounded-xl text-neutral-500 transition-colors"
                        >
                            <ArrowLeft size={20} className={sidebarOpen ? "" : "rotate-180 transition-transform"} />
                        </button>
                        <div>
                            <h1 className="text-lg md:text-lg font-black text-neutral-900 tracking-tight">Chat de Projetos</h1>
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest hidden sm:inline-block">Squad Online</span>
                                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest sm:hidden">Online</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {userProfile && (
                            <Link href="/app/profile" className="md:hidden flex items-center justify-center w-8 h-8 rounded-full overflow-hidden bg-neutral-100 border-2 border-white shadow-sm shrink-0">
                                {userProfile.avatar_url ? (
                                    <img src={userProfile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-[10px] font-bold text-neutral-400">{getUserInitials()}</span>
                                )}
                            </Link>
                        )}
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
                                    <div className={`max-w-[85%] flex gap-4 group ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
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
                                        <div className="space-y-1.5 flex flex-col min-w-0">
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
                                            {/* File attachment indicator — outside bubble */}
                                            {msg.file_url && !msg.file_type?.startsWith("image/") && (
                                                <a
                                                    href={msg.file_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all hover:opacity-80 no-underline ${msg.role === "user" ? "self-end" : "self-start"
                                                        }`}
                                                >
                                                    <CloudUpload size={16} className="text-[#E85D2F]" />
                                                    <span className={msg.role === "user" ? "text-neutral-500" : "text-neutral-500"}>
                                                        {msg.file_name || msg.file_url.split('/').pop()?.replace(/^[a-f0-9-]+_/, '') || 'arquivo'}
                                                    </span>
                                                </a>
                                            )}
                                            <div className={`py-4 px-6 rounded-[28px] text-[15px] leading-relaxed transition-all min-w-0 max-w-full ${msg.role === "user"
                                                ? "bg-neutral-900 text-white rounded-tr-none border border-neutral-800"
                                                : "bg-[#F3F4F6] border border-neutral-100 text-neutral-800 rounded-tl-none"
                                                }`}>
                                                {msg.audio_url ? (
                                                    <div className="flex flex-col gap-3">
                                                        <AudioPlayer url={msg.audio_url} isUser={msg.role === "user"} />
                                                        {msg.content && !msg.content.includes("[Transcrição Interna do Áudio]:") && <p className={`pt-2 border-t italic ${msg.role === 'user' ? 'border-white/10 text-white/70' : 'border-neutral-100 text-neutral-500'}`}>{msg.content}</p>}
                                                    </div>
                                                ) : msg.file_url && msg.file_type?.startsWith("image/") ? (
                                                    <div className="flex flex-col gap-3 min-w-0">
                                                        <img src={msg.file_url} className="rounded-xl max-w-[250px] max-h-[300px] object-cover shadow-sm" alt="Anexo" />
                                                        {msg.content && <p className="break-words">{msg.content}</p>}
                                                    </div>
                                                ) : msg.role === "assistant" && msg.isTyping ? (
                                                    <TypingMessage
                                                        text={msg.content}
                                                        onComplete={() => {
                                                            setMessages(prev => prev.map(m =>
                                                                m.id === msg.id ? { ...m, isTyping: false } : m
                                                            ));
                                                        }}
                                                    />
                                                ) : (
                                                    <div className="space-y-3 min-w-0 max-w-full">
                                                        {formatMessageBlocks(msg.content).map((block, i) => {
                                                            if (block.type === 'image') {
                                                                return <img key={i} src={block.url} alt={block.alt} className="rounded-xl max-w-full max-h-[400px] object-cover shadow-sm" />;
                                                            }
                                                            if (block.type === 'code') {
                                                                return (
                                                                    <div key={i} className="relative rounded-xl overflow-hidden my-2 max-w-full">
                                                                        <div className="flex items-center justify-between px-4 py-2 bg-[#1e1e2e] border-b border-white/5">
                                                                            <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider">{block.language}</span>
                                                                            <button
                                                                                onClick={() => {
                                                                                    navigator.clipboard.writeText(block.code);
                                                                                    setCopiedId(`code-${msg.id}-${i}`);
                                                                                    setTimeout(() => setCopiedId(null), 2000);
                                                                                }}
                                                                                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold text-white/50 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                                                                            >
                                                                                {copiedId === `code-${msg.id}-${i}` ? (
                                                                                    <><Check size={12} className="text-green-400" /> Copiado</>
                                                                                ) : (
                                                                                    <><Copy size={12} /> Copiar</>
                                                                                )}
                                                                            </button>
                                                                        </div>
                                                                        <pre className="bg-[#1e1e2e] text-[#cdd6f4] text-[13px] leading-relaxed p-4 overflow-x-auto font-mono">
                                                                            <code>{block.code}</code>
                                                                        </pre>
                                                                    </div>
                                                                );
                                                            }
                                                            // text block
                                                            return block.text.split('\n').map((line: string, j: number) => (
                                                                <p key={`${i}-${j}`} className="leading-relaxed break-words whitespace-pre-wrap">{line}</p>
                                                            ));
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                            <div className={`px-2 flex items-center gap-1 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                                                <span className="text-[9px] font-medium text-neutral-400 uppercase tracking-tighter">
                                                    {msg.created_at.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                                {msg.role === "assistant" && msg.id !== "welcome" && (
                                                    <div className="flex items-center gap-0.5 ml-2">
                                                        <button
                                                            onClick={() => toggleFeedback(msg)}
                                                            className="p-1 rounded-md hover:bg-neutral-100 transition-all cursor-pointer"
                                                            title="Curtir"
                                                        >
                                                            <Heart
                                                                size={12}
                                                                className={msg.feedback === 'like' ? "text-red-500" : "text-neutral-400 hover:text-red-400"}
                                                                fill={msg.feedback === 'like' ? "currentColor" : "none"}
                                                            />
                                                        </button>
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
                                                        <button
                                                            onClick={() => replyToMessage(msg)}
                                                            className="p-1 rounded-md hover:bg-neutral-100 transition-all cursor-pointer"
                                                            title="Responder"
                                                        >
                                                            <Reply size={12} className="text-neutral-400 hover:text-neutral-600" />
                                                        </button>
                                                    </div>
                                                )}
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
                                        <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border shadow-sm self-start bg-white border-neutral-200">
                                            <Bot size={20} className="opacity-50 grayscale animate-pulse" />
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
