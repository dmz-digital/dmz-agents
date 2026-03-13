"use client";

import { useSearchParams } from "next/navigation";
import ProjectsListView from "./ProjectsListView";
import KanbanBoardView from "./KanbanBoardView";
import ProjectMemoryView from "./ProjectMemoryView";
import ProjectInstallView from "./ProjectInstallView";

/**
 * Router client-side para /app/projects (via Search Params - Safe Static Export)
 * 
 * Rotas:
 *   /app/projects           → Lista de projetos (sem query 'id')
 *   /app/projects?id=xxx    → Kanban Board do projeto 'xxx'
 *   /app/projects?id=xxx&view=memory → Memória do projeto 'xxx'
 */
export default function ProjectDetailClient() {
    const searchParams = useSearchParams();
    const projectId = searchParams.get('id');
    const view = searchParams.get('view');

    // Sem project_id -> Mostra a lista
    if (!projectId) {
        return <ProjectsListView />;
    }

    // Com project_id + view=memory -> Mostra memória
    if (view === "memory") {
        return <ProjectMemoryView slug={projectId} />;
    }

    // Com project_id + view=install -> Mostra instruções de instalação CLI
    if (view === "install") {
        return <ProjectInstallView slug={projectId} />;
    }

    // Com project_id apenas -> Mostra Kanban
    return <KanbanBoardView slug={projectId} />;
}
