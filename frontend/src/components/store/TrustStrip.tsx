import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useStoreSettings } from "@/hooks/useStoreSettings";
import { resolveTrustIcon } from "@/lib/trust-icons";

export type TrustItem = { icon: LucideIcon; label: string };

interface TrustStripProps {
    /** Itens fixos (ex.: rodapé). Sem isso, usa os itens editáveis em /admin/vitrine. */
    items?: TrustItem[];
    /** "light" para fundo claro (home), "dark" para fundo roxo (rodapé) */
    tone?: "light" | "dark";
}

export function TrustStrip({ items, tone = "light" }: TrustStripProps) {
    const settings = useStoreSettings();
    const dark = tone === "dark";

    const resolved: TrustItem[] =
        items ??
        settings.trust_strip_items.map((item) => ({ icon: resolveTrustIcon(item.icon), label: item.label }));

    if (resolved.length === 0) return null;

    return (
        <div className={dark ? "border-b border-white/10" : "border-y border-mc-violet-950/10 bg-mc-blush-100/60"}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 grid grid-cols-2 sm:grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-4">
                {resolved.map(({ icon: Icon, label }, index) => (
                    <div key={`${label}-${index}`} className="flex items-center gap-2.5">
                        <Icon size={18} className={cn("shrink-0", dark ? "text-mc-gold-400" : "text-mc-violet-700")} />
                        <span
                            className={cn(
                                "text-xs sm:text-[13px] font-medium leading-tight",
                                dark ? "text-white/80" : "text-mc-ink/70"
                            )}
                        >
                            {label}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
