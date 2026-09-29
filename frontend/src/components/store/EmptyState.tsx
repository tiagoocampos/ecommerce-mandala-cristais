import type { LucideIcon } from "lucide-react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    description?: string;
    actionLabel?: string;
    onAction?: () => void;
    className?: string;
}

// Estado vazio padrão da loja: ícone grande + mensagem + ação.
export function EmptyState({ icon: Icon, title, description, actionLabel, onAction, className }: EmptyStateProps) {
    return (
        <div className={cn("flex flex-col items-center gap-4 py-14 text-center", className)}>
            <span className="flex h-24 w-24 items-center justify-center rounded-full bg-mc-blush-100">
                <Icon size={44} strokeWidth={1.25} className="text-mc-violet-300" aria-hidden="true" />
            </span>
            <div>
                <p className="font-display text-xl text-mc-violet-950">{title}</p>
                {description && <p className="mt-1.5 max-w-sm text-sm text-mc-ink/60">{description}</p>}
            </div>
            {actionLabel && onAction && (
                <Button
                    onClick={onAction}
                    className="mt-1 rounded-full bg-mc-violet-950 px-6 text-mc-sand-50 hover:bg-mc-violet-800"
                >
                    {actionLabel}
                </Button>
            )}
        </div>
    );
}
