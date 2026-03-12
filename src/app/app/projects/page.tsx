import ProjectDetailClient from './ProjectDetailClient';
import { Suspense } from 'react';

export default function Page() {
    return (
        <Suspense fallback={<div className="p-8 text-neutral-400">Carregando painel de interface...</div>}>
            <ProjectDetailClient />
        </Suspense>
    );
}
