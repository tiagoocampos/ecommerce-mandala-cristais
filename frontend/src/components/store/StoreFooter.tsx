import { Truck, ShieldCheck, CreditCard } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInstagram, faWhatsapp, faTiktok, faFacebookF } from "@fortawesome/free-brands-svg-icons";
import { Link } from "react-router-dom";
import { TrustStrip } from "./TrustStrip";
import { useStoreSettings } from "../../hooks/useStoreSettings";
import { formatPrice } from "../../lib/utils-api";
import { ACCEPTED_PAYMENT_METHODS, STORE, WHATSAPP_URL } from "../../config/store";
import { useCategories } from "../../hooks/useCategories";

// Só aparecem redes com endereço preenchido em src/config/store.ts
const SOCIALS = [
    { name: "Instagram", icon: faInstagram, url: STORE.instagramUrl },
    { name: "WhatsApp", icon: faWhatsapp, url: WHATSAPP_URL },
    { name: "TikTok", icon: faTiktok, url: STORE.tiktokUrl },
    { name: "Facebook", icon: faFacebookF, url: STORE.facebookUrl },
].filter((social) => !!social.url);

const FOOTER_TRUST = [
    { icon: ShieldCheck, label: "Pagamento 100% seguro" },
    { icon: CreditCard, label: "Pix e cartão" },
];

const LINK_COLUMNS = [
    {
        title: "Institucional",
        links: [
            { label: "Sobre nós", to: "/sobre" },
            { label: "Nossa curadoria", to: "/sobre#curadoria" },
            { label: "Trocas e devoluções", to: "/trocas-e-devolucoes" },
            { label: "Fale conosco", to: "/contato" },
        ],
    },
    {
        title: "Ajuda",
        links: [
            { label: "Rastrear pedido", to: "/pedidos" },
            { label: "Formas de pagamento", to: "/formas-de-pagamento" },
            { label: "Prazo de entrega", to: "/prazos-de-entrega" },
            { label: "Perguntas frequentes", to: "/perguntas-frequentes" },
        ],
    },
];

export function StoreFooter() {
    const { free_shipping_threshold } = useStoreSettings();
    const categories = useCategories();
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
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={social.name}
                                    className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center hover:border-mc-gold-400 hover:text-mc-gold-400 transition-colors "
                                >
                                    <FontAwesomeIcon icon={social.icon} className="text-base" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {LINK_COLUMNS.map((col) => (
                        <nav key={col.title} aria-label={col.title}>
                            <h4 className="text-xs font-semibold uppercase tracking-wide text-mc-gold-400 mb-4">
                                {col.title}
                            </h4>

                            <ul className="space-y-1">
                                {col.links.map((link) => (
                                    <li key={link.label}>
                                        <Link
                                            to={link.to}
                                            className="inline-block py-1.5 text-sm text-white/60 hover:text-white transition-colors"
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </nav>
                    ))}

                    {categories.length > 0 && (
                        <nav aria-label="Categorias">
                            <h4 className="text-xs font-semibold uppercase tracking-wide text-mc-gold-400 mb-4">
                                Categorias
                            </h4>

                            <ul className="space-y-1">
                                {categories.slice(0, 6).map((category) => (
                                    <li key={category.id}>
                                        <Link
                                            to={`/categoria/${category.slug}`}
                                            className="inline-block py-1.5 text-sm text-white/60 hover:text-white transition-colors"
                                        >
                                            {category.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </nav>
                    )}
                </div>

                <div className="border-t border-white/10">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/50">
                        <span>
                            © {new Date().getFullYear()} Mandala Crystais. Todos os direitos reservados.
                        </span>

                        <span>{ACCEPTED_PAYMENT_METHODS.join(" · ")}</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
