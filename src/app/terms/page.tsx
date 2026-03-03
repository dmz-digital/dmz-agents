import Link from "next/link";

export default function TermsPage() {
    return (
        <div className="max-w-4xl mx-auto px-6 py-20 font-sans text-neutral-800">
            <h1 className="text-4xl font-extrabold mb-8 text-neutral-900 tracking-tight">Termos de Uso</h1>
            <p className="text-lg text-neutral-500 mb-10">Última atualização: 3 de Março de 2026</p>

            <div className="space-y-8 leading-relaxed">
                <section>
                    <h2 className="text-2xl font-bold mb-4">1. Aceitação dos Termos</h2>
                    <p>Ao acessar e usar a plataforma <strong>DMZ - OS Agents</strong>, você concorda em cumprir e estar vinculado a estes Termos de Uso. Se você não concordar com qualquer parte destes termos, não deve acessar a plataforma.</p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold mb-4">2. Uso da Plataforma</h2>
                    <p>O DMZ OS fornece acesso a um squad de agentes de IA para auxílio em desenvolvimento, gestão de projetos e automação. Você é responsável por manter a confidencialidade das suas credenciais de acesso e por todas as atividades que ocorrem sob sua conta.</p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold mb-4">3. Propriedade Intelectual</h2>
                    <p>Todo o conteúdo, layout, design, dados e códigos da plataforma são de propriedade da DMZ Labs ou licenciados. O uso não autorizado de qualquer material da plataforma pode violar leis de direitos autorais e marcas registradas.</p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold mb-4">4. Limitação de Responsabilidade</h2>
                    <p>A plataforma é fornecida "como está". Não garantimos que os agentes de IA serão 100% precisos em todas as tarefas. A DMZ Labs não será responsável por quaisquer danos diretos, indiretos ou consequentes resultantes do uso da plataforma.</p>
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
