"use client";

import Link from "next/link";

export function PublicHeader() {
    return (
        <header className="fixed top-0 w-full z-50 px-6 py-4">
            <nav className="max-w-7xl mx-auto flex items-center justify-between bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl px-6 py-3">
                <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                    <div className="w-8 h-8 bg-neutral-900 rounded-lg flex items-center justify-center p-1.5">
                        <img src="/logo.svg" alt="DMZ OS Logo" className="w-full h-full" />
                    </div>
                    <span className="font-black text-xl tracking-tight text-white">DMZ – OS Agents</span>
                </Link>

                <div className="hidden md:flex items-center gap-8 text-sm font-medium text-neutral-400">
                    <a href="/#agents" className="hover:text-white transition-colors">Agentes</a>
                    <a href="/#capabilities" className="hover:text-white transition-colors">Capacidades</a>
                    <a href="/#industries" className="hover:text-white transition-colors">Indústrias</a>
                    <a href="/#pricing" className="hover:text-white transition-colors">Preços</a>
                </div>

                <div className="flex items-center gap-4">
                    <Link href="/sign-in" className="text-sm font-bold text-neutral-400 hover:text-white transition-colors px-4 py-2">Login</Link>
                    <Link href="/sign-up" className="bg-dmz-accent text-white text-xs font-bold px-5 py-2.5 rounded-xl hover:bg-orange-500 transition-all shadow-lg shadow-dmz-accent/20">Sign Up</Link>
                </div>
            </nav>
        </header>
    );
}

export function PublicFooter() {
    return (
        <footer className="py-20 border-t border-white/5 bg-[#030303]">
            <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-12 mb-20">
                <div className="col-span-2">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-8 h-8 bg-neutral-900 rounded-lg flex items-center justify-center p-1.5">
                            <img src="/logo.svg" alt="DMZ OS Logo" className="w-full h-full" />
                        </div>
                        <span className="font-extrabold text-xl tracking-tight text-white">DMZ – OS Agents</span>
                    </div>
                    <p className="text-neutral-500 max-w-sm mb-8">
                        A camada de inteligência organizacional que torna seu repositório vivo.
                        Built by agents, for developers.
                    </p>
                    <div className="flex gap-4">
                        <a
                            href="https://github.com/dmz-digital/dmz-agents"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-10 h-10 bg-white/5 rounded-lg border border-white/10 flex items-center justify-center hover:bg-white/10 cursor-pointer transition-all"
                        >
                            <svg className="w-5 h-5 text-neutral-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" /></svg></a>
                    </div>
                </div>

                <div>
                    <h5 className="font-bold text-white mb-6">Plataforma</h5>
                    <div className="flex flex-col gap-4 text-sm text-neutral-500">
                        <a href="/#agents" className="hover:text-dmz-accent text-white font-medium">Especialistas</a>
                        <Link href="/app/projects" className="hover:text-dmz-accent">Projetos</Link>
                        <Link href="/sign-in" className="hover:text-dmz-accent">Login</Link>
                        <Link href="/sign-up" className="hover:text-dmz-accent">Cadastro</Link>
                    </div>
                </div>

                <div>
                    <h5 className="font-bold text-white mb-6">Legal</h5>
                    <div className="flex flex-col gap-4 text-sm text-neutral-500">
                        <Link href="/terms" className="hover:text-dmz-accent">Termos de Uso</Link>
                        <Link href="/privacy" className="hover:text-dmz-accent">Privacidade</Link>
                        <Link href="/cookies" className="hover:text-dmz-accent">Cookies</Link>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-[11px] text-neutral-600 font-medium">© 2026 DMZ Labs. Todos os direitos reservados.</p>
                <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    <span className="text-[10px] text-neutral-600 uppercase font-black tracking-widest">System Status: All systems go</span>
                </div>
            </div>
        </footer>
    );
}
