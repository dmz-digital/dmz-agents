"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
    ArrowLeft, Plus, Bot, Clock, CheckCircle2, AlertTriangle,
    RotateCcw, BookOpen, Activity, GripVertical,
    Brain, Key, Copy, Check, Settings, Terminal,
    Users, X, FolderOpen, BadgeCheck, ListTodo, FileText, Play, Volume2, Square,
    ChevronLeft, ChevronRight, Search, Star
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import AppHeader from "@/components/AppHeader";

// ── Types ───────────────────────────────────────────────────────────────────
type TaskType = "master_plan" | "to_do" | "on_going" | "done" | "rework" | "approved";
type Task = {
    id: string; project_id: string; agent_id: string | null; type: TaskType;
    title: string; description: string | null; status: string; priority: number;
    assigned_by: string | null; completed_by: string | null; completed_at: string | null;
    metadata: any; created_at: string; updated_at: string;
    feedback?: string | null;
    assignees?: { agent_id: string; role: string }[];
};

const COLUMNS: { id: TaskType; label: string; color: string; icon: any; description: string }[] = [
    { id: "master_plan", label: "Master Plan", color: "#2563EB", icon: BookOpen, description: "Backlog estratégico (placeholder/objetivos) — deletar após decompor" },
    { id: "to_do", label: "To Do", color: "#64748B", icon: Clock, description: "Tarefas aguardando execução" },
    { id: "on_going", label: "Ongoing", color: "#D97706", icon: Activity, description: "Em execução pelos agentes" },
    { id: "done", label: "Done", color: "#10B981", icon: CheckCircle2, description: "Concluído e aguardando validação" },
    { id: "rework", label: "Rework", color: "#EF4444", icon: RotateCcw, description: "Precisa ser refeito" },
    { id: "approved", label: "Approved", color: "#8B5CF6", icon: BadgeCheck, description: "Finalizado e aprovado" },
];

// @orch creates strategy, @syd manages daily flow, individual agents update their own tasks
const PLANNER = "orchestrator";

function stripMarkdown(text: string) {
    if (!text) return "";
    return text
        .replace(/!\[.*?\]\(.*?\)/g, '')
        .replace(/\[(.*?)\]\(.*?\)/g, '$1')
        .replace(/#{1,6}\s+/g, '')
        .replace(/(\*\*|__)(.*?)\1/g, '$2')
        .replace(/(\*|_)(.*?)\1/g, '$2')
        .replace(/~~(.*?)~~/g, '$1')
        .replace(/`([^`]+)`/g, '$1')
        .replace(/```[\s\S]*?```/g, '')
        .replace(/\n\s*-\s/g, ' ')
        .replace(/\n/g, ' ')
        .trim();
}

function Tag({ children, color }: { children: React.ReactNode; color: string }) {
    return (
        <span style={{ display: "inline-flex", alignItems: "center", background: color + "12", color, border: `1px solid ${color}25`, borderRadius: "6px", padding: "2px 8px", fontSize: "10px", fontWeight: 600, letterSpacing: "0.04em" }}>
            {children}
        </span>
    );
}

function CopyBtn({ text }: { text: string }) {
    const [copied, setCopied] = useState(false);
    return (
        <button onClick={e => { e.stopPropagation(); navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
            style={{ background: "none", border: "none", cursor: "pointer", padding: "4px", color: copied ? "#10B981" : "#9CA3AF", display: "flex", alignItems: "center" }}>
            {copied ? <Check size={12} /> : <Copy size={12} />}
        </button>
    );
}

export default function KanbanBoardView({ slug }: { slug: string }) {
    const router = useRouter();
    const [project, setProject] = useState<any>(null);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [agents, setAgents] = useState<any[]>([]);
    const [projectAgents, setProjectAgents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddTask, setShowAddTask] = useState<TaskType | null>(null);
    const [showSettings, setShowSettings] = useState(false);
    const [draggedTask, setDraggedTask] = useState<string | null>(null);
    const [dragOverColumn, setDragOverColumn] = useState<TaskType | null>(null);
    const [dragOverTask, setDragOverTask] = useState<string | null>(null);
    const [dragOverPosition, setDragOverPosition] = useState<"top" | "bottom" | null>(null);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [showReports, setShowReports] = useState(false);
    const [showAddAgents, setShowAddAgents] = useState(false);
    const [showSearch, setShowSearch] = useState(false); // Intelligent Global Search
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState<{ agents: any[], tasks: any[] }>({ agents: [], tasks: [] });
    const [isSearching, setIsSearching] = useState(false);
    const [apiKeys, setApiKeys] = useState<any[]>([]);
    const [isGeneratingKey, setIsGeneratingKey] = useState(false);

    type ConfirmAction = { title: string; message: string; isDanger?: boolean; confirmText?: string; cancelText?: string; onConfirm: () => void; onCancel: () => void; };
    const [confirmData, setConfirmData] = useState<ConfirmAction | null>(null);

    const confirmAction = useCallback(async (title: string, message: string, isDanger: boolean = false, confirmText: string = "Confirmar", cancelText: string = "Cancelar") => {
        return new Promise<boolean>((resolve) => {
            setConfirmData({
                title, message, isDanger, confirmText, cancelText,
                onConfirm: () => { setConfirmData(null); resolve(true); },
                onCancel: () => { setConfirmData(null); resolve(false); }
            });
        });
    }, []);

    const audioDoneRef = useRef<HTMLAudioElement | null>(null);
    const audioOngoingRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        if (typeof window !== "undefined") {
            audioDoneRef.current = new Audio('/assets/done.mp3');
            audioOngoingRef.current = new Audio('/assets/ongoing.mp3');
        }
    }, []);

    const loadData = useCallback(async () => {
        const { data: projData } = await supabase.from("dmz_agents_projects").select("*").eq("slug", slug).single();
        if (!projData) { setLoading(false); return; }
        setProject(projData);

        const [{ data: taskData }, { data: agentData }, { data: paData }, { data: keyData }, { data: assigneesData }] = await Promise.all([
            supabase.from("dmz_agents_tasks").select("*").eq("project_id", projData.id).order("priority", { ascending: false }).order("created_at"),
            supabase.from("dmz_agents_definitions").select("id, handle, name, full_name, icon, color, category, ranking_score, tasks_completed"),
            supabase.from("dmz_agents_project_agents").select("agent_id, status").eq("project_id", projData.id),
            supabase.from("dmz_agents_apikeys").select("*").eq("project_id", projData.slug).eq("is_active", true),
            supabase.from("dmz_agents_task_assignees").select("task_id, agent_id, role")
        ]);

        const tasksWithAssignees = (taskData || []).map(t => ({
            ...t,
            assignees: (assigneesData || []).filter(a => a.task_id === t.id)
        }));

        setTasks(tasksWithAssignees); setAgents(agentData || []); setProjectAgents(paData || []); setApiKeys(keyData || []); setLoading(false);
    }, [slug]);

    useEffect(() => { loadData(); }, [loadData]);

    useEffect(() => {
        const handleK = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                setShowSearch(true);
            }
        };
        window.addEventListener('keydown', handleK);
        return () => window.removeEventListener('keydown', handleK);
    }, []);

    const performSearch = useCallback(async (term: string) => {
        if (!project?.id) return;
        if (!term.trim()) {
            setSearchResults({ agents: [], tasks: [] });
            return;
        }
        setIsSearching(true);
        try {
            // Search Agents
            const { data: agentData } = await supabase
                .from('dmz_agents_definitions')
                .select('*')
                .or(`name.ilike.%${term}%,handle.ilike.%${term}%,category.ilike.%${term}%`)
                .limit(10);

            // Search Tasks
            let query = supabase
                .from('dmz_agents_tasks')
                .select('*, dmz_agents_definitions(name, handle, color)')
                .eq('project_id', project.id);

            // If term starts with #, search ID specifically
            if (term.startsWith('#')) {
                const idTerm = term.slice(1).toLowerCase();
                query = query.ilike('id', `${idTerm}%`);
            } else {
                query = query.or(`title.ilike.%${term}%,description.ilike.%${term}%,status.ilike.%${term}%,type.ilike.%${term}%,id.ilike.%${term}%`);
            }

            const { data: taskData, error } = await query
                .order('created_at', { ascending: false })
                .limit(20);
                
            if (error) {
                console.error("Search tasks error:", error);
            }

            setSearchResults({ 
                agents: agentData || [], 
                tasks: (taskData || []).map(t => ({ ...t, agent: t.dmz_agents_definitions }))
            });
        } catch (err) {
            console.error("Search error:", err);
        } finally {
            setIsSearching(false);
        }
    }, [project?.id]);

    useEffect(() => {
        const timer = setTimeout(() => {
            performSearch(searchTerm);
        }, 300);
        return () => {
            clearTimeout(timer);
        };
    }, [searchTerm, performSearch]);

    useEffect(() => {
        if (!project?.id) return;
        const ch = supabase.channel(`tasks-${project.id}`)
            .on("postgres_changes", { event: "*", schema: "public", table: "dmz_agents_tasks", filter: `project_id=eq.${project.id}` }, (payload) => {
                if (payload.eventType === 'UPDATE') {
                    const oldTask = payload.old as Task;
                    const newTask = payload.new as Task;
                    if (oldTask && newTask && oldTask.type !== newTask.type) {
                        if (newTask.type === "done" && audioDoneRef.current) {
                            audioDoneRef.current.currentTime = 0;
                            audioDoneRef.current.play().catch(e => console.warn("Audio blocked:", e));
                        } else if (newTask.type === "on_going" && audioOngoingRef.current) {
                            audioOngoingRef.current.currentTime = 0;
                            audioOngoingRef.current.play().catch(e => console.warn("Audio blocked:", e));
                        }
                    }
                }
                
                setTasks(prev => {
                    if (payload.eventType === 'INSERT') {
                        // Prevent duplicates if already added optimistically
                        if (prev.some(t => t.id === payload.new.id)) return prev;
                        return [...prev, payload.new as Task].sort((a, b) => b.priority - a.priority || new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
                    }
                    if (payload.eventType === 'DELETE') {
                        return prev.filter(t => t.id !== payload.old?.id);
                    }
                    if (payload.eventType === 'UPDATE') {
                        return prev.map(t => t.id === payload.new.id ? payload.new as Task : t).sort((a, b) => b.priority - a.priority || new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
                    }
                    return prev;
                });
            })
            .subscribe();
        return () => { supabase.removeChannel(ch); };
    }, [project?.id]);

    function getAgent(agentId: string | null) {
        if (!agentId) return null;
        const agent = agents.find(a => a.id === agentId); 
        if (!agent && agentId === 'orchestrator') {
            return { id: 'orchestrator', handle: 'orch', name: 'DMZ Orchestrator', color: '#E85D2F' };
        }
        return agent;
    }
    function getTasksByColumn(type: TaskType) { return tasks.filter(t => t.type === type); }

    async function moveTask(taskId: string, newType: TaskType, targetTaskId?: string, position?: "top" | "bottom") {
        setDraggedTask(null); setDragOverColumn(null); setDragOverTask(null); setDragOverPosition(null);

        // Otimização e cálculo de prioridade no frontend (para reordenamento vertical)
        let updatedTasks = [...tasks];
        const taskObj = updatedTasks.find(t => t.id === taskId);
        if (!taskObj) return;

        // Audio notification only if column changed
        if (taskObj.type !== newType) {
            if (newType === "done" && audioDoneRef.current) {
                audioDoneRef.current.currentTime = 0;
                audioDoneRef.current.play().catch(e => console.warn("Audio blocked:", e));
            } else if (newType === "on_going" && audioOngoingRef.current) {
                audioOngoingRef.current.currentTime = 0;
                audioOngoingRef.current.play().catch(e => console.warn("Audio blocked:", e));
            }
        }

        // QA Block: Require explicit confirmation for Approved column
        if (newType === "approved" && taskObj.type !== "approved") {
            const confirmed = await confirmAction("🛡️ CHECK DE QA", "Esta tarefa foi validada pelo QA (@emma)? Tudo que vai para Approved sofre release imediato. Confirma a aprovação?", false, "Aprovar Release");
            if (!confirmed) {
                setDraggedTask(null); setDragOverColumn(null); setDragOverTask(null); setDragOverPosition(null);
                return;
            }
        }

        taskObj.type = newType;
        if (newType === "done" || newType === "approved") { taskObj.status = "completed"; taskObj.completed_at = new Date().toISOString(); }
        else if (newType === "on_going" || newType === "rework") { taskObj.status = "in_progress"; taskObj.completed_at = null; }
        else { taskObj.status = "pending"; taskObj.completed_at = null; }
        taskObj.updated_at = new Date().toISOString();

        const colTasks = updatedTasks.filter(t => t.type === newType && t.id !== taskId).sort((a, b) => b.priority - a.priority);

        let newPriority = 0;

        if (targetTaskId && position) {
            const targetIndex = colTasks.findIndex(t => t.id === targetTaskId);
            if (targetIndex !== -1) {
                const targetTask = colTasks[targetIndex];
                if (position === "top") {
                    const prevTask = colTasks[targetIndex - 1]; // Task acima do target
                    newPriority = prevTask ? (prevTask.priority + targetTask.priority) / 2 : targetTask.priority + 1000;
                } else {
                    const nextTask = colTasks[targetIndex + 1]; // Task abaixo do target
                    newPriority = nextTask ? (targetTask.priority + nextTask.priority) / 2 : targetTask.priority - 1000;
                }
            }
        } else {
            // Se solto fora de outra task (fim da coluna)
            newPriority = colTasks.length > 0 ? colTasks[colTasks.length - 1].priority - 1000 : 0;
        }

        taskObj.priority = newPriority;
        
        // Ordenamos logo localmente para evitar pulos na interface antes do websocket reagir
        setTasks(updatedTasks.sort((a, b) => b.priority - a.priority));

        await supabase.from("dmz_agents_tasks").update({ 
            type: taskObj.type, 
            status: taskObj.status, 
            completed_at: taskObj.completed_at, 
            updated_at: taskObj.updated_at,
            priority: newPriority 
        }).eq("id", taskId);
    }

    async function createTask(type: TaskType, title: string, description: string, agentId: string | null) {
        const sm: Record<TaskType, string> = { master_plan: "pending", to_do: "pending", on_going: "in_progress", done: "completed", rework: "in_progress", approved: "completed" };
        const { data } = await supabase.from("dmz_agents_tasks").insert({
            project_id: project.id, type, title, description: description || null,
            agent_id: agentId || null, status: sm[type], priority: 0, assigned_by: PLANNER,
        }).select().single();
        if (data) setTasks(prev => [...prev, data]);
        setShowAddTask(null);
    }

    async function toggleTaskAssignee(taskId: string, agentId: string) {
        const task = tasks.find(t => t.id === taskId);
        if (!task) return;
        const exists = task.assignees?.some(a => a.agent_id === agentId);
        
        if (exists) {
            await supabase.from("dmz_agents_task_assignees").delete().eq("task_id", taskId).eq("agent_id", agentId);
        } else {
            await supabase.from("dmz_agents_task_assignees").insert({ task_id: taskId, agent_id: agentId, role: 'executor' });
        }
        loadData(); 
    }

    async function deleteTask(taskId: string) {
        await supabase.from("dmz_agents_tasks").delete().eq("id", taskId);
        setTasks(prev => prev.filter(t => t.id !== taskId));
    }

    async function deleteProject() {
        if (!await confirmAction("Excluir Projeto", "ATENÇÃO: Você tem certeza que deseja excluir DEFINITIVAMENTE este projeto? Todas as tarefas e configurações serão perdidas.", true, "Excluir Definitivamente")) return;
        
        await supabase.from("dmz_agents_projects").delete().eq("id", project.id);
        router.push("/app/projects");
    }

    async function updateTaskContent(taskId: string, title: string, description: string, agentId: string | null, feedback: string | null, newType?: TaskType) {
        let updateData: any = { title, description: description || null, agent_id: agentId, feedback: feedback || null };
        if (newType) {
            updateData.type = newType;
            if (newType === "done" || newType === "approved") { updateData.status = "completed"; updateData.completed_at = new Date().toISOString(); }
            else if (newType === "on_going" || newType === "rework") { updateData.status = "in_progress"; updateData.completed_at = null; }
            else { updateData.status = "pending"; updateData.completed_at = null; }

            // Audio notification (uses pre-loaded refs to bypass autoplay)
            if (newType === "done" && audioDoneRef.current) { audioDoneRef.current.currentTime = 0; audioDoneRef.current.play().catch(() => {}); }
            else if (newType === "on_going" && audioOngoingRef.current) { audioOngoingRef.current.currentTime = 0; audioOngoingRef.current.play().catch(() => {}); }
        }
        await supabase.from("dmz_agents_tasks").update(updateData).eq("id", taskId);
        
        if (newType) {
            // Re-fetch all tasks if moving columns so priority and ordering remains consistent 
            // but for simplicity we can just update local state:
            setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...updateData } : t));
        } else {
            setTasks(prev => prev.map(t => t.id === taskId ? { ...t, title, description: description || null, agent_id: agentId, feedback: feedback || null } : t));
        }
    }

    async function handleGenerateKey() {
        if (!project) return;
        setIsGeneratingKey(true);
        try {
            const res = await fetch("/api/keys/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ project_id: project.slug, name: `Key_${new Date().toLocaleDateString()}` })
            });
            const data = await res.json();
            if (data.api_key) {
                // Sincroniza com a tabela de projetos para o CLI
                await supabase.from("dmz_agents_projects").update({ api_key: data.api_key }).eq("id", project.id);
                setProject(prev => ({ ...prev, api_key: data.api_key }));

                // Show the key once
                confirmAction("API Key Gerada", `Anote sua chave (ela não será exibida novamente):\n\n${data.api_key}`, false, "Copiado", "Fechar");
                if (typeof window !== "undefined") navigator.clipboard.writeText(data.api_key);
                
                // Refresh list
                const { data: updatedKeys } = await supabase.from("dmz_agents_apikeys").select("*").eq("project_id", project.slug).eq("is_active", true);
                setApiKeys(updatedKeys || []);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsGeneratingKey(false);
        }
    }

    async function handleToggleProjectAgent(agentId: string) {
        if (!project) return;
        const exists = projectAgents.some(pa => pa.agent_id === agentId);
        if (exists) {
            const { error } = await supabase.from("dmz_agents_project_agents").delete().eq("project_id", project.id).eq("agent_id", agentId);
            if (!error) setProjectAgents(prev => prev.filter(pa => pa.agent_id !== agentId));
        } else {
            const { error } = await supabase.from("dmz_agents_project_agents").insert({ project_id: project.id, agent_id: agentId, status: "active" });
            if (!error) setProjectAgents(prev => [...prev, { agent_id: agentId, status: "active" }]);
        }
    }

    async function handleToggleAllAgents(active: boolean) {
        if (!project) return;
        if (active) {
            // Ativa todos que ainda não estão ativos
            const toAdd = agents.filter(a => !projectAgents.some(pa => pa.agent_id === a.id));
            if (toAdd.length === 0) return;
            const inserts = toAdd.map(a => ({ project_id: project.id, agent_id: a.id, status: "active" }));
            const { error } = await supabase.from("dmz_agents_project_agents").insert(inserts);
            if (!error) setProjectAgents(prev => [...prev, ...inserts.map(i => ({ agent_id: i.agent_id, status: "active" }))]);
        } else {
            // Remove todos
            const { error } = await supabase.from("dmz_agents_project_agents").delete().eq("project_id", project.id);
            if (!error) setProjectAgents([]);
        }
    }

    if (loading) return (
        <div className="dmz-container pt-12 pb-24">
            <AppHeader />
            <div style={{ height: 400, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ textAlign: "center" }}>
                    <div style={{ width: 40, height: 40, border: "3px solid #F0F0F0", borderTopColor: "#E85D2F", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
                    <p style={{ fontSize: "13px", color: "#9CA3AF" }}>Carregando projeto...</p>
                </div>
            </div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );

    if (!project) return (
        <div className="dmz-container pt-12 pb-24">
            <AppHeader />
            <div style={{ textAlign: "center", padding: "80px 24px" }}>
                <FolderOpen size={48} color="#D1D5DB" style={{ margin: "0 auto 16px" }} />
                <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#111827", marginBottom: "8px" }}>Projeto não encontrado</h2>
                <p style={{ fontSize: "13px", color: "#9CA3AF", marginBottom: "24px" }}>O slug &quot;{slug}&quot; não existe ou você não tem acesso.</p>
                <button onClick={() => router.push("/app/projects")} style={{ background: "#E85D2F", color: "#FFF", border: "none", borderRadius: "10px", padding: "10px 24px", fontSize: "13px", fontWeight: 700, cursor: "pointer" }}>
                    Voltar
                </button>
            </div>
        </div>
    );

    return (
        <div className="dmz-container pt-12 pb-24">
            <AppHeader />
            {/* Header */}
            <div style={{ marginBottom: "24px" }}>
                <button onClick={() => router.push("/app/projects")} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", color: "#9CA3AF", fontSize: "13px", fontWeight: 500, marginBottom: "16px" }}>
                    <ArrowLeft size={14} /> Projetos
                </button>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "6px" }}>
                            <h1 style={{ fontSize: "26px", fontWeight: 800, color: "#111827", letterSpacing: "-0.04em" }}>{project.name}</h1>
                            <Tag color="#10B981">{project.status}</Tag>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", background: "#F3F4F6", borderRadius: "8px", padding: "4px 10px", fontSize: "11px", fontWeight: 700, color: "#6B7280" }}>
                                <ListTodo size={12} /> {tasks.length} tasks
                            </span>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", background: "#ECFDF5", borderRadius: "8px", padding: "4px 10px", fontSize: "11px", fontWeight: 700, color: "#10B981" }}>
                                <CheckCircle2 size={12} /> {tasks.filter(t => t.type === "done" || t.type === "approved").length} concluídas
                            </span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
                            <code style={{ fontSize: "12px", color: "#9CA3AF", fontFamily: "monospace" }}>slug: {project.slug}</code>
                            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                <Users size={12} color="#9CA3AF" />
                                <span style={{ fontSize: "12px", color: "#9CA3AF" }}>{projectAgents.length} agentes</span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                <span style={{ fontSize: "11px", color: "#6B7280" }}>Gerenciado por</span>
                                <Tag color="#7C3AED">@syd</Tag>
                                <span style={{ fontSize: "11px", color: "#6B7280" }}>| Planejado por</span>
                                <Tag color="#E85D2F">@orch</Tag>
                            </div>
                        </div>
                    </div>
                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                        <button onClick={() => setShowSearch(true)} style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 42, height: 42, background: "#FFFFFF", border: "1.5px solid #F0F0F0", borderRadius: "10px", color: "#E85D2F", cursor: "pointer", transition: "all 0.2s", boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }} onMouseEnter={e => { e.currentTarget.style.borderColor = "#E85D2F"; e.currentTarget.style.background = "#FFF5F2"; }} onMouseLeave={e => { e.currentTarget.style.borderColor = "#F0F0F0"; e.currentTarget.style.background = "#FFFFFF"; }} title="Busca Inteligente (Ctrl+K)">
                            <Search size={22} strokeWidth={2.5} />
                        </button>
                        <button onClick={() => setShowReports(true)} style={{ display: "flex", alignItems: "center", gap: "6px", background: "#FFFFFF", border: "1.5px solid #F0F0F0", borderRadius: "10px", padding: "10px 16px", fontSize: "12px", fontWeight: 600, color: "#6B7280", cursor: "pointer" }}>
                            <FileText size={14} /> Relatórios
                        </button>
                        <button onClick={() => setShowAddAgents(true)} style={{ display: "flex", alignItems: "center", gap: "6px", background: "#FFFFFF", border: "1.5px solid #F0F0F0", borderRadius: "10px", padding: "10px 16px", fontSize: "12px", fontWeight: 600, color: "#6B7280", cursor: "pointer" }}>
                            <Bot size={14} /> Adicionar Agentes
                        </button>
                        <button onClick={() => router.push(`/app/projects?id=${slug}&view=install`)} style={{ display: "flex", alignItems: "center", gap: "6px", background: "#FFFFFF", border: "1.5px solid #F0F0F0", borderRadius: "10px", padding: "10px 16px", fontSize: "12px", fontWeight: 600, color: "#6B7280", cursor: "pointer" }}>
                            <Terminal size={14} /> Instalação
                        </button>
                        <button onClick={() => router.push(`/app/projects?id=${slug}&view=memory`)} style={{ display: "flex", alignItems: "center", gap: "6px", background: "#FFFFFF", border: "1.5px solid #F0F0F0", borderRadius: "10px", padding: "10px 16px", fontSize: "12px", fontWeight: 600, color: "#6B7280", cursor: "pointer" }}>
                            <Brain size={14} /> Memória
                        </button>
                        <button onClick={() => setShowSettings(!showSettings)} style={{ display: "flex", alignItems: "center", gap: "6px", background: "#FFFFFF", border: "1.5px solid #F0F0F0", borderRadius: "10px", padding: "10px 16px", fontSize: "12px", fontWeight: 600, color: "#6B7280", cursor: "pointer" }}>
                            <Settings size={14} /> Config
                        </button>
                    </div>
                </div>
            </div>

            {/* Settings */}
            {showSettings && (
                <div style={{ background: "#FFFFFF", border: "1.5px solid #F0F0F0", borderRadius: "14px", padding: "20px", marginBottom: "24px", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
                    <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
                        <div>
                            <div style={{ fontSize: "10px", fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", marginBottom: "6px" }}>Slug</div>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}><code style={{ fontSize: "12px", color: "#111827", fontFamily: "monospace" }}>{project.slug}</code><CopyBtn text={project.slug} /></div>
                        </div>
                        <div>
                            <div style={{ fontSize: "10px", fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", marginBottom: "6px" }}>API Keys</div>
                            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                {project.api_key && (
                                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                        <code style={{ fontSize: "12px", color: "#E85D2F", fontFamily: "monospace" }}>{project.api_key.slice(0, 16)}...</code>
                                        <span style={{ fontSize: "10px", color: "#10B981", fontWeight: 600 }}>[ATIVA]</span>
                                        <CopyBtn text={project.api_key} />
                                    </div>
                                )}
                                {apiKeys.map(k => (
                                    <div key={k.id} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                        <code style={{ fontSize: "12px", color: "#E85D2F", fontFamily: "monospace" }}>{k.key_prefix}...hash</code>
                                        <span style={{ fontSize: "10px", color: "#9CA3AF" }}>({k.name})</span>
                                    </div>
                                ))}
                                {!project.api_key && apiKeys.length === 0 && (
                                    <div style={{ fontSize: "11px", color: "#9CA3AF" }}>Nenhuma chave ativa</div>
                                )}
                                <button onClick={handleGenerateKey} disabled={isGeneratingKey} style={{ background: "none", border: "1px dashed #D1D5DB", borderRadius: "6px", padding: "4px 8px", fontSize: "11px", fontWeight: 600, color: "#6B7280", cursor: "pointer" }}>
                                    {isGeneratingKey ? "Gerando..." : "+ Gerar Nova Key"}
                                </button>
                            </div>
                        </div>
                        <div>
                            <div style={{ fontSize: "10px", fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", marginBottom: "6px" }}>Setup .env.dmz</div>
                            <CopyBtn text={`DMZ_PROJECT_SLUG=${project.slug}\nDMZ_API_KEY=${project.api_key || "SUA_CHAVE_AQUI"}`} />
                        </div>
                        <div style={{ display: "flex", alignItems: "flex-end", marginLeft: "auto" }}>
                            <button
                                onClick={deleteProject}
                                style={{
                                    display: "flex", alignItems: "center", gap: "6px",
                                    background: "#F9FAFB", border: "1.5px solid #F0F0F0", borderRadius: "10px",
                                    padding: "10px 16px", fontSize: "12px", fontWeight: 700, color: "#6B7280", cursor: "pointer", transition: "all 0.15s"
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.background = "#FEE2E2"; e.currentTarget.style.color = "#EF4444"; e.currentTarget.style.borderColor = "#FEE2E2"; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = "#F9FAFB"; e.currentTarget.style.color = "#6B7280"; e.currentTarget.style.borderColor = "#F0F0F0"; }}
                            >
                                <Trash size={14} /> Excluir Projeto
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Kanban Board */}
            <div style={{ background: "#F1F3F5", borderRadius: "18px", padding: "16px 12px" }}>
            <div className="kanban-scroll-x">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(6, minmax(220px, 1fr))", gap: "10px", alignItems: "flex-start" }}>
                {COLUMNS.map(col => {
                    const colTasks = getTasksByColumn(col.id);
                    const Icon = col.icon;
                    const isDrop = dragOverColumn === col.id;
                    return (
                        <div key={col.id}
                            onDragOver={e => { e.preventDefault(); setDragOverColumn(col.id); }}
                            onDragLeave={() => setDragOverColumn(null)}
                            onDrop={() => { if (draggedTask) moveTask(draggedTask, col.id); }}
                            style={{
                                background: isDrop ? col.color + "08" : "transparent",
                                border: isDrop ? `2px dashed ${col.color}50` : "2px solid transparent",
                                borderRadius: "14px",
                                padding: "10px 8px",
                                minHeight: "500px",
                                transition: "all 0.2s"
                            }}>
                            {/* Column Header */}
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", padding: "0 2px" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                    <div style={{ width: 28, height: 28, borderRadius: "8px", background: col.color + "18", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                        <Icon size={14} color={col.color} strokeWidth={2} />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: "13px", fontWeight: 700, color: "#111827" }}>{col.label}</div>
                                        <div style={{ fontSize: "11px", color: "#9CA3AF", marginTop: "1px" }}>{colTasks.length} {colTasks.length === 1 ? "task" : "tasks"}</div>
                                    </div>
                                </div>
                                <button onClick={() => setShowAddTask(col.id)} style={{ width: 26, height: 26, borderRadius: "8px", background: "rgba(255,255,255,0.8)", border: "1px solid #E5E7EB", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#9CA3AF" }} title={`Adicionar em ${col.label}`}>
                                    <Plus size={14} />
                                </button>
                            </div>
                            {/* Cards */}
                            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                {colTasks.map(task => {
                                    const agent = getAgent(task.agent_id);
                                    const dragging = draggedTask === task.id;
                                    const isDragOver = dragOverTask === task.id;
                                    
                                    return (
                                        <div key={task.id} 
                                            draggable 
                                            onDragStart={() => {
                                                setDraggedTask(task.id);
                                                // Initialize audio on user interaction to bypass autoplay restrictions on drop
                                                if (audioDoneRef.current && audioDoneRef.current.paused) {
                                                    audioDoneRef.current.volume = 0; audioDoneRef.current.play().then(() => { audioDoneRef.current!.pause(); audioDoneRef.current!.currentTime = 0; audioDoneRef.current!.volume = 1; }).catch(() => {});
                                                }
                                                if (audioOngoingRef.current && audioOngoingRef.current.paused) {
                                                    audioOngoingRef.current.volume = 0; audioOngoingRef.current.play().then(() => { audioOngoingRef.current!.pause(); audioOngoingRef.current!.currentTime = 0; audioOngoingRef.current!.volume = 1; }).catch(() => {});
                                                }
                                            }} 
                                            onDragEnd={() => { setDraggedTask(null); setDragOverColumn(null); setDragOverTask(null); setDragOverPosition(null); }}
                                            onDragOver={e => {
                                                e.preventDefault();
                                                e.stopPropagation(); // Previne que a coluna capture o evento
                                                setDragOverColumn(col.id);
                                                setDragOverTask(task.id);
                                                // Descobre se está arrastando pela metade de cima ou de baixo do card
                                                const rect = e.currentTarget.getBoundingClientRect();
                                                const hoverClientY = e.clientY - rect.top;
                                                const isTop = hoverClientY < rect.height / 2;
                                                setDragOverPosition(isTop ? "top" : "bottom");
                                            }}
                                            onDragLeave={e => {
                                                if (dragOverTask === task.id) {
                                                    setDragOverTask(null);
                                                    setDragOverPosition(null);
                                                }
                                            }}
                                            onDrop={e => {
                                                e.stopPropagation();
                                                if (draggedTask) moveTask(draggedTask, col.id, task.id, dragOverPosition || "bottom");
                                            }}
                                            onClick={() => setSelectedTask(task)}
                                            style={{ 
                                                background: "#FFFFFF",
                                                border: "1px solid #E9EBEE",
                                                borderRadius: "10px",
                                                padding: "12px",
                                                cursor: "grab",
                                                transition: "all 0.15s",
                                                opacity: dragging ? 0.4 : 1,
                                                boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                                                borderLeft: `3px solid ${col.color}`,
                                                borderTop: isDragOver && dragOverPosition === "top" ? `3px solid ${col.color}` : undefined,
                                                borderBottom: isDragOver && dragOverPosition === "bottom" ? `3px solid ${col.color}` : undefined,
                                                marginTop: isDragOver && dragOverPosition === "top" ? "4px" : "0",
                                                marginBottom: isDragOver && dragOverPosition === "bottom" ? "4px" : "0",
                                            }}
                                            onMouseEnter={e => { if (!dragging) (e.currentTarget).style.boxShadow = "0 6px 16px rgba(0,0,0,0.06)"; }}
                                            onMouseLeave={e => { (e.currentTarget).style.boxShadow = "0 2px 8px rgba(0,0,0,0.03)"; }}>
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px", pointerEvents: "none" }}>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontSize: "9px", fontWeight: 800, color: col.color, background: col.color + "12", padding: "1px 5px", borderRadius: "4px", display: "inline-block", marginBottom: "4px", letterSpacing: "0.02em" }}>#{task.id.slice(0, 4).toUpperCase()}</div>
                                                    <h4 style={{ fontSize: "13px", fontWeight: 700, color: "#111827", lineHeight: 1.4, margin: 0 }}>{task.title}</h4>
                                                </div>
                                                <button onClick={e => { e.stopPropagation(); deleteTask(task.id); }} style={{ background: "none", border: "none", cursor: "pointer", padding: "2px", color: "#D1D5DB", marginLeft: "8px", pointerEvents: "auto" }}><X size={13} /></button>
                                            </div>
                                            {task.description && <p style={{ fontSize: "12px", color: "#6B7280", lineHeight: 1.5, margin: "0 0 10px", maxHeight: "52px", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical" }}>{stripMarkdown(task.description)}</p>}
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                <div style={{ display: "flex", alignItems: "center" }}>
                                                    {task.assignees && task.assignees.length > 0 ? (
                                                        <div style={{ display: "flex", alignItems: "center" }}>
                                                            {task.assignees.map((as, idx) => {
                                                                const ag = getAgent(as.agent_id);
                                                                if (!ag) return null;
                                                                return (
                                                                    <div key={as.agent_id} style={{ 
                                                                        width: 22, height: 22, borderRadius: "50%", 
                                                                        background: ag.color || "#6B7280", 
                                                                        display: "flex", alignItems: "center", justifyContent: "center", 
                                                                        fontSize: "9px", fontWeight: 800, color: "#FFF",
                                                                        marginLeft: idx > 0 ? "-8px" : "0",
                                                                        border: "2px solid #FFF",
                                                                        zIndex: 10 - idx
                                                                    }} title={`@${ag.handle}`}>
                                                                        {ag.handle?.charAt(0).toUpperCase()}
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    ) : task.agent_id ? (() => {
                                                        const ag = getAgent(task.agent_id);
                                                        return ag ? (
                                                            <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                                                                <div style={{ 
                                                                    width: 22, height: 22, borderRadius: "50%", 
                                                                    background: ag.color || "#6B7280", 
                                                                    display: "flex", alignItems: "center", justifyContent: "center", 
                                                                    fontSize: "9px", fontWeight: 800, color: "#FFF",
                                                                    border: "2px solid #FFF"
                                                                }} title={`@${ag.handle}`}>
                                                                    {ag.handle?.charAt(0).toUpperCase()}
                                                                </div>
                                                                <span style={{ fontSize: "10px", color: "#6B7280", fontWeight: 600 }}>@{ag.handle}</span>
                                                            </div>
                                                        ) : (
                                                            <span style={{ fontSize: "10px", color: "#9CA3AF", fontWeight: 500 }}>@{task.agent_id}</span>
                                                        );
                                                    })() : (
                                                        <span style={{ fontSize: "11px", color: "#D1D5DB" }}>sem agente</span>
                                                    )}
                                                </div>
                                                <span style={{ fontSize: "11px", color: "#9CA3AF", fontFamily: "monospace" }}>{new Date(task.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}</span>
                                            </div>
                                            {task.completed_at && (
                                                <div style={{ display: "flex", alignItems: "center", gap: "4px", marginTop: "10px" }}>
                                                    <CheckCircle2 size={12} color="#10B981" />
                                                    <span style={{ fontSize: "11px", color: "#10B981", fontWeight: 500 }}>{new Date(task.completed_at).toLocaleDateString("pt-BR")}</span>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                                {colTasks.length === 0 && (
                                    <div style={{ textAlign: "center", padding: "32px 12px", border: "2px dashed #DFE1E6", borderRadius: "10px" }}>
                                        <Icon size={18} color="#C1C7D0" style={{ margin: "0 auto 6px" }} />
                                        <p style={{ fontSize: "11px", color: "#C1C7D0", fontWeight: 500 }}>{col.description}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>{/* end kanban grid */}
            </div>{/* end kanban-scroll-x */}
            </div>{/* end board bg */}

            {/* TaskDetailModal with navigation */}
            {selectedTask && (
                <TaskDetailModalWrapper 
                    selectedTask={selectedTask}
                    getTasksByColumn={getTasksByColumn}
                    getAgent={getAgent}
                    agents={agents}
                    projectAgents={projectAgents}
                    deleteTask={deleteTask}
                    updateTaskContent={updateTaskContent}
                    toggleTaskAssignee={toggleTaskAssignee}
                    setSelectedTask={setSelectedTask}
                    confirmAction={confirmAction}
                />
            )}

            {/* Add Task Modal */}
            {showAddTask && (
                <AddTaskModal column={showAddTask}
                    agents={agents.filter(a => projectAgents.some(pa => pa.agent_id === a.id))}
                    onSave={(t, d, a) => createTask(showAddTask, t, d, a)}
                    onClose={() => setShowAddTask(null)} />
            )}
            {/* Custom Confirm Modal */}
            {confirmData && (
                <div style={{
                    position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center",
                    background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)", padding: "24px"
                    }} onClick={confirmData.onCancel}>
                    <div style={{
                        background: "#FFFFFF", borderRadius: "16px", padding: "32px", width: "100%", maxWidth: "420px",
                        boxShadow: "0 24px 48px rgba(0,0,0,0.25)", border: "1px solid rgba(0,0,0,0.05)",
                        display: "flex", flexDirection: "column", gap: "24px"
                    }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
                            <div style={{
                                width: 44, height: 44, borderRadius: "12px", flexShrink: 0,
                                background: confirmData.isDanger ? "#FEE2E2" : "#EEF2FF",
                                display: "flex", alignItems: "center", justifyContent: "center"
                            }}>
                                <AlertTriangle size={20} color={confirmData.isDanger ? "#EF4444" : "#4F46E5"} strokeWidth={2.5} />
                            </div>
                            <div>
                                <h3 style={{ fontSize: "17px", fontWeight: 800, color: "#111827", margin: "0 0 6px", letterSpacing: "-0.01em" }}>
                                    {confirmData.title}
                               </h3>
                                <p style={{ fontSize: "14px", color: "#4B5563", margin: 0, lineHeight: 1.5 }}>
                                    {confirmData.message}
                                </p>
                            </div>
                        </div>
                        <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "4px" }}>
                            <button onClick={confirmData.onCancel} style={{
                                padding: "10px 18px", background: "#F3F4F6", color: "#4B5563", border: "1px solid #E5E7EB", borderRadius: "8px", fontSize: "13px", fontWeight: 700, cursor: "pointer"
                            }}>
                                {confirmData.cancelText}
                            </button>
                            <button onClick={confirmData.onConfirm} style={{
                                padding: "10px 18px", color: "#FFFFFF", borderRadius: "8px", fontSize: "13px", fontWeight: 700, cursor: "pointer", border: "none",
                                background: confirmData.isDanger ? "linear-gradient(135deg, #EF4444, #B91C1C)" : "linear-gradient(135deg, #4F46E5, #4338CA)",
                                boxShadow: confirmData.isDanger ? "0 4px 12px rgba(239,68,68,0.2)" : "0 4px 12px rgba(79,70,229,0.2)"
                            }}>
                                {confirmData.confirmText}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Global Search Modal */}
            {showSearch && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(8px)", zIndex: 200, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "80px 24px" }} onClick={() => setShowSearch(false)}>
                    <div onClick={e => e.stopPropagation()} style={{ background: "#FFFFFF", borderRadius: "20px", width: "100%", maxWidth: "600px", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)", overflow: "hidden", display: "flex", flexDirection: "column" }}>
                        <div style={{ padding: "20px", borderBottom: "1.5px solid #F3F4F6", display: "flex", alignItems: "center", gap: "12px" }}>
                            <Search size={20} color="#9CA3AF" />
                            <input 
                                autoFocus
                                placeholder="Buscar por agente, tarefa, status ou termo..." 
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                style={{ flex: 1, border: "none", outline: "none", fontSize: "16px", fontWeight: 500, color: "#111827" }}
                            />
                            <div style={{ background: "#F3F4F6", padding: "4px 8px", borderRadius: "6px", fontSize: "10px", fontWeight: 700, color: "#9CA3AF" }}>ESC</div>
                        </div>
                        
                        <div style={{ maxHeight: "450px", overflowY: "auto", padding: "12px" }} className="modal-content-scroll">
                            <style>{`.modal-content-scroll::-webkit-scrollbar { display: none; }`}</style>
                            
                            {searchTerm.trim() === "" ? (
                                <div style={{ padding: "40px", textAlign: "center", color: "#9CA3AF" }}>
                                    <div style={{ fontSize: "13px", fontWeight: 500 }}>Digite algo para começar a busca inteligente...</div>
                                    <div style={{ fontSize: "11px", marginTop: "4px" }}>Ex: "analytics", "@orch", "todo" ou uma tarefa específica</div>
                                </div>
                            ) : (
                                <>
                                    {isSearching ? (
                                        <div style={{ padding: "40px", textAlign: "center", color: "#9CA3AF", fontSize: "13px" }}>Buscando...</div>
                                    ) : (searchResults.agents.length === 0 && searchResults.tasks.length === 0) ? (
                                        <div style={{ padding: "40px", textAlign: "center", color: "#9CA3AF", fontSize: "13px" }}>Nenhum resultado encontrado para "{searchTerm}"</div>
                                    ) : (
                                        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                                            {searchResults.agents.length > 0 && (
                                                <div>
                                                    <div style={{ fontSize: "10px", fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", paddingLeft: "8px", marginBottom: "8px" }}>Agentes</div>
                                                    {searchResults.agents.map(ag => (
                                                        <div key={ag.id} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px", borderRadius: "12px", cursor: "pointer", transition: "all 0.1s" }} onMouseEnter={e => e.currentTarget.style.background = "#F9FAFB"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                                                            <div style={{ width: 32, height: 32, borderRadius: "8px", background: ag.color, display: "flex", alignItems: "center", justifyContent: "center", color: "#FFF", fontSize: "12px", fontWeight: 800 }}>{ag.handle.charAt(0).toUpperCase()}</div>
                                                            <div>
                                                                <div style={{ fontSize: "13px", fontWeight: 700, color: "#111827" }}>{ag.name} <span style={{ color: "#9CA3AF", fontWeight: 500, marginLeft: "4px" }}>@{ag.handle}</span></div>
                                                                <div style={{ fontSize: "11px", color: "#6B7280" }}>{ag.category} • {ag.active ? 'Ativo' : 'Inativo'}</div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            
                                            {searchResults.tasks.length > 0 && (
                                                <div>
                                                    <div style={{ fontSize: "10px", fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", paddingLeft: "8px", marginBottom: "8px" }}>Tarefas</div>
                                                    {searchResults.tasks.map(t => (
                                                        <div key={t.id} onClick={() => { setSelectedTask(t); setShowSearch(false); }} style={{ display: "flex", alignItems: "flex-start", gap: "12px", padding: "10px", borderRadius: "12px", cursor: "pointer", transition: "all 0.1s" }} onMouseEnter={e => e.currentTarget.style.background = "#F9FAFB"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                                                            <div style={{ width: 32, height: 32, borderRadius: "8px", background: COLUMNS.find(c => c.id === t.type)?.color + "15", display: "flex", alignItems: "center", justifyContent: "center", color: COLUMNS.find(c => c.id === t.type)?.color, flexShrink: 0 }}>
                                                                {t.type === 'approved' ? <BadgeCheck size={16} /> : <ListTodo size={16} />}
                                                            </div>
                                                            <div style={{ flex: 1 }}>
                                                                <div style={{ display: "flex", justifyContent: "space-between" }}>
                                                                    <div style={{ fontSize: "13px", fontWeight: 700, color: "#111827" }}>{t.title}</div>
                                                                    <div style={{ fontSize: "9px", fontWeight: 800, color: "#9CA3AF", background: "#F3F4F6", padding: "2px 5px", borderRadius: "4px" }}>#{t.id.slice(0, 4).toUpperCase()}</div>
                                                                </div>
                                                                <div style={{ fontSize: "11px", color: "#6B7280", marginTop: "2px", display: "flex", alignItems: "center", gap: "6px" }}>
                                                                    <span style={{ color: COLUMNS.find(c => c.id === t.type)?.color, fontWeight: 700, textTransform: "uppercase" }}>{t.type.replace('_',' ')}</span>
                                                                    <span>•</span>
                                                                    <span>@{t.agent?.handle || 'unassigned'}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                        
                        <div style={{ padding: "12px 20px", background: "#F9FAFB", borderTop: "1.5px solid #F3F4F6", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div style={{ display: "flex", gap: "16px" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "10px", color: "#6B7280" }}>
                                    <kbd style={{ background: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: "4px", padding: "1px 4px", boxShadow: "0 1px 0 rgba(0,0,0,0.05)" }}>↵</kbd> selecionar
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "10px", color: "#6B7280" }}>
                                    <kbd style={{ background: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: "4px", padding: "1px 4px", boxShadow: "0 1px 0 rgba(0,0,0,0.05)" }}>↑↓</kbd> navegar
                                </div>
                            </div>
                            <div style={{ fontSize: "10px", color: "#9CA3AF" }}>DMZ Intelligence Search v1.0</div>
                        </div>
                    </div>
                </div>
            )}

            {showReports && (
                <ReportsModal tasks={tasks} project={project} agents={agents} onClose={() => setShowReports(false)} confirmAction={confirmAction} />
            )}

            {showAddAgents && (
                <AddAgentsModal
                    agents={agents}
                    projectAgents={projectAgents}
                    onToggle={handleToggleProjectAgent}
                    onToggleAll={handleToggleAllAgents}
                    onClose={() => setShowAddAgents(false)}
                />
            )}

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}

function TaskDetailModalWrapper({ 
    selectedTask, getTasksByColumn, getAgent, agents, projectAgents, 
    deleteTask, updateTaskContent, toggleTaskAssignee, setSelectedTask, confirmAction 
}: any) {
    const colTasks = getTasksByColumn(selectedTask.type);
    const currentIndex = colTasks.findIndex((t: any) => t.id === selectedTask.id);
    const prevTask = currentIndex > 0 ? colTasks[currentIndex - 1] : null;
    const nextTask = currentIndex !== -1 && currentIndex < colTasks.length - 1 ? colTasks[currentIndex + 1] : null;

    return (
        <TaskDetailModal
            task={selectedTask}
            agent={getAgent(selectedTask.agent_id)}
            projectAgents={agents.filter((a: any) => projectAgents.some((pa: any) => pa.agent_id === a.id))}
            onDelete={() => { deleteTask(selectedTask.id); setSelectedTask(null); }}
            onUpdate={(t: any, d: any, a: any, f: any, type: any) => updateTaskContent(selectedTask.id, t, d, a, f, type)}
            onToggleAssignee={(agentId: any) => toggleTaskAssignee(selectedTask.id, agentId)}
            onClose={() => setSelectedTask(null)}
            confirmAction={confirmAction}
            hasPrev={!!prevTask}
            hasNext={!!nextTask}
            onPrev={() => prevTask && setSelectedTask(prevTask)}
            onNext={() => nextTask && setSelectedTask(nextTask)}
        />
    );
}

function AddAgentsModal({ agents, projectAgents, onToggle, onToggleAll, onClose }: { agents: any[]; projectAgents: any[]; onToggle: (id: string) => void; onToggleAll: (active: boolean) => void; onClose: () => void }) {
    const allActive = agents.length > 0 && agents.every(a => projectAgents.some(pa => pa.agent_id === a.id));

    return (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, backdropFilter: "blur(4px)", padding: "24px" }} onClick={onClose}>
            <div onClick={e => e.stopPropagation()} style={{ background: "#FFFFFF", borderRadius: "24px", padding: "32px", width: "100%", maxWidth: 900, boxShadow: "0 20px 80px rgba(0,0,0,0.15)", display: "flex", flexDirection: "column", gap: "24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div style={{ width: 40, height: 40, borderRadius: "12px", background: "#E85D2F15", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Bot size={20} color="#E85D2F" />
                        </div>
                        <div>
                            <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#111827", margin: 0 }}>Gerenciar Squad</h3>
                            <p style={{ fontSize: "12px", color: "#6B7280", margin: 0 }}>Selecione os agentes que trabalharão neste projeto</p>
                        </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <button onClick={() => onToggleAll(!allActive)} style={{ background: allActive ? "#FEE2E2" : "#ECFDF5", color: allActive ? "#EF4444" : "#10B981", border: "none", borderRadius: "8px", padding: "8px 16px", fontSize: "12px", fontWeight: 700, cursor: "pointer", transition: "all 0.15s" }}>
                            {allActive ? "Desativar Todos" : "Ativar Todos"}
                        </button>
                        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#9CA3AF" }}><X size={20} /></button>
                    </div>
                </div>

                <div className="kanban-scroll-y" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "10px", maxHeight: "60vh", overflowY: "auto", padding: "4px" }}>
                    {agents.map(agent => {
                        const isActive = projectAgents.some(pa => pa.agent_id === agent.id);
                        const score = agent.ranking_score || 0;
                        const tasksCount = agent.tasks_completed || 0;

                        return (
                            <button key={agent.id} onClick={() => onToggle(agent.id)} style={{ 
                                display: "flex", alignItems: "center", gap: "10px", padding: "12px 16px", 
                                background: isActive ? (agent.color || "#6B7280") + "08" : "#FFFFFF", 
                                border: isActive ? `1.5px solid ${agent.color || "#6B7280"}` : "1.5px solid #F0F0F0", 
                                borderRadius: "14px", cursor: "pointer", transition: "all 0.15s", textAlign: "left" 
                            }}>
                                <div style={{ width: 36, height: 36, borderRadius: "10px", background: (agent.color || "#6B7280") + "15", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", fontWeight: 800, color: agent.color || "#6B7280" }}>
                                    {agent.handle?.charAt(0).toUpperCase()}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: "13px", fontWeight: 700, color: "#111827" }}>{agent.name}</div>
                                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                        <div style={{ fontSize: "11px", color: agent.color || "#6B7280", fontFamily: "monospace", fontWeight: 600 }}>@{agent.handle}</div>
                                        <div style={{ display: "flex", alignItems: "center", gap: "3px", background: "#FFFBEB", padding: "1px 6px", borderRadius: "6px", border: "1px solid #FEF3C7" }}>
                                            <Star size={10} fill="#F59E0B" color="#F59E0B" />
                                            <span style={{ fontSize: "10px", fontWeight: 700, color: "#92400E" }}>{score.toFixed(1)}</span>
                                        </div>
                                        <div style={{ fontSize: "10px", color: "#9CA3AF", fontWeight: 500 }}>
                                            {tasksCount} tasks
                                        </div>
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>

                <button onClick={onClose} style={{ width: "100%", background: "#111827", color: "#FFFFFF", border: "none", borderRadius: "12px", padding: "14px", fontSize: "14px", fontWeight: 700, cursor: "pointer" }}>
                    Concluir Ajustes
                </button>
            </div>
        </div>
    );
}

import { Trash, Edit2, Save } from "lucide-react";

function SimpleMarkdown({ text }: { text: string }) {
    const lines = text.split("\n");
    const elements: React.ReactNode[] = [];
    let listItems: React.ReactNode[] = [];
    const flushList = () => { if (listItems.length) { elements.push(<ul key={`ul-${elements.length}`} style={{ margin: "6px 0 10px 0", paddingLeft: "20px", listStyle: "none" }}>{listItems}</ul>); listItems = []; } };
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trim();
        if (!trimmed) { flushList(); elements.push(<div key={`br-${i}`} style={{ height: "8px" }} />); continue; }
        if (trimmed.startsWith("## ")) { flushList(); elements.push(<h3 key={`h-${i}`} style={{ fontSize: "14px", fontWeight: 800, color: "#111827", margin: "14px 0 6px 0", textTransform: "uppercase", letterSpacing: "0.04em", borderBottom: "1px solid #F0F0F0", paddingBottom: "6px" }}>{trimmed.slice(3)}</h3>); continue; }
        if (trimmed.startsWith("- ")) { const content = trimmed.slice(2); listItems.push(<li key={`li-${i}`} style={{ fontSize: "14px", color: "#4B5563", lineHeight: 1.7, marginBottom: "4px", position: "relative", paddingLeft: "14px" }}><span style={{ position: "absolute", left: 0, color: "#9CA3AF", fontWeight: 700 }}>•</span>{formatInline(content)}</li>); continue; }
        flushList();
        elements.push(<p key={`p-${i}`} style={{ fontSize: "14px", color: "#4B5563", lineHeight: 1.7, margin: "2px 0" }}>{formatInline(trimmed)}</p>);
    }
    flushList();
    return <div>{elements}</div>;
}

function formatInline(text: string): React.ReactNode[] {
    const parts: React.ReactNode[] = [];
    const regex = /(\*\*(.+?)\*\*)|(`([^`]+)`)/g;
    let lastIndex = 0;
    let match;
    let key = 0;
    while ((match = regex.exec(text)) !== null) {
        if (match.index > lastIndex) parts.push(<span key={key++}>{text.slice(lastIndex, match.index)}</span>);
        if (match[2]) parts.push(<strong key={key++} style={{ fontWeight: 700, color: "#111827" }}>{match[2]}</strong>);
        else if (match[4]) parts.push(<code key={key++} style={{ background: "#F3F4F6", padding: "1px 6px", borderRadius: "5px", fontSize: "12px", fontFamily: "monospace", color: "#7C3AED" }}>{match[4]}</code>);
        lastIndex = match.index + match[0].length;
    }
    if (lastIndex < text.length) parts.push(<span key={key++}>{text.slice(lastIndex)}</span>);
    return parts;
}

function TaskDetailModal({ task, agent, projectAgents, onDelete, onUpdate, onToggleAssignee, onClose, confirmAction, hasPrev, hasNext, onPrev, onNext }: { task: Task; agent: any; projectAgents: any[]; onDelete: () => void; onUpdate: (t: string, d: string, a: string | null, feedback: string | null, newType?: TaskType) => void; onToggleAssignee?: (agentId: string) => void; onClose: () => void; confirmAction: (t: string, m: string, isDanger?: boolean, confirmText?: string, cancelText?: string) => Promise<boolean>; hasPrev?: boolean; hasNext?: boolean; onPrev?: () => void; onNext?: () => void; }) {
    const col = COLUMNS.find(c => c.id === task.type)!;
    const [isEditing, setIsEditing] = useState(false);
    const [title, setTitle] = useState(task.title);
    const [description, setDescription] = useState(task.description || "");
    const [feedback, setFeedback] = useState(task.feedback || "");
    const [agentId, setAgentId] = useState<string | null>(task.agent_id);

    useEffect(() => {
        setTitle(task.title);
        setDescription(task.description || "");
        setFeedback(task.feedback || "");
        setAgentId(task.agent_id);
        setIsEditing(false);
    }, [task]);

    function handleSave() {
        onUpdate(title, description, agentId, feedback, undefined);
        setIsEditing(false);
    }

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (isEditing) return;
            if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
                e.preventDefault(); // Prevent accidental scrolling
                if (e.key === "ArrowLeft" && hasPrev && onPrev) onPrev();
                if (e.key === "ArrowRight" && hasNext && onNext) onNext();
            }
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handleKeyDown);
        // Hide body scroll when modal is open
        document.body.style.overflow = 'hidden';
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = 'unset';
        };
    }, [isEditing, hasPrev, hasNext, onPrev, onNext, onClose]);

    function handleFeedbackSubmit(action: "approve" | "rework") {
        if (action === "rework" && !feedback.trim()) {
            confirmAction("Feedback Obrigatório", "Para enviar para Rework (Refazer), adicione um feedback explicando o motivo.", false, "Entendi", "Fechar");
            return;
        }
        onUpdate(title, description, agentId, feedback, action === "approve" ? "approved" : "rework");
        onClose();
    }

    return (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", gap: "24px", zIndex: 100, backdropFilter: "blur(8px)", padding: "24px" }} onClick={onClose}>
            {hasPrev && onPrev ? (
                <button onClick={(e) => { e.stopPropagation(); onPrev(); }} style={{ background: "#FFFFFF", border: "none", width: 48, height: 48, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 10px 25px rgba(0,0,0,0.2)", color: "#111827", flexShrink: 0, transition: "all 0.2s" }} onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.1)")} onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}><ChevronLeft size={24} strokeWidth={3} /></button>
            ) : <div style={{ width: 48, flexShrink: 0 }} />}
            <div onClick={e => e.stopPropagation()} style={{ 
                background: "#FFFFFF", borderRadius: "28px", padding: "40px", width: "100%", maxWidth: 680, 
                boxShadow: "0 30px 100px rgba(0,0,0,0.3)", display: "flex", flexDirection: "column", gap: "28px", 
                maxHeight: "85vh", overflowY: "auto",
                scrollbarWidth: 'none', msOverflowStyle: 'none'
            }} className="modal-content-scroll">
                <style>{`.modal-content-scroll::-webkit-scrollbar { display: none; }`}</style>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                        <div style={{ width: 40, height: 40, borderRadius: "12px", background: col.color + "15", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <col.icon size={20} color={col.color} />
                        </div>
                        <div>
                            <Tag color={col.color}>{col.label}</Tag>
                            {task.completed_at && <span style={{ marginLeft: "8px" }}><Tag color="#10B981">Concluída</Tag></span>}
                        </div>
                    </div>
                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                        {!isEditing && (
                            <button onClick={() => setIsEditing(true)} style={{ background: "#F3F4F6", border: "none", borderRadius: "50%", width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#6B7280" }} title="Editar">
                                <Edit2 size={14} />
                            </button>
                        )}
                        <button onClick={async () => { if(await confirmAction("Excluir Task", "Você tem certeza que deseja excluir DEFINITIVAMENTE esta task do Kanban?", true)) onDelete(); }} style={{ background: "#FEE2E2", border: "none", borderRadius: "50%", width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#EF4444" }} title="Excluir">
                            <Trash size={14} />
                        </button>
                        <button onClick={onClose} style={{ background: "#F3F4F6", border: "none", borderRadius: "50%", width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#6B7280" }}><X size={16} /></button>
                    </div>
                </div>

                {isEditing ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                        <div>
                            <label style={{ fontSize: "12px", fontWeight: 600, color: "#374151", marginBottom: "6px", display: "block" }}>Título</label>
                            <input value={title} onChange={e => setTitle(e.target.value)} autoFocus style={{ width: "100%", background: "#F9FAFB", border: "1.5px solid #F0F0F0", borderRadius: "10px", padding: "10px 14px", fontSize: "16px", fontWeight: 700, color: "#111827", outline: "none" }} />
                        </div>
                        <div>
                            <label style={{ fontSize: "12px", fontWeight: 600, color: "#374151", marginBottom: "6px", display: "block" }}>Descrição</label>
                            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} style={{ width: "100%", background: "#F9FAFB", border: "1.5px solid #F0F0F0", borderRadius: "10px", padding: "10px 14px", fontSize: "14px", color: "#4B5563", outline: "none", resize: "vertical" }} />
                        </div>
                        <div>
                            <label style={{ fontSize: "12px", fontWeight: 600, color: "#374151", marginBottom: "8px", display: "block" }}>Responsáveis (Co-autores)</label>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                                {projectAgents.map(a => {
                                    const isActive = task.assignees?.some(as => as.agent_id === a.id);
                                    return (
                                        <button 
                                            key={a.id} 
                                            onClick={() => onToggleAssignee?.(a.id)} 
                                            style={{ 
                                                display: "flex", alignItems: "center", gap: "6px",
                                                background: isActive ? (a.color || "#6B7280") + "15" : "#F9FAFB", 
                                                border: isActive ? `1.5px solid ${a.color || "#6B7280"}` : "1.5px solid #F0F0F0", 
                                                borderRadius: "10px", padding: "6px 12px", fontSize: "11px", fontWeight: 700, 
                                                color: isActive ? (a.color || "#6B7280") : "#9CA3AF", cursor: "pointer", 
                                                transition: "all 0.1s", fontFamily: "monospace" 
                                            }}
                                        >
                                            <div style={{ width: 14, height: 14, borderRadius: "50%", background: isActive ? (a.color || "#6B7280") : "#D1D5DB", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "8px", color: "#FFF" }}>
                                                {a.handle?.charAt(0).toUpperCase()}
                                            </div>
                                            @{a.handle}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                        <button onClick={handleSave} disabled={!title.trim()} style={{ width: "100%", marginTop: "10px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", background: title.trim() ? `linear-gradient(135deg, ${col.color}, ${col.color}CC)` : "#F3F4F6", color: title.trim() ? "#FFFFFF" : "#9CA3AF", border: "none", borderRadius: "10px", padding: "12px", fontSize: "14px", fontWeight: 700, cursor: title.trim() ? "pointer" : "default" }}>
                            <Save size={16} /> Salvar Alterações
                        </button>
                    </div>
                ) : (
                    <>
                        <div>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                                <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#111827", lineHeight: 1.3, margin: 0 }}>
                                    {task.title}
                                </h2>
                                <span style={{ fontSize: "12px", fontWeight: 800, color: "#9CA3AF", background: "#F3F4F6", padding: "2px 8px", borderRadius: "6px", fontFamily: "monospace", flexShrink: 0 }}>
                                    #{task.id.slice(0, 4).toUpperCase()}
                                </span>
                            </div>
                            {task.description ? (
                                <SimpleMarkdown text={task.description} />
                            ) : (
                                <p style={{ fontSize: "14px", color: "#9CA3AF", fontStyle: "italic", margin: 0 }}>Sem descrição detalhada.</p>
                            )}
                        </div>

                        <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", background: "#F9FAFB", padding: "20px", borderRadius: "16px", border: "1px solid #F0F0F0" }}>
                            <div style={{ flex: 1, minWidth: "200px" }}>
                                <div style={{ fontSize: "11px", fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", marginBottom: "8px" }}>Agente Responsável</div>
                                {agent ? (
                                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                        <div style={{ width: 28, height: 28, borderRadius: "8px", background: (agent.color || "#6B7280") + "15", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 800, color: agent.color || "#6B7280" }}>{agent.handle?.charAt(0).toUpperCase()}</div>
                                        <div>
                                            <div style={{ fontSize: "14px", fontWeight: 600, color: "#111827" }}>{agent.name}</div>
                                            <div style={{ fontSize: "12px", fontWeight: 600, color: agent.color || "#6B7280", fontFamily: "monospace" }}>@{agent.handle}</div>
                                        </div>
                                    </div>
                                ) : (
                                    <span style={{ fontSize: "14px", color: "#9CA3AF" }}>Não atribuído</span>
                                )}
                            </div>
                            <div style={{ flex: 1, minWidth: "150px" }}>
                                <div style={{ fontSize: "11px", fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", marginBottom: "8px" }}>Criado em</div>
                                <div style={{ fontSize: "14px", color: "#111827", fontWeight: 500 }}>{new Date(task.created_at).toLocaleString("pt-BR")}</div>
                            </div>
                            {task.completed_at && (
                                <div style={{ flex: 1, minWidth: "150px" }}>
                                    <div style={{ fontSize: "11px", fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", marginBottom: "8px" }}>Concluído em</div>
                                    <div style={{ fontSize: "14px", color: "#10B981", fontWeight: 600 }}>{new Date(task.completed_at).toLocaleString("pt-BR")}</div>
                                </div>
                            )}
                        </div>

                        {/* Customer Feedback Area */}
                        {(task.type === "done" || task.type === "approved" || task.type === "rework" || feedback) && (
                            <div style={{ borderTop: "1px solid #F0F0F0", paddingTop: "24px", marginTop: "8px" }}>
                                <h3 style={{ fontSize: "15px", fontWeight: 800, color: "#111827", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
                                    Feedback do Cliente (Dani)
                                </h3>
                                <p style={{ fontSize: "13px", color: "#6B7280", marginBottom: "16px", lineHeight: 1.5 }}>
                                    A task foi dada como pronta pelo squad. Se estiver tudo certo clique em Aprovar. Se faltou algo ou algo precisa ser alterado, deixe o motivo abaixo e clique em Rework.
                                </p>
                                <textarea value={feedback} onChange={e => setFeedback(e.target.value)} placeholder="Escreva seu feedback ou motivo da recusa..." rows={3} style={{ width: "100%", background: "#F9FAFB", border: "1.5px solid #F0F0F0", borderRadius: "10px", padding: "12px 14px", fontSize: "14px", color: "#111827", outline: "none", resize: "vertical", marginBottom: "16px" }} />
                                
                                <div style={{ display: "flex", gap: "12px" }}>
                                    <button onClick={() => handleFeedbackSubmit("approve")} style={{ flex: 1, width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", background: `linear-gradient(135deg, #8B5CF6, #7C3AED)`, color: "#FFFFFF", border: "none", borderRadius: "10px", padding: "12px", fontSize: "14px", fontWeight: 700, cursor: "pointer", boxShadow: "0 2px 8px rgba(139, 92, 246, 0.25)" }}>
                                        <CheckCircle2 size={16} /> Aprovar Task
                                    </button>
                                    <button onClick={() => handleFeedbackSubmit("rework")} style={{ flex: 1, width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", background: "#FFFFFF", border: "1.5px solid #F87171", color: "#EF4444", borderRadius: "10px", padding: "12px", fontSize: "14px", fontWeight: 700, cursor: "pointer" }}>
                                        <RotateCcw size={16} /> Enviar p/ Rework
                                    </button>
                                </div>
                            </div>
                        )}

                        {task.type === "master_plan" && (
                            <div style={{ marginTop: "32px", paddingTop: "24px", borderTop: "1.5px solid #F3F4F6", textAlign: "center" }}>
                                <p style={{ fontSize: "12px", color: "#9CA3AF", marginBottom: "16px" }}>Objetivo distribuído em tasks individuais?</p>
                                <button
                                    onClick={async () => { if (await confirmAction("Finalizar Master Plan", "Isso excluirá o placeholder do Master Plan para focar apenas nas tasks individuais do squad. Deseja prosseguir?", false)) onDelete(); }}
                                    style={{ background: "#F3F4F6", border: "none", borderRadius: "10px", padding: "10px 20px", fontSize: "13px", fontWeight: 700, color: "#6B7280", cursor: "pointer", transition: "all 0.2s" }}
                                    onMouseEnter={e => (e.currentTarget.style.background = "#E5E7EB")}
                                    onMouseLeave={e => (e.currentTarget.style.background = "#F3F4F6")}
                                >
                                    Finalizar Planejamento e Excluir
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
            {hasNext && onNext ? (
                <button onClick={(e) => { e.stopPropagation(); onNext(); }} style={{ background: "#FFFFFF", border: "none", width: 48, height: 48, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 10px 25px rgba(0,0,0,0.2)", color: "#111827", flexShrink: 0, transition: "all 0.2s" }} onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.1)")} onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}><ChevronRight size={24} strokeWidth={3} /></button>
            ) : <div style={{ width: 48, flexShrink: 0 }} />}
        </div>
    );
}

function AddTaskModal({ column, agents, onSave, onClose }: { column: TaskType; agents: any[]; onSave: (t: string, d: string, a: string | null) => void; onClose: () => void }) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [agentId, setAgentId] = useState<string | null>("orchestrator");
    const col = COLUMNS.find(c => c.id === column)!;

    return (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, backdropFilter: "blur(4px)" }} onClick={onClose}>
            <div onClick={e => e.stopPropagation()} style={{ background: "#FFFFFF", borderRadius: "18px", padding: "28px", width: "100%", maxWidth: 460, boxShadow: "0 16px 64px rgba(0,0,0,0.15)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div style={{ width: 32, height: 32, borderRadius: "8px", background: col.color + "12", display: "flex", alignItems: "center", justifyContent: "center" }}><col.icon size={16} color={col.color} /></div>
                        <div><h3 style={{ fontSize: "16px", fontWeight: 700, color: "#111827", margin: 0 }}>Nova Task</h3><span style={{ fontSize: "11px", color: col.color, fontWeight: 600 }}>{col.label}</span></div>
                    </div>
                    <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#9CA3AF", padding: "4px" }}><X size={18} /></button>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                    <div>
                        <label style={{ fontSize: "12px", fontWeight: 600, color: "#374151", marginBottom: "6px", display: "block" }}>Título *</label>
                        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Descreva a tarefa..." autoFocus
                            style={{ width: "100%", background: "#F9FAFB", border: "1.5px solid #F0F0F0", borderRadius: "10px", padding: "10px 14px", fontSize: "14px", color: "#111827", outline: "none" }} />
                    </div>
                    <div>
                        <label style={{ fontSize: "12px", fontWeight: 600, color: "#374151", marginBottom: "6px", display: "block" }}>Descrição</label>
                        <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Detalhes..." rows={3}
                            style={{ width: "100%", background: "#F9FAFB", border: "1.5px solid #F0F0F0", borderRadius: "10px", padding: "10px 14px", fontSize: "13px", color: "#111827", outline: "none", resize: "vertical" }} />
                    </div>
                    <div>
                        <label style={{ fontSize: "12px", fontWeight: 600, color: "#374151", marginBottom: "6px", display: "block" }}>Agente Responsável</label>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                            <button onClick={() => setAgentId(null)} style={{ background: !agentId ? "#E85D2F10" : "#F9FAFB", border: !agentId ? "1.5px solid #E85D2F" : "1.5px solid #F0F0F0", borderRadius: "8px", padding: "6px 12px", fontSize: "11px", fontWeight: 600, color: !agentId ? "#E85D2F" : "#9CA3AF", cursor: "pointer" }}>@orch (auto)</button>
                            {agents.map(a => (
                                <button key={a.id} onClick={() => setAgentId(a.id)} style={{ background: agentId === a.id ? (a.color || "#6B7280") + "10" : "#F9FAFB", border: agentId === a.id ? `1.5px solid ${a.color || "#6B7280"}` : "1.5px solid #F0F0F0", borderRadius: "8px", padding: "6px 12px", fontSize: "11px", fontWeight: 600, color: agentId === a.id ? (a.color || "#6B7280") : "#9CA3AF", cursor: "pointer", fontFamily: "monospace" }}>@{a.handle}</button>
                            ))}
                        </div>
                    </div>
                    <button onClick={() => { if (title.trim()) onSave(title, description, agentId); }} disabled={!title.trim()}
                        style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", background: title.trim() ? `linear-gradient(135deg, ${col.color}, ${col.color}CC)` : "#F3F4F6", color: title.trim() ? "#FFFFFF" : "#9CA3AF", border: "none", borderRadius: "10px", padding: "12px", fontSize: "14px", fontWeight: 700, cursor: title.trim() ? "pointer" : "default" }}>
                        <Plus size={16} /> Criar Task
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Reports Modal ─────────────────────────────────────────────────────────────
function ReportsModal({ tasks, project, agents, onClose, confirmAction }: { tasks: Task[]; project: any; agents: any[]; onClose: () => void; confirmAction: (t: string, m: string, isDanger?: boolean, confirmText?: string, cancelText?: string) => Promise<boolean> }) {
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [narrativeText, setNarrativeText] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Group tasks by date
    const dateMap = new Map<string, Task[]>();
    tasks.forEach(t => {
        // Include relevant types requested by user
        if (!["done", "approved", "rework", "on_going", "to_do"].includes(t.type)) return;
        const d = new Date(t.updated_at || t.created_at);
        // Garante que o agrupamento usa o fuso horário oficial do DMZ OS (America/Sao_Paulo) e não UTC
        const ptBrStr = new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Sao_Paulo", year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
        const [dd, mm, yyyy] = ptBrStr.split('/');
        const yyyyMmDd = `${yyyy}-${mm}-${dd}`;
        
        if (!dateMap.has(yyyyMmDd)) dateMap.set(yyyyMmDd, []);
        dateMap.get(yyyyMmDd)!.push(t);
    });
    const sortedDates = Array.from(dateMap.keys()).sort((a, b) => b.localeCompare(a));
    const formatter = new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Sao_Paulo", day: "2-digit", month: "long", year: "numeric", weekday: "short" });

    // Ensure we fetch narrative if changing dates manually
    useEffect(() => {
        setAudioUrl(null);
        setNarrativeText(null);
        setIsPlaying(false);
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
    }, [selectedDateStr]);

    const handleGenerate = async (forceRegenerate: boolean = false, autoPlay: boolean = false) => {
        if (!selectedDateStr) return;
        setLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;
            const userName = session?.user?.user_metadata?.first_name || session?.user?.user_metadata?.full_name?.split(' ')[0] || session?.user?.email?.split('@')[0] || "Equipe";
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://dmz-agents-production.up.railway.app";
            
            const reqTasks = dateMap.get(selectedDateStr) || [];
            
            const res = await fetch(`${apiUrl}/api/reports/daily/explain`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({
                    project_id: project.id,
                    user_first_name: userName,
                    date_str: selectedDateStr,
                    force_regenerate: forceRegenerate,
                    tasks: reqTasks.map(t => {
                        const handles = (t.assignees || []).map(as => {
                            const ag = agents.find(a => a.id === as.agent_id);
                            return ag?.handle || "agente";
                        });
                        if (handles.length === 0 && t.agent_id) {
                            const ag = agents.find(a => a.id === t.agent_id);
                            if (ag) handles.push(ag.handle);
                        }
                        return { 
                            title: t.title, 
                            type: t.type, 
                            agent_handle: handles.length > 0 ? handles.join(", ") : "squad" 
                        };
                    })
                })
            });

            if (!res.ok) throw new Error("Erro na solicitação. Status " + res.status);
            const data = await res.json();
            
            if (data.script) setNarrativeText(data.script);
            
            let finalAudioUrl = data.audioUrl;

            // Se não temos áudio (cache antigo ou gerado agora no back sem áudio), 
            // chamamos a Edge Function para gerar o áudio
            if (!finalAudioUrl && data.script) {
                try {
                    const { data: edgeData, error: edgeError } = await supabase.functions.invoke('generate-report-audio', {
                        body: { 
                            script: data.script, 
                            project_id: project.id, 
                            date_str: selectedDateStr 
                        }
                    });

                    if (edgeError) throw edgeError;
                    if (edgeData?.audioUrl) {
                        finalAudioUrl = edgeData.audioUrl;
                    }
                } catch (err) {
                    console.error("Erro ao gerar áudio via Edge Function:", err);
                }
            }
            
            if (finalAudioUrl) {
                setAudioUrl(finalAudioUrl);
                if (autoPlay) {
                    setTimeout(() => {
                        if (audioRef.current) {
                            audioRef.current.play().catch(e => console.error("Autoplay falhou", e));
                            setIsPlaying(true);
                        }
                    }, 500);
                }
            } else if (!finalAudioUrl && data.script) {
               console.warn("Áudio não pôde ser gerado nesta tentativa.");
            } else {
                confirmAction("Erro", data.error || "Servidor não retornou o relatório.", true, "OK", "Fechar");
            }
        } catch (e: any) {
            confirmAction("Erro", e.message, true, "OK", "Fechar");
        }
        setLoading(false);
    };

    const handlePlayPause = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
        } else {
            audioRef.current.play().catch(e => {
                console.error("Audio playback failed:", e);
                setIsPlaying(false);
            });
            setIsPlaying(true);
        }
    };

    return (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, backdropFilter: "blur(4px)", padding: "24px" }} onClick={onClose}>
            <div onClick={e => e.stopPropagation()} className="reports-modal-scroll" style={{ background: "#FFFFFF", borderRadius: "24px", padding: "32px", width: "100%", maxWidth: 600, boxShadow: "0 20px 80px rgba(0,0,0,0.15)", display: "flex", flexDirection: "column", gap: selectedDateStr ? "20px" : "24px", maxHeight: "90vh", overflowY: "auto" }}>
                <style>{`.reports-modal-scroll::-webkit-scrollbar { display: none; }`}</style>
                
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                        {selectedDateStr ? (
                            <button onClick={() => setSelectedDateStr(null)} style={{ width: 36, height: 36, borderRadius: "10px", background: "#F3F4F6", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#6B7280", marginRight: "4px" }}>
                                <ArrowLeft size={16} />
                            </button>
                        ) : (
                            <div style={{ width: 44, height: 44, borderRadius: "12px", background: "#EEF2FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <FileText size={22} color="#4F46E5" />
                            </div>
                        )}
                        <div>
                            <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#111827", margin: 0, letterSpacing: "-0.02em" }}>Histórico do Projeto</h2>
                            <span style={{ fontSize: "12px", color: "#6B7280" }}>
                                {selectedDateStr ? formatter.format(new Date(`${selectedDateStr}T12:00:00Z`)) : `${sortedDates.length} dias documentados`}
                            </span>
                        </div>
                    </div>
                    <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#9CA3AF", padding: "4px" }}><X size={18} /></button>
                </div>

                {audioUrl && (
                    <audio ref={audioRef} src={audioUrl} onEnded={() => setIsPlaying(false)} />
                )}

                {selectedDateStr ? (
                    // ── Detalhe do Dia ─────────────────────────────────────────────
                    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                        
                        <div style={{ display: "flex", gap: "12px" }}>
                            <button onClick={() => handleGenerate(!!narrativeText, false)} disabled={loading} style={{ 
                                display: "flex", alignItems: "center", justifyContent: "center", flex: 1, gap: "8px", background: narrativeText ? "#F3F4F6" : "linear-gradient(135deg, #4F46E5, #3730A3)", 
                                color: narrativeText ? "#374151" : "#FFFFFF", border: narrativeText ? "1px solid #E5E7EB" : "none", borderRadius: "10px", padding: "12px", fontSize: "14px", fontWeight: 700, 
                                cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1, transition: "all 0.2s" 
                            }}>
                                {loading ? <Spinner size={16} /> : <FileText size={16} />}
                                {loading ? "Processando..." : (narrativeText ? "Gerar Novo Relatório" : "Gerar Relatório")}
                            </button>
                            
                            <button onClick={() => {
                                if (!narrativeText) handleGenerate(false, true);
                                else handlePlayPause();
                            }} disabled={!!(loading && !audioUrl && narrativeText)} style={{ 
                                display: "flex", alignItems: "center", justifyContent: "center", flex: 1, gap: "8px", background: "linear-gradient(135deg, #10B981, #059669)", 
                                color: "#FFFFFF", border: "none", borderRadius: "10px", padding: "12px", fontSize: "14px", fontWeight: 700, 
                                cursor: (loading && !audioUrl && narrativeText) ? "not-allowed" : "pointer", transition: "all 0.2s", opacity: (loading && !audioUrl && narrativeText) ? 0.7 : 1
                            }}>
                                {(!narrativeText && loading) ? <Spinner size={16} /> : (isPlaying ? <Square size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />)}
                                {isPlaying ? "Pausar Narração" : "Ouvir Relatório"}
                            </button>
                        </div>
                        
                        {/* Audio Waveform Anim */}
                        {isPlaying && (
                            <div style={{ display: "flex", alignItems: "center", gap: "4px", height: "24px", alignSelf: "center", marginTop: "-8px", marginBottom: "8px" }}>
                                {[1, 2, 3, 4, 5, 6].map(i => (
                                    <div key={i} style={{
                                        width: "4px", background: "#10B981", borderRadius: "2px",
                                        animation: `equalizer ${0.5 + Math.random() * 0.5}s ease-in-out infinite alternate`,
                                        height: `${Math.random() * 100}%`
                                    }} />
                                ))}
                                <style>{`@keyframes equalizer { 0% { height: 2px; } 100% { height: 24px; } }`}</style>
                            </div>
                        )}

                        {narrativeText && (
                            <div style={{ background: "#EEF2FF", border: "1.5px solid #E0E7FF", borderRadius: "14px", padding: "20px" }}>
                                <div style={{ fontSize: "11px", fontWeight: 800, color: "#4F46E5", textTransform: "uppercase", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
                                    <Bot size={12} /> Narrativa do Squad
                                </div>
                                <p style={{ fontSize: "14px", color: "#312E81", lineHeight: 1.6, margin: 0 }}>
                                    {narrativeText}
                                </p>
                            </div>
                        )}

                        <div style={{ background: "#FAFAFA", border: "1.5px solid #F0F0F0", borderRadius: "16px", padding: "20px" }}>
                            <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#374151", marginBottom: "16px" }}>Estrutura de Atividades ({dateMap.get(selectedDateStr)?.length || 0})</h3>
                            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                                {(() => {
                                    const dayTasks = dateMap.get(selectedDateStr) || [];
                                    const ORDER: TaskType[] = ["approved", "to_do", "on_going", "done", "rework"];
                                    
                                    return ORDER.map(type => {
                                        const typeTasks = dayTasks.filter(t => t.type === type);
                                        if (typeTasks.length === 0) return null;
                                        
                                        const col = COLUMNS.find(c => c.id === type)!;
                                        const isApprovalSection = type === "done";

                                        return (
                                            <div key={type} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2px" }}>
                                                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                                        <div style={{ width: 6, height: 6, borderRadius: "50%", background: col.color }} />
                                                        <span style={{ fontSize: "11px", fontWeight: 800, color: col.color, textTransform: "uppercase", letterSpacing: "0.05em" }}>{col.label}</span>
                                                    </div>
                                                    {isApprovalSection && (
                                                        <span style={{ fontSize: "10px", fontWeight: 700, background: "#FEE2E2", color: "#EF4444", padding: "2px 8px", borderRadius: "6px" }}>AGUARDANDO APROVAÇÃO</span>
                                                    )}
                                                </div>
                                                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                                    {typeTasks.map(t => {
                                                        const handles = (t.assignees || []).map(as => {
                                                            const ag = agents.find(a => a.id === as.agent_id);
                                                            return ag ? `@${ag.handle}` : null;
                                                        }).filter(Boolean);

                                                        return (
                                                            <div key={t.id} style={{ 
                                                                display: "flex", alignItems: "center", justifyContent: "space-between", 
                                                                background: isApprovalSection ? "#FFF7F7" : "#FFFFFF", 
                                                                padding: "10px 14px", borderRadius: "10px", 
                                                                border: isApprovalSection ? "1px solid #FEE2E2" : "1px solid #E5E7EB",
                                                                boxShadow: isApprovalSection ? "0 2px 4px rgba(239,68,68,0.05)" : "none"
                                                            }}>
                                                                <div style={{ display: "flex", flexDirection: "column", gap: "2px", flex: 1, overflow: "hidden" }}>
                                                                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                                                        <span style={{ fontSize: "10px", fontWeight: 800, color: "#9CA3AF", fontFamily: "monospace" }}>#{t.id.slice(0, 4).toUpperCase()}</span>
                                                                        <span style={{ fontSize: "13px", color: "#111827", fontWeight: 600 }}>{t.title}</span>
                                                                    </div>
                                                                    {t.description && (
                                                                        <p style={{ fontSize: "11px", color: "#6B7280", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                                                            {stripMarkdown(t.description)}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                                <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0, marginLeft: "12px" }}>
                                                                    {handles.length > 0 ? (
                                                                        <span style={{ fontSize: "10px", fontWeight: 700, color: col.color, background: col.color + "10", padding: "3px 8px", borderRadius: "6px", fontFamily: "monospace" }}>
                                                                            {handles.join(" ")}
                                                                        </span>
                                                                    ) : <span style={{ fontSize: "10px", color: "#D1D5DB" }}>squad</span>}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        );
                                    });
                                })()}
                            </div>
                        </div>

                    </div>
                ) : (
                    // ── Lista de Datas ─────────────────────────────────────────────
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        {sortedDates.length === 0 ? (
                            <p style={{ fontSize: "14px", color: "#9CA3AF", textAlign: "center", padding: "40px 0" }}>Nenhuma data com atividades registradas foi encontrada.</p>
                        ) : sortedDates.map(dateStr => {
                            const dateTasks = dateMap.get(dateStr) || [];
                            return (
                                <button key={dateStr} onClick={() => setSelectedDateStr(dateStr)} style={{ 
                                    display: "flex", alignItems: "center", justifyContent: "space-between", 
                                    background: "#FFFFFF", border: "1.5px solid #F0F0F0", borderRadius: "12px", 
                                    padding: "16px", cursor: "pointer", transition: "all 0.1s"
                                }}
                                onMouseEnter={e => e.currentTarget.style.borderColor = "#D1D5DB"}
                                onMouseLeave={e => e.currentTarget.style.borderColor = "#F0F0F0"}>
                                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "4px" }}>
                                        <span style={{ fontSize: "14px", fontWeight: 700, color: "#111827", textTransform: "capitalize" }}>
                                            {formatter.format(new Date(`${dateStr}T12:00:00Z`))}
                                        </span>
                                        <span style={{ fontSize: "12px", color: "#6B7280" }}>
                                            {dateTasks.length} {dateTasks.length === 1 ? "tarefa iterada" : "tarefas iteradas"}
                                        </span>
                                    </div>
                                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center", color: "#9CA3AF" }}>
                                        <ArrowLeft size={16} style={{ transform: "rotate(180deg)" }} />
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

function Spinner({ size = 16 }: { size?: number }) {
    return (
        <svg fill="none" height={size} viewBox="0 0 16 16" width={size} xmlns="http://www.w3.org/2000/svg">
            <path d="M8 1.5C4.41015 1.5 1.5 4.41015 1.5 8C1.5 11.5899 4.41015 14.5 8 14.5C11.5899 14.5 14.5 11.5899 14.5 8" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" style={{ animation: "spin 1s linear infinite", transformOrigin: "8px 8px" }} />
        </svg>
    );
}
