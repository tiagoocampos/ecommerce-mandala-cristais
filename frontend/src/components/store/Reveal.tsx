import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Entrada suave (fade + subida curta) quando a seção aparece. Sem animação com prefers-reduced-motion. */
export function Reveal({ children, className }: { children: ReactNode; className?: string }) {
    const ref = useRef<HTMLDivElement>(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const node = ref.current;
        if (!node) return;
        if (typeof IntersectionObserver === "undefined") {
            setVisible(true);
            return;
        }
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry?.isIntersecting) {
                    setVisible(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.12 }
        );
        observer.observe(node);
        return () => observer.disconnect();
    }, []);

    return (
        <div ref={ref} className={cn("reveal", visible && "is-visible", className)}>
            {children}
        </div>
    );
}
