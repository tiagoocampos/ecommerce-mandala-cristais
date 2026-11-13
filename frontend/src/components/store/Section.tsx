import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Texto pequeno em maiúsculas, tracking largo, seguido de um fio fino. */
export function SectionEyebrow({ children, className }: { children: ReactNode; className?: string }) {
    return (
        <p className={cn("flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-mc-violet-700", className)}>
            {children}
            <span aria-hidden="true" className="h-px w-14 bg-mc-violet-700/40" />
        </p>
    );
}

interface SectionTitleProps {
    children: ReactNode;
    /** trecho final em itálico, na cor de destaque (ex.: "uma intenção.") */
    accent?: string;
    as?: "h1" | "h2" | "h3";
    className?: string;
}

/** Título em Fraunces, peso regular, tamanho fluido; o trecho `accent` vai em itálico. */
export function SectionTitle({ children, accent, as: Tag = "h2", className }: SectionTitleProps) {
    return (
        <Tag
            className={cn(
                "font-display font-normal leading-[1.1] text-mc-violet-950 text-[clamp(1.75rem,1.2rem+2.2vw,3rem)]",
                className
            )}
        >
            {children}
            {accent && (
                <>
                    {" "}
                    <em className="font-normal italic text-mc-violet-700">{accent}</em>
                </>
            )}
        </Tag>
    );
}
