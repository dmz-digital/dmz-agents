import ProjectDetailClient from './ProjectDetailClient';

export function generateStaticParams() {
    // Pre-generate the base route; all other slugs resolve client-side
    // We only return the root catch-all because output: export doesn't allow dynamicParams: true
    return [{ slug: [] }];
}

export default function Page() {
    return <ProjectDetailClient />;
}
