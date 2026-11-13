import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useStoreSettings } from "@/hooks/useStoreSettings";
import { resolveTrustIcon } from "@/lib/trust-icons";

export type TrustItem = { icon: LucideIcon; label: string };

interface TrustStripProps {
    /** Itens fixos (ex.: rodapé). Sem isso, usa os itens editáveis em /admin/vitrine. */
    items?: TrustItem[];
    /** "band": faixa roxa em largura total (home) | "dark": linha discreta dentro do rodapé */
    tone?: "band" | "dark";
}

export function TrustStrip({ items, tone = "band" }: TrustStripProps) {
    const settings = useStoreSettings();

    const resolved: TrustItem[] =
        items ??
        settings.trust_strip_items.map((item) => ({ icon: resolveTrustIcon(item.icon), label: item.label }));

    if (resolved.length === 0) return null;

    const band = tone === "band";

    return (
        <div className={band ? "bg-mc-violet-950 text-mc-sand-50" : "border-b border-white/10"}>
            <ul
                className={cn(
                    "mx-auto grid max-w-7xl px-4 sm:px-6 lg:px-8",
                    band ? "grid-cols-2 gap-y-6 py-8 sm:py-10 md:grid-cols-[repeat(auto-fit,minmax(0,1fr))] md:gap-y-0" : "grid-cols-2 gap-4 py-5 sm:grid-cols-[repeat(auto-fit,minmax(180px,1fr))]"
                )}
            >
                {resolved.map(({ icon: Icon, label }, index) => (
                    <li
                        key={`${label}-${index}`}
                        className={cn(
                            band
                                ? "flex flex-col items-center gap-3 px-3 text-center md:border-l md:border-white/20 md:first:border-l-0"
                                : "flex items-center gap-2.5"
                        )}
                    >
                        <Icon size={band ? 26 : 16} strokeWidth={1.25} aria-hidden="true" className="shrink-0 text-mc-sand-50/90" />
                        <span className={cn("leading-tight", band ? "text-[13px] text-mc-sand-50/90" : "text-xs text-white/80")}>
                            {label}
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    );
}
