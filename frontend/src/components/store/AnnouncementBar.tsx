import { useEffect, useState } from "react";
import { Tag } from "lucide-react";
import { useStoreSettings } from "../../hooks/useStoreSettings";
import { formatPrice } from "../../lib/utils-api";

function CouponHighlight({ code }: { code: string }) {
    return (
        <span className="font-semibold underline underline-offset-2 decoration-mc-gold-500">{code}</span>
    );
}

// Texto editável pelo lojista em /admin/vitrine.
export function AnnouncementBar() {
    const { announcement_text, announcement_coupon_code, free_shipping_threshold } = useStoreSettings();

    const text = announcement_text.trim();
    const code = announcement_coupon_code?.trim() || null;

    // Destaca o cupom dentro do texto; se o texto não citar o código, ele vai no final.
    let message: React.ReactNode = text;
    if (code) {
        const index = text.toUpperCase().indexOf(code.toUpperCase());
        message =
            index >= 0 ? (
                <>
                    {text.slice(0, index)}
                    <CouponHighlight code={text.slice(index, index + code.length)} />
                    {text.slice(index + code.length)}
                </>
            ) : (
                <>
                    {text}
                    {text && " "}
                    {text ? "— cupom " : "Cupom "}
                    <CouponHighlight code={code} />
                </>
            );
    }

    const shipping =
        free_shipping_threshold && free_shipping_threshold > 0
            ? `Frete grátis acima de ${formatPrice(free_shipping_threshold)}`
            : null;

    const segments: React.ReactNode[] = [];
    if (text || code) segments.push(message);
    if (shipping) segments.push(shipping);

    return <AnnouncementRow segments={segments} hasTag={!!(text || code)} />;
}

// Desktop: trechos lado a lado com divisor fino. Mobile: um trecho por vez, em rotação suave
// (sem rotação com prefers-reduced-motion: os trechos aparecem empilhados).
function AnnouncementRow({ segments, hasTag }: { segments: React.ReactNode[]; hasTag: boolean }) {
    const [index, setIndex] = useState(0);
    const [reduce] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    const rotate = segments.length > 1 && !reduce;

    useEffect(() => {
        if (!rotate) return;
        const timer = setInterval(() => setIndex((i) => (i + 1) % segments.length), 5000);
        return () => clearInterval(timer);
    }, [rotate, segments.length]);

    if (segments.length === 0) return null;

    return (
        <div className="bg-mc-violet-950 px-4 py-2 text-center text-xs tracking-wide text-mc-sand-50 sm:text-[13px]">
            {/* desktop */}
            <div className="hidden items-center justify-center gap-4 sm:flex">
                {segments.map((segment, i) => (
                    <span key={i} className="flex items-center gap-4">
                        {i > 0 && <span aria-hidden="true" className="h-3.5 w-px bg-white/30" />}
                        <span className="flex items-center gap-1.5">
                            {i === 0 && hasTag && <Tag size={14} strokeWidth={1.5} aria-hidden="true" />}
                            {segment}
                        </span>
                    </span>
                ))}
            </div>
            {/* mobile */}
            <div className="sm:hidden">
                {rotate ? (
                    <p key={index} className="animate-in fade-in duration-500">{segments[index]}</p>
                ) : (
                    segments.map((segment, i) => <p key={i}>{segment}</p>)
                )}
            </div>
        </div>
    );
}
