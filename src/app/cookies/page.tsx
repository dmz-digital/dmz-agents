import Link from "next/link";

export default function CookiesPage() {
    return (
        <div className="max-w-4xl mx-auto px-6 py-20 font-sans text-neutral-800">
            <h1 className="text-4xl font-extrabold mb-8 text-neutral-900 tracking-tight">Política de Cookies</h1>
            <p className="text-lg text-neutral-500 mb-10">Última atualização: 3 de Março de 2026</p>

            <div className="space-y-8 leading-relaxed">
                <section>
                    <h2 className="text-2xl font-bold mb-4">O que são Cookies?</h2>
                    <p>Cookies são pequenos arquivos de texto enviados pelo site ao seu navegador para lembrar informações sobre sua visita, facilitando o próximo acesso e tornando o site mais útil para você.</p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold mb-4">Como usamos os Cookies?</h2>
                    <p>No DMZ OS, usamos cookies para:</p>
                    <ul className="list-disc ml-6 mt-4 space-y-2">
                        <li><strong>Autenticação:</strong> Para manter você logado enquanto navega entre as páginas do squad.</li>
                        <li><strong>Preferências:</strong> Para lembrar configurações de tema ou filtros nos agentes.</li>
                        <li><strong>Segurança:</strong> Para detectar atividades fraudulentas e proteger sua conta.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-bold mb-4">Gerenciando Cookies</h2>
                    <p>Você pode configurar seu navegador para recusar todos ou alguns cookies, ou para alertar quando cookies estão sendo enviados. No entanto, se você desativar ou recusar cookies, algumas partes da plataforma podem ficar inacessíveis ou não funcionar corretamente.</p>
                </section>
            </div>

            <div className="mt-16 pt-8 border-t border-neutral-100">
                <Link href="/home" className="text-dmz-accent font-bold hover:underline">
                    &larr; Voltar para a Home
                </Link>
            </div>
        </div>
    );
}
