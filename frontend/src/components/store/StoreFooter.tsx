import { Send, Truck, ShieldCheck, RefreshCw, CreditCard } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInstagram, faWhatsapp, faTiktok, faFacebookF } from "@fortawesome/free-brands-svg-icons";
import { Link } from "react-router-dom";
import { Button } from "../ui/button";
import { TrustStrip } from "./TrustStrip";
import { useStoreSettings } from "../../hooks/useStoreSettings";
import { formatPrice } from "../../lib/utils-api";
import { WHATSAPP_URL } from "../../lib/whatsapp";

// TODO: trocar os "#" pelos perfis reais quando existirem.
const SOCIALS = [
    { name: "Instagram", icon: faInstagram, url: "https://www.instagram.com/mandalacrystais/" },
    { name: "WhatsApp", icon: faWhatsapp, url: WHATSAPP_URL },
    { name: "TikTok", icon: faTiktok, url: "#" },
    { name: "Facebook", icon: faFacebookF, url: "#" },
];

const FOOTER_TRUST = [
    { icon: ShieldCheck, label: "Pagamento 100% seguro" },
    { icon: RefreshCw, label: "Trocas em até 7 dias" },
    { icon: CreditCard, label: "Pix, cartão e boleto" },
];

const LINK_COLUMNS = [
    {
        title: "Institucional",
        links: [
            "Sobre nós",
            "Nossa curadoria",
            "Trocas e devoluções",
            "Fale conosco",
        ],
    },
    {
        title: "Ajuda",
        links: [
            "Rastrear pedido",
            "Formas de pagamento",
            "Prazo de entrega",
            "Perguntas frequentes",
        ],
    },
    {
        title: "Categorias",
        links: [
            "Pedras",
            "Incensos",
            "Energia",
            "Kits iniciante",
        ],
    },
];

export function StoreFooter() {
    const { free_shipping_threshold } = useStoreSettings();
    const shippingItem = {
        icon: Truck,
        label: free_shipping_threshold
            ? `Frete grátis acima de ${formatPrice(free_shipping_threshold)}`
            : "Envio para todo o Brasil",
    };

    return (
        <footer className="relative overflow-hidden bg-mc-violet-950 text-white/80 mt-10">
            {/* marca d'água: símbolo da mandala do kit */}
            <img
                src="/brand/mandala-simbolo-branca.png"
                alt=""
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-10 -right-24 w-140 max-w-none opacity-[0.06] select-none"
            />

            <div className="relative">
                <TrustStrip items={[shippingItem, ...FOOTER_TRUST]} tone="dark" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
                    <div className="lg:col-span-2">
                        <Link to="/" aria-label="Mandala Crystais — página inicial" className="inline-block mb-5">
                            <img
                                src="/brand/logo-branca.png"
                                alt="Mandala Crystais"
                                width={400}
                                height={279}
                                className="h-20 w-auto"
                            />
                        </Link>

                        <p className="text-sm text-white/70 max-w-xs mb-5">
                            Cristais e itens de energia selecionados com cuidado para o seu
                            ritual diário.
                        </p>

                        <div className="flex gap-3">
                            {SOCIALS.map((social) => (
                                <a
                                    key={social.name}
                                    href={social.url}
                                    target={social.url === "#" ? undefined : "_blank"}
                                    rel="noopener noreferrer"
                                    aria-label={social.name}
                                    className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center hover:border-mc-gold-400 hover:text-mc-gold-400 transition-colors cursor-pointer"
                                >
                                    <FontAwesomeIcon icon={social.icon} className="text-base" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {LINK_COLUMNS.map((col) => (
                        <div key={col.title}>
                            <h4 className="text-xs font-semibold uppercase tracking-wide text-mc-gold-400 mb-4">
                                {col.title}
                            </h4>

                            <ul className="space-y-2.5">
                                {col.links.map((link) => (
                                    <li
                                        key={link}
                                        className="text-sm text-white/60 hover:text-white cursor-pointer transition-colors"
                                    >
                                        {link}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}

                    <div>
                        <h4 className="text-xs font-semibold uppercase tracking-wide text-mc-gold-400 mb-4">
                            Receba novidades!
                        </h4>

                        <p className="text-sm text-white/60 mb-3">
                            Lançamentos e conteúdos sobre cristais, direto no seu e-mail.
                        </p>

                        <div className="flex gap-2">
                            <input
                                type="email"
                                placeholder="Seu e-mail"
                                aria-label="Seu e-mail"
                                className="min-w-0 flex-1 rounded-full bg-white/10 border border-white/20 px-4 py-2 text-sm text-white placeholder:text-white/40 outline-none focus:ring-2 focus:ring-mc-gold-500/50"
                            />

                            <Button
                                size="icon"
                                aria-label="Inscrever"
                                className="rounded-full bg-mc-gold-500 hover:bg-mc-gold-600 text-mc-violet-950 shrink-0"
                            >
                                <Send size={15} />
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="border-t border-white/10">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/50">
                        <span>
                            © {new Date().getFullYear()} Mandala Crystais. Todos os direitos reservados.
                        </span>

                        <span>
                            Pix · Cartão de crédito · Boleto
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
