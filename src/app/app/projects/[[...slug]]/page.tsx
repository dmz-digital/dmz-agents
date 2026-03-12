import ProjectDetailClient from './ProjectDetailClient';

export function generateStaticParams() {
    // Pre-generate the base route; all other slugs resolve client-side
    // We only return the root catch-all because output: export doesn't allow dynamicParams: true
    return [{ slug: [] }];
}

import { Suspense } from 'react';

export default function Page() {
    return (
        <Suspense fallback={<div className="p-8 text-neutral-400">Carregando painel de interface...</div>}>
            <ProjectDetailClient />
        </Suspense>
    );
}
