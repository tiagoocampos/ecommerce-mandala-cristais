import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { ProductCard } from "./ProductCard";
import type { MandalaProduct } from "../../types/mandala";

interface ProductGridProps {
    title: string;
    subtitle?: string;
    products: MandalaProduct[];
    seeAllHref?: string;
    onAddToCart?: (product: MandalaProduct) => void;
}

export function ProductGrid({
    title,
    subtitle,
    products,
    seeAllHref,
    onAddToCart,
}: ProductGridProps) {
    const navigate = useNavigate();

    return (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
            <div className="flex items-end justify-between mb-7">
                <div>
                    <h2 className="font-display text-2xl sm:text-3xl text-mc-violet-950">
                        {title}
                    </h2>
                    {subtitle && (
                        <p className="text-sm text-mc-ink/60 mt-1">{subtitle}</p>
                    )}
                </div>
                {seeAllHref && (
                    <button
                        onClick={() => navigate(seeAllHref)}
                        className="hidden sm:flex items-center gap-1 text-sm font-medium text-mc-violet-950 hover:text-mc-gold-600 shrink-0"
                    >
                        Ver tudo <ArrowRight size={14} />
                    </button>
                )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-8">
                {products.map((product) => (
                    <ProductCard
                        key={product.id}
                        product={product}
                        onAddToCart={onAddToCart}
                    />
                ))}
            </div>
        </section>
    );
}
