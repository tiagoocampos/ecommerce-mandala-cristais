import { useNavigate } from "react-router-dom";
import { Star, ShoppingBag } from "lucide-react";
import { Button } from "../ui/button";
import { formatPrice } from "../../lib/utils-api";
import { discountPercent, type MandalaProduct } from "../../types/mandala";

interface ProductCardProps {
    product: MandalaProduct;
    onAddToCart?: (product: MandalaProduct) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
    const navigate = useNavigate();
    const hasPromo = !!product.promo_price && product.promo_price < product.price;
    const finalPrice = hasPromo ? product.promo_price! : product.price;
    const installments = (finalPrice / 100 / 3).toFixed(2);

    return (
        <div className="group flex flex-col">
            <button
                onClick={() => navigate(`/produto/${product.slug}`)}
                className="relative facet-cut-sm overflow-hidden bg-mc-blush-100 aspect-square mb-3 block"
            >
                {product.banner ? (
                    <img
                        src={product.banner}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">
                        💎
                    </div>
                )}

                {hasPromo && (
                    <span className="absolute top-3 left-3 bg-mc-violet-950 text-mc-sand-50 text-[11px] font-bold px-2 py-1 rounded-full">
                        -{discountPercent(product.price, product.promo_price!)}%
                    </span>
                )}

                {product.stock === 0 && (
                    <span className="absolute inset-0 bg-mc-ink/50 flex items-center justify-center text-mc-sand-50 text-xs font-semibold tracking-wide uppercase">
                        Esgotado
                    </span>
                )}
            </button>

            {product.rating !== undefined && (
                <div className="flex items-center gap-0.5 mb-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                            key={i}
                            size={12}
                            className={
                                i < Math.round(product.rating!)
                                    ? "fill-mc-gold-500 text-mc-gold-500"
                                    : "fill-mc-violet-950/10 text-mc-violet-950/10"
                            }
                        />
                    ))}
                </div>
            )}

            <button
                onClick={() => navigate(`/produto/${product.slug}`)}
                className="text-left text-sm text-mc-ink/80 leading-snug mb-1.5 line-clamp-2 hover:text-mc-violet-950"
            >
                {product.name}
            </button>

            <div className="mt-auto">
                {hasPromo && (
                    <span className="text-xs text-mc-ink/40 line-through mr-1.5">
                        {formatPrice(product.price)}
                    </span>
                )}
                <span className="text-lg font-semibold text-mc-violet-950">
                    {formatPrice(finalPrice)}
                </span>
                <p className="text-[11px] text-mc-ink/50 mt-0.5">
                    ou 3x de R$ {installments} sem juros
                </p>
            </div>

            <Button
                disabled={product.stock === 0}
                onClick={() => onAddToCart?.(product)}
                className="mt-3 w-full bg-mc-violet-950 hover:bg-mc-violet-800 text-mc-sand-50 rounded-full text-xs h-9 disabled:opacity-40"
            >
                <ShoppingBag size={14} className="mr-1.5" />
                {product.stock === 0 ? "Indisponível" : "Adicionar"}
            </Button>
        </div>
    );
}
