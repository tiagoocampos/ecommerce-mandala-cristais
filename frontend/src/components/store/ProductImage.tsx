import { useState } from "react";
import { Gem } from "lucide-react";
import { cn } from "@/lib/utils";

/** Proporção (largura/altura) única da miniatura nos cards da loja: 3/4. */
export const CARD_RATIO = 3 / 4;
export const CARD_ASPECT_CLASS = "aspect-3/4";

// Acima desta diferença entre a proporção da foto e a do quadro, corta (cover) deixaria de
// ser imperceptível: passa a mostrar o produto inteiro (contain) com fundo desfocado.
const COVER_TOLERANCE = 0.12;

const WIDTHS = [320, 480, 640, 800, 1200];

// As fotos ficam no Cloudinary, que redimensiona por URL: pede só o tamanho necessário (e
// formato/qualidade automáticos). Qualquer outra URL (ex.: preview local) passa sem mudança.
function cloudinaryVariant(url: string, width: number): string | null {
    const marker = "/image/upload/";
    if (!url.includes("res.cloudinary.com") || !url.includes(marker)) return null;
    return url.replace(marker, `${marker}c_limit,w_${width},f_auto,q_auto/`);
}

interface ProductImageProps {
    src?: string | null;
    /** nome do produto */
    alt: string;
    className?: string;
    /** tamanho do ícone do placeholder quando não há imagem */
    iconSize?: number;
    /** proporção largura/altura do QUADRO onde a imagem está (1 = quadrado; CARD_RATIO nos cards) */
    frameRatio?: number;
    /** `sizes` do <img> (largura exibida); padrão serve para miniaturas */
    sizes?: string;
    /** primeiras imagens do topo da página: carrega já, sem lazy */
    priority?: boolean;
    /** sem fundo próprio: usado para sobrepor (foto do hover) sem cobrir o que está embaixo enquanto carrega */
    bare?: boolean;
}

/**
 * Imagem de produto que NUNCA corta o assunto principal. Preenche o quadro do pai
 * (h-full w-full): foto de proporção parecida com a do quadro → cover; muito mais alta/larga →
 * contain, com uma cópia desfocada da própria foto atrás para não sobrar faixa vazia.
 */
export function ProductImage({
    src,
    alt,
    className,
    iconSize = 36,
    frameRatio = 1,
    sizes = "120px",
    priority = false,
    bare = false,
}: ProductImageProps) {
    const [natural, setNatural] = useState<number | null>(null);

    if (!src) {
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

    const known = natural !== null;
    const difference = known ? Math.abs(natural / frameRatio - 1) : 0;
    const contain = known && difference > COVER_TOLERANCE;

    const srcSet = cloudinaryVariant(src, WIDTHS[0]!)
        ? WIDTHS.map((w) => `${cloudinaryVariant(src, w)} ${w}w`).join(", ")
        : undefined;
    const mainSrc = cloudinaryVariant(src, 800) ?? src;

    return (
        <div className={cn("relative h-full w-full overflow-hidden", !bare && "bg-mc-blush-100")}>
            {contain && (
                <img
                    src={cloudinaryVariant(src, 320) ?? src}
                    alt=""
                    aria-hidden="true"
                    decoding="async"
                    loading="lazy"
                    className="absolute inset-0 h-full w-full scale-125 object-cover opacity-40 blur-2xl"
                />
            )}
            <img
                src={mainSrc}
                {...(srcSet ? { srcSet, sizes } : {})}
                alt={alt}
                decoding="async"
                loading={priority ? "eager" : "lazy"}
                {...(priority ? { fetchPriority: "high" as const } : {})}
                draggable={false}
                // ref: imagem já em cache dispara onLoad antes de o React ligar o evento
                ref={(img) => {
                    if (img?.complete && img.naturalWidth > 0 && natural === null) {
                        setNatural(img.naturalWidth / img.naturalHeight);
                    }
                }}
                onLoad={(e) => setNatural(e.currentTarget.naturalWidth / e.currentTarget.naturalHeight)}
                className={cn(
                    "relative h-full w-full transition-opacity duration-300 motion-reduce:transition-none",
                    contain ? "object-contain" : "object-cover",
                    known ? "opacity-100" : "opacity-0",
                    className
                )}
            />
        </div>
    );
}
