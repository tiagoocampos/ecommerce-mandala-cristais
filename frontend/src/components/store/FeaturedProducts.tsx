import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProductCard } from "./ProductCard";
import { SectionEyebrow, SectionTitle } from "./Section";
import { Button } from "../ui/button";
import type { MandalaProduct } from "../../types/mandala";

interface FeaturedProductsProps {
    products: MandalaProduct[];
    loading?: boolean;
    error?: boolean;
    onRetry?: () => void;
    onAddToCart?: (product: MandalaProduct) => void | Promise<boolean>;
}

// Carrossel de cartões: rolagem lateral nativa (toque/trackpad), setas no desktop. Sem biblioteca.
export function FeaturedProducts({ products, loading = false, error = false, onRetry, onAddToCart }: FeaturedProductsProps) {
    const trackRef = useRef<HTMLUListElement>(null);
    const [edges, setEdges] = useState({ start: true, end: true });

    const updateEdges = useCallback(() => {
        const track = trackRef.current;
        if (!track) return;
        setEdges({
            start: track.scrollLeft <= 4,
            end: track.scrollLeft + track.clientWidth >= track.scrollWidth - 4,
        });
    }, []);

    useEffect(() => {
        updateEdges();
        window.addEventListener("resize", updateEdges);
        return () => window.removeEventListener("resize", updateEdges);
    }, [updateEdges, products.length, loading]);

    function scrollByPage(direction: -1 | 1) {
        const track = trackRef.current;
        if (!track) return;
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        track.scrollBy({ left: direction * track.clientWidth * 0.9, behavior: reduce ? "auto" : "smooth" });
    }

    // sem destaques (e sem erro): a seção não aparece
    if (!loading && !error && products.length === 0) return null;

    return (
        <section aria-labelledby="destaques-titulo" className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
            <div className="mb-8 flex items-end justify-between gap-4">
                <div>
                    <SectionEyebrow>Destaques</SectionEyebrow>
                    <SectionTitle className="mt-3 text-[clamp(1.5rem,1.1rem+1.6vw,2.25rem)]">
                        <span id="destaques-titulo">Produtos que inspiram e equilibram</span>
                    </SectionTitle>
                </div>
                {!loading && !error && products.length > 1 && (
                    <div className="hidden gap-2 sm:flex">
                        <button
                            type="button"
                            onClick={() => scrollByPage(-1)}
                            disabled={edges.start}
                            aria-label="Produtos anteriores"
                            className="flex size-10 items-center justify-center rounded-full border border-mc-violet-950/30 text-mc-violet-950 transition-colors hover:bg-mc-violet-950 hover:text-mc-sand-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mc-violet-700/50 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-mc-violet-950"
                        >
                            <ChevronLeft size={18} strokeWidth={1.5} aria-hidden="true" />
                        </button>
                        <button
                            type="button"
                            onClick={() => scrollByPage(1)}
                            disabled={edges.end}
                            aria-label="Próximos produtos"
                            className="flex size-10 items-center justify-center rounded-full border border-mc-violet-950/30 text-mc-violet-950 transition-colors hover:bg-mc-violet-950 hover:text-mc-sand-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mc-violet-700/50 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-mc-violet-950"
                        >
                            <ChevronRight size={18} strokeWidth={1.5} aria-hidden="true" />
                        </button>
                    </div>
                )}
            </div>

            {error ? (
                <div role="alert" className="flex flex-col items-start gap-3 rounded-md border border-mc-violet-950/10 bg-white p-6">
                    <p className="text-sm text-mc-ink/70">Não conseguimos carregar os produtos agora.</p>
                    {onRetry && (
                        <Button type="button" variant="pillOutline" size="pillSm" onClick={onRetry}>
                            Tentar de novo
                        </Button>
                    )}
                </div>
            ) : loading ? (
                <ul className="flex gap-5 overflow-hidden" role="status" aria-label="Carregando produtos">
                    {[0, 1, 2, 3].map((i) => (
                        <li key={i} aria-hidden="true" className="w-[46%] shrink-0 animate-pulse sm:w-[31%] lg:w-[calc(25%-15px)]">
                            <div className="aspect-5/4 rounded-t-md bg-mc-blush-100" />
                            <div className="space-y-3 rounded-b-md border border-t-0 border-mc-violet-950/10 bg-white p-4">
                                <div className="h-3.5 w-4/5 rounded bg-mc-blush-100" />
                                <div className="h-4 w-1/3 rounded bg-mc-blush-200" />
                                <div className="h-9 w-full rounded-full bg-mc-blush-100" />
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <ul
                    ref={trackRef}
                    onScroll={updateEdges}
                    className="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                >
                    {products.map((product) => (
                        <li key={product.id} className="w-[46%] shrink-0 snap-start sm:w-[31%] lg:w-[calc(25%-15px)]">
                            <ProductCard product={product} onAddToCart={onAddToCart} />
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}
