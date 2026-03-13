"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
    ArrowLeft, Plus, Bot, Clock, CheckCircle2, AlertTriangle,
    RotateCcw, BookOpen, Activity, GripVertical,
    Brain, Key, Copy, Check, Settings, Terminal,
    Users, X, FolderOpen, BadgeCheck,
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

        const [{ data: taskData }, { data: agentData }, { data: paData }] = await Promise.all([
            supabase.from("dmz_agents_tasks").select("*").eq("project_id", projData.id).order("priority", { ascending: false }).order("created_at"),
            supabase.from("dmz_agents_definitions").select("id, handle, name, full_name, icon, color, category"),
            supabase.from("dmz_agents_project_agents").select("agent_id, status").eq("project_id", projData.id),
        ]);
        setTasks(taskData || []); setAgents(agentData || []); setProjectAgents(paData || []); setLoading(false);
    }, [slug]);

    useEffect(() => { loadData(); }, [loadData]);

    useEffect(() => {
        if (!project) return;
        const ch = supabase.channel(`tasks-${project.id}`)
            .on("postgres_changes", { event: "*", schema: "public", table: "dmz_agents_tasks", filter: `project_id=eq.${project.id}` }, () => loadData())
            .subscribe();
        return () => { supabase.removeChannel(ch); };
    }, [project, loadData]);

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

            // Audio notification
            if (newType === "done") new Audio('/assets/done.mp3').play().catch(() => {});
            else if (newType === "on_going") new Audio('/assets/ongoing.mp3').play().catch(() => {});
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
                    <div style={{ display: "flex", gap: "8px" }}>
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
                            <div style={{ fontSize: "10px", fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", marginBottom: "6px" }}>API Key</div>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}><code style={{ fontSize: "12px", color: "#E85D2F", fontFamily: "monospace" }}>{project.api_key}</code><CopyBtn text={project.api_key} /></div>
                        </div>
                        <div>
                            <div style={{ fontSize: "10px", fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", marginBottom: "6px" }}>.env.dmz</div>
                            <CopyBtn text={`DMZ_PROJECT_SLUG=${project.slug}\nDMZ_API_KEY=${project.api_key}`} />
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
                                                <h4 style={{ fontSize: "13px", fontWeight: 700, color: "#111827", lineHeight: 1.4, margin: 0, flex: 1 }}>{task.title}</h4>
                                                <button onClick={e => { e.stopPropagation(); deleteTask(task.id); }} style={{ background: "none", border: "none", cursor: "pointer", padding: "2px", color: "#D1D5DB", marginLeft: "8px" }}><X size={13} /></button>
                                            </div>
                                            {task.description && <p style={{ fontSize: "12px", color: "#6B7280", lineHeight: 1.5, margin: "0 0 10px", maxHeight: "52px", overflow: "hidden" }}>{task.description}</p>}
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                {agent ? (
                                                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                                        <div style={{ width: 22, height: 22, borderRadius: "6px", background: (agent.color || "#6B7280") + "15", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: 800, color: agent.color || "#6B7280" }}>{agent.handle?.charAt(0).toUpperCase()}</div>
                                                        <span style={{ fontSize: "12px", fontWeight: 600, color: agent.color || "#6B7280", fontFamily: "monospace" }}>@{agent.handle}</span>
                                                    </div>
                                                ) : <span style={{ fontSize: "12px", color: "#D1D5DB" }}>sem agente</span>}
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

            {/* Task Detail Modal */}
            {selectedTask && (
                <TaskDetailModal
                    task={selectedTask}
                    agent={getAgent(selectedTask.agent_id)}
                    projectAgents={agents.filter(a => projectAgents.some(pa => pa.agent_id === a.id))}
                    onDelete={() => { deleteTask(selectedTask.id); setSelectedTask(null); }}
                    onUpdate={(t, d, a, f, type) => updateTaskContent(selectedTask.id, t, d, a, f, type)}
                    onClose={() => setSelectedTask(null)}
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

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}

import { Trash, Edit2, Save } from "lucide-react";

function TaskDetailModal({ task, agent, projectAgents, onDelete, onUpdate, onClose, confirmAction }: { task: Task; agent: any; projectAgents: any[]; onDelete: () => void; onUpdate: (t: string, d: string, a: string | null, feedback: string | null, newType?: TaskType) => void; onClose: () => void; confirmAction: (t: string, m: string, isDanger?: boolean) => Promise<boolean> }) {
    const col = COLUMNS.find(c => c.id === task.type)!;
    const [isEditing, setIsEditing] = useState(false);
    const [title, setTitle] = useState(task.title);
    const [description, setDescription] = useState(task.description || "");
    const [feedback, setFeedback] = useState(task.feedback || "");
    const [agentId, setAgentId] = useState<string | null>(task.agent_id);

    function handleSave() {
        onUpdate(title, description, agentId, feedback, undefined);
        setIsEditing(false);
    }

    function handleFeedbackSubmit(action: "approve" | "rework") {
        if (action === "rework" && !feedback.trim()) {
            alert("Para enviar para Rework (Refazer), adicione um feedback explicando o motivo.");
            return;
        }
        onUpdate(title, description, agentId, feedback, action === "approve" ? "approved" : "rework");
        onClose();
    }

    return (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, backdropFilter: "blur(4px)", padding: "24px" }} onClick={onClose}>
            <div onClick={e => e.stopPropagation()} style={{ background: "#FFFFFF", borderRadius: "24px", padding: "32px", width: "100%", maxWidth: 600, boxShadow: "0 20px 80px rgba(0,0,0,0.15)", display: "flex", flexDirection: "column", gap: "24px", maxHeight: "90vh", overflowY: "auto" }}>
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
                            <label style={{ fontSize: "12px", fontWeight: 600, color: "#374151", marginBottom: "6px", display: "block" }}>Responsável</label>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                                <button onClick={() => setAgentId("orchestrator")} style={{ background: agentId === "orchestrator" ? "#E85D2F10" : "#F9FAFB", border: agentId === "orchestrator" ? "1.5px solid #E85D2F" : "1.5px solid #F0F0F0", borderRadius: "8px", padding: "6px 12px", fontSize: "11px", fontWeight: 600, color: agentId === "orchestrator" ? "#E85D2F" : "#9CA3AF", cursor: "pointer" }}>@orch (auto)</button>
                                {projectAgents.map(a => (
                                    <button key={a.id} onClick={() => setAgentId(a.id)} style={{ background: agentId === a.id ? (a.color || "#6B7280") + "10" : "#F9FAFB", border: agentId === a.id ? `1.5px solid ${a.color || "#6B7280"}` : "1.5px solid #F0F0F0", borderRadius: "8px", padding: "6px 12px", fontSize: "11px", fontWeight: 600, color: agentId === a.id ? (a.color || "#6B7280") : "#9CA3AF", cursor: "pointer", fontFamily: "monospace" }}>@{a.handle}</button>
                                ))}
                                <button onClick={() => setAgentId(null)} style={{ background: !agentId ? "#F3F4F6" : "#FFFFFF", border: !agentId ? "1.5px solid #D1D5DB" : "1.5px solid #F0F0F0", borderRadius: "8px", padding: "6px 12px", fontSize: "11px", fontWeight: 600, color: !agentId ? "#4B5563" : "#9CA3AF", cursor: "pointer" }}>Limpar</button>
                            </div>
                        </div>
                        <button onClick={handleSave} disabled={!title.trim()} style={{ width: "100%", marginTop: "10px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", background: title.trim() ? `linear-gradient(135deg, ${col.color}, ${col.color}CC)` : "#F3F4F6", color: title.trim() ? "#FFFFFF" : "#9CA3AF", border: "none", borderRadius: "10px", padding: "12px", fontSize: "14px", fontWeight: 700, cursor: title.trim() ? "pointer" : "default" }}>
                            <Save size={16} /> Salvar Alterações
                        </button>
                    </div>
                ) : (
                    <>
                        <div>
                            <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#111827", marginBottom: "16px", lineHeight: 1.3 }}>
                                {task.title}
                            </h2>
                            {task.description ? (
                                <p style={{ fontSize: "15px", color: "#4B5563", lineHeight: 1.6, whiteSpace: "pre-wrap", margin: 0 }}>
                                    {task.description}
                                </p>
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
