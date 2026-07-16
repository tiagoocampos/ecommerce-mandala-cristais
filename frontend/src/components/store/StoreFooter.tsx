import { Sparkles, Send } from "lucide-react";
import { Button } from "../ui/button";

const SOCIALS = ["IG", "FB", "YT"];

const LINK_COLUMNS = [
    {
        title: "Institucional",
        links: ["Sobre nós", "Nossa curadoria", "Trocas e devoluções", "Fale conosco"],
    },
    {
        title: "Ajuda",
        links: ["Rastrear pedido", "Formas de pagamento", "Prazo de entrega", "Perguntas frequentes"],
    },
    {
        title: "Categorias",
        links: ["Pedras", "Incensos", "Energia", "Kits iniciante"],
    },
];

export function StoreFooter() {
    return (
        <footer className="bg-mc-violet-950 text-mc-sand-50/80 mt-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
                <div className="lg:col-span-2">
                    <div className="flex items-center gap-2 mb-4">
                        <Sparkles className="text-mc-gold-400" size={20} />
                        <span className="font-display italic text-xl text-mc-sand-50">
                            Mandala Cristais
                        </span>
                    </div>
                    <p className="text-sm text-mc-sand-50/60 max-w-xs mb-5">
                        Cristais e itens de energia selecionados com cuidado para o seu
                        ritual diário.
                    </p>
                    <div className="flex gap-3">
                        {SOCIALS.map((label) => (
                            <span
                                key={label}
                                className="w-9 h-9 rounded-full border border-mc-sand-50/20 flex items-center justify-center text-[10px] font-semibold tracking-wide hover:border-mc-gold-400 hover:text-mc-gold-400 transition-colors cursor-pointer"
                            >
                                {label}
                            </span>
                        ))}
                    </div>
                </div>

                {LINK_COLUMNS.map((col) => (
                    <div key={col.title}>
                        <h4 className="text-xs font-semibold uppercase tracking-wide text-mc-gold-300 mb-4">
                            {col.title}
                        </h4>
                        <ul className="space-y-2.5">
                            {col.links.map((link) => (
                                <li
                                    key={link}
                                    className="text-sm text-mc-sand-50/60 hover:text-mc-sand-50 cursor-pointer transition-colors"
                                >
                                    {link}
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}

                <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wide text-mc-gold-300 mb-4">
                        Receba novidades
                    </h4>
                    <p className="text-sm text-mc-sand-50/60 mb-3">
                        Lançamentos e conteúdos sobre cristais, direto no seu e-mail.
                    </p>
                    <div className="flex gap-2">
                        <input
                            type="email"
                            placeholder="Seu e-mail"
                            className="min-w-0 flex-1 rounded-full bg-mc-sand-50/10 border border-mc-sand-50/20 px-4 py-2 text-sm text-mc-sand-50 placeholder:text-mc-sand-50/40 outline-none focus:ring-2 focus:ring-mc-gold-500/50"
                        />
                        <Button
                            size="icon"
                            className="rounded-full bg-mc-gold-500 hover:bg-mc-gold-600 text-mc-violet-950 shrink-0"
                        >
                            <Send size={15} />
                        </Button>
                    </div>
                </div>
            </div>

            <div className="border-t border-mc-sand-50/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-mc-sand-50/50">
                    <span>© {new Date().getFullYear()} Mandala Cristais. Todos os direitos reservados.</span>
                    <span>Pix · Cartão de crédito · Boleto</span>
                </div>
            </div>
        </footer>
    );
}
