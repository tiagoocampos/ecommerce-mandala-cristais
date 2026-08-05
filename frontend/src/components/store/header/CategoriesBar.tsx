import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import type { Category } from "@/types";

type CategoriesBarProps = {
  categories: Category[];
  className?: string;
  onNavigate?: () => void;
  variant?: "horizontal" | "vertical";
};

export function CategoriesBar({
  categories,
  className,
  onNavigate,
  variant = "horizontal",
}: CategoriesBarProps) {
  const navigate = useNavigate();

  const isVertical = variant === "vertical";

  function handleCategoryClick(slug: string) {
    onNavigate?.();
    navigate(`/categoria/${slug}`);
  }

  return (
    <nav aria-label="Categorias" className={cn(className)}>
      <ul
        className={cn(
          "flex gap-1",
          isVertical
            ? "flex-col gap-1"
            : "items-center gap-1 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        )}
      >
        {categories.map((cat) => (
          <li key={cat.id} className="shrink-0">
            <button
              type="button"
              onClick={() => handleCategoryClick(cat.slug)}
              className={cn(
                "group flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium tracking-wide uppercase transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mc-primary/40",
                isVertical
                  ? "w-full justify-start text-mc-primary/80 hover:bg-mc-primary-soft hover:text-mc-primary"
                  : "text-mc-primary/60 hover:bg-mc-primary-soft hover:text-mc-primary"
              )}
            >
              <span className="h-1 w-1 rounded-full bg-mc-gold-500 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
              {cat.name}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
