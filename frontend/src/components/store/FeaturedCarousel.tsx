import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { ProductImage } from "./ProductImage";
import { formatPrice } from "../../lib/utils-api";
import { cn } from "../../lib/utils";
import { truncateText } from "../../lib/text";
import type { MandalaProduct } from "../../types/mandala";

interface FeaturedCarouselProps {
    products: MandalaProduct[];
    loading?: boolean;
    title?: string;
}

// Carrossel de arrastar para o lado: um produto grande por vez, com a ponta do próximo
// aparecendo na lateral. Toque/trackpad rolam nativamente (scroll-snap); com o mouse,
// arrasta segurando o clique. Bolinhas mostram a posição; setas no desktop. Sem biblioteca.
export function FeaturedCarousel({ products, loading = false, title = "Destaques" }: FeaturedCarouselProps) {
    const trackRef = useRef<HTMLDivElement>(null);
    const drag = useRef({ active: false, moved: false, startX: 0, startScroll: 0, pointerId: -1 });
    const [current, setCurrent] = useState(0);

    if (loading) {
        return (
            <section aria-label="Carregando produtos" className="bg-mc-sand-50 pt-5 pb-4 sm:pt-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="mb-3 h-3.5 w-28 rounded bg-mc-blush-200 animate-pulse" />
                    <div className="flex gap-4 overflow-hidden" aria-hidden="true">
                        {[0, 1].map((i) => (
                            <div key={i} className="facet-cut h-60 w-[80%] sm:w-[62%] lg:w-[52%] shrink-0 bg-mc-blush-100 animate-pulse" />
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    // Loja sem nenhum produto ativo: não há o que mostrar
    if (products.length === 0) return null;

    const slides = () => Array.from(trackRef.current?.children ?? []) as HTMLElement[];

    function goTo(index: number) {
        const track = trackRef.current;
        const slide = slides()[Math.max(0, Math.min(index, products.length - 1))];
        if (!track || !slide) return;
        track.scrollTo({ left: slide.offsetLeft - track.offsetLeft, behavior: "smooth" });
    }

    // Qual produto está mais à vista (para as bolinhas e setas)
    function handleScroll() {
        const track = trackRef.current;
        if (!track) return;
        const center = track.scrollLeft + track.clientWidth / 2;
        let nearest = 0;
        let best = Infinity;
        slides().forEach((slide, i) => {
            const slideCenter = slide.offsetLeft - track.offsetLeft + slide.offsetWidth / 2;
            const distance = Math.abs(slideCenter - center);
            if (distance < best) {
                best = distance;
                nearest = i;
            }
        });
        setCurrent(nearest);
    }

    // Arrastar com o mouse (toque e trackpad já rolam nativamente)
    function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
        const track = trackRef.current;
        if (e.pointerType !== "mouse" || e.button !== 0 || !track) return;
        drag.current = { active: true, moved: false, startX: e.clientX, startScroll: track.scrollLeft, pointerId: e.pointerId };
    }
    function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
        const track = trackRef.current;
        if (!drag.current.active || !track) return;
        const delta = e.clientX - drag.current.startX;
        if (!drag.current.moved && Math.abs(delta) > 6) {
            drag.current.moved = true;
            track.setPointerCapture(drag.current.pointerId); // continua arrastando fora do carrossel
            track.style.scrollSnapType = "none"; // snap atrapalha o arraste; volta ao soltar
            track.style.cursor = "grabbing";
        }
        if (drag.current.moved) track.scrollLeft = drag.current.startScroll - delta;
    }
    function endDrag() {
        const track = trackRef.current;
        if (!drag.current.active || !track) return;
        drag.current.active = false;
        track.style.cursor = "";
        if (drag.current.moved) {
            // assenta no produto mais próximo, na direção do arraste
            const delta = track.scrollLeft - drag.current.startScroll;
            track.style.scrollSnapType = "";
            const threshold = track.clientWidth * 0.15;
            goTo(delta > threshold ? current + 1 : delta < -threshold ? current - 1 : current);
        }
    }
    // Não abre o produto se o gesto foi um arraste
    function onClickCapture(e: React.MouseEvent) {
        if (drag.current.moved) {
            e.preventDefault();
            e.stopPropagation();
            drag.current.moved = false;
        }
    }

    const multiple = products.length > 1;

    return (
        <section aria-label={title} aria-roledescription="carrossel" className="bg-mc-sand-50 pt-5 pb-4 sm:pt-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="flex items-center gap-1.5 text-xs font-semibold tracking-[0.18em] uppercase text-mc-gold-700">
                        <Sparkles size={14} aria-hidden="true" /> {title}
                    </h2>
                    {multiple && (
                        <div className="hidden sm:flex gap-1.5">
                            <button
                                type="button"
                                onClick={() => goTo(current - 1)}
                                disabled={current === 0}
                                aria-label="Produto anterior"
                                className="flex h-9 w-9 items-center justify-center rounded-full border border-mc-violet-950/15 bg-white text-mc-violet-950 hover:bg-mc-blush-100 disabled:opacity-30"
                            >
                                <ChevronLeft size={18} />
                            </button>
                            <button
                                type="button"
                                onClick={() => goTo(current + 1)}
                                disabled={current === products.length - 1}
                                aria-label="Próximo produto"
                                className="flex h-9 w-9 items-center justify-center rounded-full border border-mc-violet-950/15 bg-white text-mc-violet-950 hover:bg-mc-blush-100 disabled:opacity-30"
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    )}
                </div>

                <div
                    ref={trackRef}
                    onScroll={handleScroll}
                    onPointerDown={onPointerDown}
                    onPointerMove={onPointerMove}
                    onPointerUp={endDrag}
                    onPointerCancel={endDrag}
                    onClickCapture={onClickCapture}
                    className={cn(
                        "flex gap-4 overflow-x-auto snap-x snap-mandatory select-none",
                        "[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
                        multiple && "cursor-grab"
                    )}
                >
                    {products.map((product, index) => {
                        const hasPromo = !!product.promo_price && product.promo_price < product.price;
                        const price = hasPromo ? product.promo_price! : product.price;
                        return (
                            <Link
                                key={product.id}
                                to={`/produto/${product.slug}`}
                                draggable={false}
                                aria-label={`${product.name} — ${formatPrice(price)} (${index + 1} de ${products.length})`}
                                className={cn(
                                    "group facet-cut snap-start shrink-0 overflow-hidden bg-white border border-mc-violet-950/10",
                                    "flex flex-col sm:flex-row",
                                    multiple ? "w-[80%] sm:w-[62%] lg:w-[52%]" : "w-full sm:w-[62%] lg:w-[52%]"
                                )}
                            >
                                <div className="relative h-44 sm:h-60 sm:w-[45%] shrink-0 bg-mc-blush-100 overflow-hidden">
                                    <ProductImage
                                        src={product.banner}
                                        alt={product.image_alt_text || product.name}
                                        iconSize={44}
                                        className="pointer-events-none transition-transform duration-700 group-hover:scale-105"
                                    />
                                    {hasPromo && (
                                        <span className="absolute top-3 left-3 bg-mc-gold-500 text-mc-violet-950 text-xs font-bold px-2.5 py-1 rounded-full">
                                            Oferta
                                        </span>
                                    )}
                                </div>
                                <div className="flex flex-1 flex-col justify-center gap-1.5 p-4 sm:p-6">
                                    {product.category?.name && (
                                        <span className="text-[11px] font-semibold tracking-[0.15em] uppercase text-mc-gold-700">
                                            {product.category.name}
                                        </span>
                                    )}
                                    <h3 className="font-display text-lg sm:text-2xl leading-tight text-mc-violet-950 line-clamp-2">
                                        {product.name}
                                    </h3>
                                    {product.description && (() => {
                                        const excerpt = truncateText(product.description, 110);
                                        return (
                                            <p className="hidden sm:block text-sm text-mc-ink/60">
                                                {excerpt.text}
                                                {excerpt.truncated && (
                                                    <span className="ml-1 font-medium text-mc-violet-700 underline underline-offset-2 group-hover:text-mc-violet-950">
                                                        ver mais
                                                    </span>
                                                )}
                                            </p>
                                        );
                                    })()}
                                    <div className="mt-1">
                                        {hasPromo && (
                                            <span className="mr-2 text-sm text-mc-ink/40 line-through">{formatPrice(product.price)}</span>
                                        )}
                                        <span className="text-xl font-semibold text-mc-violet-950">{formatPrice(price)}</span>
                                    </div>
                                    <span className="mt-1.5 inline-flex items-center gap-1.5 self-start rounded-full bg-mc-violet-950 px-4 py-1.5 text-sm font-medium text-mc-sand-50 transition-colors group-hover:bg-mc-violet-800">
                                        Ver produto <ArrowRight size={15} />
                                    </span>
                                </div>
                            </Link>
                        );
                    })}
                </div>

                {multiple && (
                    <div className="mt-3 flex items-center justify-center gap-3">
                        <div className="flex gap-1.5" role="tablist" aria-label="Escolher produto">
                            {products.map((product, i) => (
                                <button
                                    key={product.id}
                                    type="button"
                                    role="tab"
                                    aria-selected={i === current}
                                    aria-label={`Ir para ${product.name}`}
                                    onClick={() => goTo(i)}
                                    className={cn(
                                        "h-2 rounded-full transition-all",
                                        i === current ? "w-6 bg-mc-violet-700" : "w-2 bg-mc-violet-950/20 hover:bg-mc-violet-950/40"
                                    )}
                                />
                            ))}
                        </div>
                        <span className="text-[11px] text-mc-ink/50 sm:hidden">arraste para o lado →</span>
                    </div>
                )}
            </div>
        </section>
    );
}
