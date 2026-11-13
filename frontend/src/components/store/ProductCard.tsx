import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Check, ShoppingBag } from "lucide-react";
import { Button } from "../ui/button";
import { ProductImage } from "./ProductImage";
import { formatPrice } from "../../lib/utils-api";
import { discountPercent, type MandalaProduct } from "../../types/mandala";

interface ProductCardProps {
    product: MandalaProduct;
    /** pode devolver Promise<boolean> (false = não adicionou) para o botão mostrar o feedback */
    onAddToCart?: (product: MandalaProduct) => void | Promise<boolean>;
}

type AddState = "idle" | "adding" | "added";

// Cartão com borda fina, sem sombra em repouso (leve no hover). Altura uniforme: o rodapé
// com "Ver produto →" fica sempre alinhado ao fundo.
export function ProductCard({ product, onAddToCart }: ProductCardProps) {
    const [addState, setAddState] = useState<AddState>("idle");
    const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    useEffect(() => () => clearTimeout(timer.current), []);

    const hasPromo = !!product.promo_price && product.promo_price < product.price;
    const finalPrice = hasPromo ? product.promo_price! : product.price;
    const soldOut = product.stock === 0;
    const href = `/produto/${product.slug}`;
    // segunda foto ao passar o mouse (só quando existe; no toque a informação não depende dela)
    const hoverImage = product.images?.slice().sort((a, b) => a.position - b.position)[0]?.url;

    async function handleAdd() {
        if (!onAddToCart || addState === "adding") return;
        setAddState("adding");
        const result = await onAddToCart(product);
        if (result === false) {
            setAddState("idle");
            return;
        }
        setAddState("added");
        timer.current = setTimeout(() => setAddState("idle"), 1500);
    }

    return (
        <article className="group flex h-full flex-col overflow-hidden rounded-md border border-mc-violet-950/10 bg-white transition-shadow duration-200 hover:shadow-md motion-reduce:transition-none">
            <Link to={href} tabIndex={-1} aria-hidden="true" className="relative block aspect-5/4 overflow-hidden bg-mc-blush-100">
                <ProductImage
                    src={product.banner}
                    alt=""
                    className="transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none"
                />
                {hoverImage && (
                    <img
                        src={hoverImage}
                        alt=""
                        loading="lazy"
                        className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100 motion-reduce:transition-none"
                    />
                )}
                {hasPromo && !soldOut && (
                    <span className="absolute left-2.5 top-2.5 rounded-full bg-mc-violet-950 px-2 py-0.5 text-[11px] font-medium text-mc-sand-50">
                        -{discountPercent(product.price, product.promo_price!)}%
                    </span>
                )}
                {soldOut && (
                    <span className="absolute left-2.5 top-2.5 rounded-full bg-mc-ink/80 px-2 py-0.5 text-[11px] font-medium text-mc-sand-50">
                        Esgotado
                    </span>
                )}
            </Link>

            <div className="flex flex-1 flex-col p-4">
                <h3 className="line-clamp-2 min-h-10 text-sm leading-snug text-mc-ink/85">
                    <Link to={href} className="hover:text-mc-violet-950 focus-visible:outline-none focus-visible:underline">
                        {product.name}
                    </Link>
                </h3>

                <p className="mt-2 text-base font-semibold text-mc-violet-950">
                    {hasPromo && (
                        <span className="mr-1.5 text-xs font-normal text-mc-ink/45 line-through">{formatPrice(product.price)}</span>
                    )}
                    {formatPrice(finalPrice)}
                </p>

                <div className="mt-auto flex items-center justify-center gap-2 pt-4">
                    <Button asChild variant="pillOutline" size="pillSm" className="min-h-11 flex-1">
                        <Link to={href} aria-label={`Ver produto: ${product.name}`}>
                            Ver produto
                            <ArrowRight aria-hidden="true" />
                        </Link>
                    </Button>
                    {onAddToCart && (
                        <button
                            type="button"
                            onClick={handleAdd}
                            disabled={soldOut || addState === "adding"}
                            aria-label={
                                soldOut ? "Esgotado" : addState === "added" ? "Adicionado ao carrinho" : `Adicionar ${product.name} ao carrinho`
                            }
                            aria-live="polite"
                            className="flex size-11 shrink-0 items-center justify-center rounded-full border border-mc-violet-950/30 text-mc-violet-950 transition-colors hover:bg-mc-violet-950 hover:text-mc-sand-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mc-violet-700/50 disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-mc-violet-950"
                        >
                            {addState === "added" ? (
                                <Check size={16} strokeWidth={1.5} aria-hidden="true" />
                            ) : (
                                <ShoppingBag size={16} strokeWidth={1.5} aria-hidden="true" />
                            )}
                        </button>
                    )}
                </div>
            </div>
        </article>
    );
}
