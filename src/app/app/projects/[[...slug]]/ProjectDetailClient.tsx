"use client";

import { useParams, useSearchParams } from "next/navigation";
import ProjectsListView from "./ProjectsListView";
import KanbanBoardView from "./KanbanBoardView";
import ProjectMemoryView from "./ProjectMemoryView";

/**
 * Router client-side para /app/projects/[[...slug]]
 * 
 * Rotas:
 *   /app/projects           → Lista de projetos (slug = undefined | [])
 *   /app/projects/xxx       → Kanban Board do projeto (slug = ["xxx"])
 *   /app/projects/xxx?view=memory → Memória do projeto (slug = ["xxx"])
 */
export default function ProjectDetailClient() {
    const params = useParams();
    const searchParams = useSearchParams();
    const slugParts = (params.slug as string[] | undefined) || [];

    // No slug → Projects list
    if (slugParts.length === 0) {
        return <ProjectsListView />;
    }

    const projectSlug = slugParts[0];
    const view = searchParams.get('view');

    // /projects/xxx?view=memory → Memory view
    if (view === "memory") {
        return <ProjectMemoryView slug={projectSlug} />;
    }

    // /projects/xxx → Kanban board
    return <KanbanBoardView slug={projectSlug} />;
}
