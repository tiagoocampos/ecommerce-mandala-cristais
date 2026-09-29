import { Gem } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductImageProps {
    src?: string | null;
    alt: string;
    className?: string;
    /** tamanho do ícone do placeholder quando não há imagem */
    iconSize?: number;
}

// Imagem de produto com placeholder da marca quando não há banner.
export function ProductImage({ src, alt, className, iconSize = 36 }: ProductImageProps) {
    if (src) {
        return <img src={src} alt={alt} loading="lazy" className={cn("h-full w-full object-cover", className)} />;
    }

    return (
        <div
            role="img"
            aria-label={alt}
            className={cn(
                "flex h-full w-full items-center justify-center bg-linear-to-br from-mc-blush-100 to-mc-blush-200",
                className
            )}
        >
            <Gem size={iconSize} strokeWidth={1.25} className="text-mc-violet-300" aria-hidden="true" />
        </div>
    );
}
