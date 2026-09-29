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

    if (!text && !code && !shipping) return null;

    return (
        <div className="bg-mc-violet-700 text-mc-sand-50 text-xs sm:text-sm py-2 px-4 text-center tracking-wide">
            {message}
            {(text || code) && shipping && " · "}
            {shipping}
        </div>
    );
}
