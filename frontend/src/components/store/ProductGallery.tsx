import { useMemo, useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProductImage } from "./ProductImage";
import { cn } from "../../lib/utils";

interface ProductGalleryProps {
    banner: string;
    images?: { id: string; url: string; position: number }[];
    name: string;
    altText?: string | null;
    /** selos (desconto, esgotado) — ficam SOBRE a imagem principal, não dentro de cada slide */
    overlay?: ReactNode;
}

// Galeria da página do produto: imagem principal grande, arrastável para o lado
// (scroll nativo com snap — toque, trackpad, arraste), e miniaturas embaixo.
// Com uma imagem só, fica igual a antes (sem miniaturas nem setas).
export function ProductGallery({ banner, images = [], name, altText, overlay }: ProductGalleryProps) {
    const trackRef = useRef<HTMLDivElement>(null);
    const [active, setActive] = useState(0);

    // principal + extras, sem duplicados
    const slides = useMemo(() => {
        const urls = [banner, ...[...images].sort((a, b) => a.position - b.position).map((i) => i.url)];
        return urls.filter((url, i) => !!url && urls.indexOf(url) === i);
    }, [banner, images]);

    const multiple = slides.length > 1;
    const altFor = (i: number) => (i === 0 ? altText || name : `${name} — foto ${i + 1}`);

    function goTo(index: number) {
        const track = trackRef.current;
        if (!track) return;
        const target = Math.max(0, Math.min(index, slides.length - 1));
        track.scrollTo({ left: target * track.clientWidth, behavior: "smooth" });
    }

    function handleScroll() {
        const track = trackRef.current;
        if (!track || track.clientWidth === 0) return;
        setActive(Math.round(track.scrollLeft / track.clientWidth));
    }

    return (
        <div>
            <div className="relative facet-cut overflow-hidden bg-mc-blush-100 aspect-square">
                <div
                    ref={trackRef}
                    onScroll={handleScroll}
                    aria-roledescription={multiple ? "carrossel" : undefined}
                    className="flex h-full w-full overflow-x-auto snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                >
                    {slides.map((url, i) => (
                        <div key={url} className="h-full w-full flex-none snap-start">
                            {i === 0 ? (
                                <ProductImage src={url} alt={altFor(i)} iconSize={64} />
                            ) : (
                                <img
                                    src={url}
                                    alt={altFor(i)}
                                    loading="lazy"
                                    draggable={false}
                                    className="h-full w-full object-cover"
                                />
                            )}
                        </div>
                    ))}
                </div>

                {overlay}

                {multiple && (
                    <>
                        <button
                            type="button"
                            onClick={() => goTo(active - 1)}
                            disabled={active === 0}
                            aria-label="Imagem anterior"
                            className="absolute left-3 top-1/2 -translate-y-1/2 hidden lg:flex h-9 w-9 items-center justify-center rounded-full bg-white/85 text-mc-violet-950 shadow hover:bg-white disabled:opacity-0 transition-opacity"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <button
                            type="button"
                            onClick={() => goTo(active + 1)}
                            disabled={active === slides.length - 1}
                            aria-label="Próxima imagem"
                            className="absolute right-3 top-1/2 -translate-y-1/2 hidden lg:flex h-9 w-9 items-center justify-center rounded-full bg-white/85 text-mc-violet-950 shadow hover:bg-white disabled:opacity-0 transition-opacity"
                        >
                            <ChevronRight size={18} />
                        </button>
                        <span className="absolute bottom-3 right-3 rounded-full bg-mc-violet-950/70 px-2 py-0.5 text-[11px] text-white">
                            {active + 1}/{slides.length}
                        </span>
                    </>
                )}
            </div>

            {multiple && (
                <div className="mt-3 grid grid-cols-4 sm:grid-cols-5 gap-2">
                    {slides.map((url, i) => (
                        <button
                            key={url}
                            type="button"
                            onClick={() => goTo(i)}
                            aria-label={`Ver imagem ${i + 1}`}
                            aria-current={i === active}
                            className={cn(
                                "aspect-square overflow-hidden rounded-md border-2 bg-mc-blush-100 transition",
                                i === active ? "border-mc-gold-600" : "border-transparent opacity-75 hover:opacity-100"
                            )}
                        >
                            <img
                                src={url}
                                alt=""
                                loading={i === 0 ? undefined : "lazy"}
                                draggable={false}
                                className="h-full w-full object-cover"
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
