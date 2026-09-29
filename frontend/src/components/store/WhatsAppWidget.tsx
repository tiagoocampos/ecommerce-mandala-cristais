import { useState } from "react";
import { useLocation } from "react-router-dom";
import { Send, X } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { getStoredUser } from "../../lib/auth";
import { whatsappLink } from "../../lib/whatsapp";
import { cn } from "../../lib/utils";

function firstName(name?: string) {
    return name?.trim().split(/\s+/)[0] ?? "";
}

// Botão flutuante com "mini-chat". O WhatsApp não permite enviar mensagem sem ação do usuário:
// o link wa.me só abre o app com o texto pré-preenchido — quem envia é o cliente, lá dentro.
export function WhatsAppWidget() {
    const { pathname } = useLocation();
    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState("");

    // Só nas páginas da loja
    if (pathname.startsWith("/admin")) return null;

    const name = firstName(getStoredUser()?.name);
    const greeting = name
        ? `Olá ${name}, tudo bem? Em que posso te ajudar hoje?`
        : "Olá, tudo bem? Em que posso te ajudar hoje?";
    const fallbackMessage = name
        ? `Olá! Sou ${name}, vim do site Mandala Crystais e gostaria de ajuda.`
        : "Olá! Vim do site Mandala Cristais e gostaria de ajuda.";

    function handleSend(e: React.FormEvent) {
        e.preventDefault();
        const text = message.trim() || fallbackMessage;
        window.open(whatsappLink(text), "_blank", "noopener,noreferrer");
        setMessage("");
        setOpen(false);
    }

    // Na página de produto (mobile) existe a barra fixa de compra no rodapé
    const aboveBuyBar = pathname.startsWith("/produto/");

    return (
        <div
            className={cn(
                "fixed right-4 z-40 sm:right-6",
                aboveBuyBar ? "bottom-24 lg:bottom-6" : "bottom-4 sm:bottom-6"
            )}
        >
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <button
                        type="button"
                        aria-label={open ? "Fechar conversa no WhatsApp" : "Conversar no WhatsApp"}
                        className="flex h-14 w-14 items-center justify-center rounded-full bg-mc-whatsapp text-white shadow-lg ring-4 ring-white/70 transition-transform duration-200 hover:scale-105 focus-visible:outline-none focus-visible:ring-mc-violet-700/40 cursor-pointer"
                    >
                        {open ? <X size={24} /> : <FontAwesomeIcon icon={faWhatsapp} className="text-[28px]" />}
                    </button>
                </PopoverTrigger>

                <PopoverContent side="top" align="end" className="w-[min(20rem,calc(100vw-2rem))] overflow-hidden p-0">
                    <div className="flex items-center gap-3 bg-mc-violet-700 px-4 py-3 text-white">
                        <img
                            src="/brand/logo-circulo.png"
                            alt=""
                            width={160}
                            height={160}
                            className="h-9 w-9 rounded-full ring-2 ring-white/30"
                        />
                        <div className="leading-tight">
                            <p className="text-sm font-semibold">Mandala Crystais</p>
                            <p className="text-[11px] text-white/75">Atendimento pelo WhatsApp</p>
                        </div>
                    </div>

                    <div className="bg-mc-blush-100 px-3 py-4">
                        <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-white px-3 py-2 text-sm text-mc-ink shadow-sm">
                            {greeting}
                        </div>
                    </div>

                    <form onSubmit={handleSend} className="flex items-end gap-2 border-t border-border bg-white p-2">
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    e.currentTarget.form?.requestSubmit();
                                }
                            }}
                            rows={2}
                            placeholder="Escreva sua mensagem..."
                            aria-label="Sua mensagem"
                            className="min-h-10 flex-1 resize-none rounded-lg border border-input px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20"
                        />
                        <button
                            type="submit"
                            aria-label="Enviar pelo WhatsApp"
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-mc-whatsapp text-white hover:brightness-95"
                        >
                            <Send size={17} />
                        </button>
                    </form>
                    <p className="bg-white px-3 pb-2 text-[10px] text-mc-ink/50">
                        Abre o WhatsApp com a sua mensagem pronta para enviar.
                    </p>
                </PopoverContent>
            </Popover>
        </div>
    );
}
