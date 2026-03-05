import ClientPage from './ClientPage';

export function generateStaticParams() {
    return [{ id: [] }];
}

export default function Page() {
    return <ClientPage />;
}
