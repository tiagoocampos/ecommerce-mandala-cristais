// Esqueleto do ProductCard enquanto os produtos carregam.
export function ProductCardSkeleton() {
    return (
        <div className="flex flex-col animate-pulse" aria-hidden="true">
            <div className="facet-cut-sm aspect-square mb-3 bg-mc-blush-100" />
            <div className="h-3.5 w-4/5 rounded bg-mc-blush-100 mb-2" />
            <div className="h-3.5 w-1/2 rounded bg-mc-blush-100 mb-3" />
            <div className="h-5 w-1/3 rounded bg-mc-blush-200 mb-1.5" />
            <div className="h-9 w-full rounded-full bg-mc-blush-100 mt-3" />
        </div>
    );
}

export function ProductGridSkeleton({ count = 4, className }: { count?: number; className?: string }) {
    return (
        <div className={className} role="status" aria-label="Carregando produtos">
            {Array.from({ length: count }).map((_, i) => (
                <ProductCardSkeleton key={i} />
            ))}
        </div>
    );
}
