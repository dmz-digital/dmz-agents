import Link from "next/link";

export default function PrivacyPage() {
    return (
        <div className="max-w-4xl mx-auto px-6 py-20 font-sans text-neutral-800">
            <h1 className="text-4xl font-extrabold mb-8 text-neutral-900 tracking-tight">Política de Privacidade</h1>
            <p className="text-lg text-neutral-500 mb-10">Última atualização: 3 de Março de 2026</p>

            <div className="space-y-8 leading-relaxed">
                <section>
                    <h2 className="text-2xl font-bold mb-4">1. Coleta de Informações</h2>
                    <p>Coletamos informações que você fornece diretamente ao se cadastrar, como nome, email, telefone e dados do projeto. Também coletamos logs de atividade dos agentes para melhorar a qualidade do serviço.</p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold mb-4">2. Uso dos Dados</h2>
                    <p>Seus dados são usados para:</p>
                    <ul className="list-disc ml-6 mt-4 space-y-2">
                        <li>Prover e manter a funcionalidade dos agentes;</li>
                        <li>Processar solicitações de suporte;</li>
                        <li>Personalizar a experiência do squad de acordo com seu projeto;</li>
                        <li>Garantir a segurança e conformidade da plataforma.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-bold mb-4">3. Proteção de Dados (LGPD)</h2>
                    <p>Estamos em total conformidade com a LGPD. Você tem o direito de solicitar o acesso, retificação ou exclusão dos seus dados pessoais a qualquer momento através do nosso contato de suporte.</p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold mb-4">4. Compartilhamento com LLMs</h2>
                    <p>Para o funcionamento dos agentes, partes das suas demandas podem ser processadas por provedores parceiros de IA (Anthropic, OpenAI, Google). Seus dados não são usados para treinamento de modelos de terceiros sem o seu consentimento explícito.</p>
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
