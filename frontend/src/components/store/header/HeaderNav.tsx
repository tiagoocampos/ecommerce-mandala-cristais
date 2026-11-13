import { Link, useLocation } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { Category } from "@/types";

const MAX_INLINE = 6;

// Categorias reais na linha do cabeçalho (desktop). As que não couberem vão para "Mais".
export function HeaderNav({ categories, className }: { categories: Category[]; className?: string }) {
  const { pathname } = useLocation();
  if (categories.length === 0) return null;

  const inline = categories.slice(0, MAX_INLINE);
  const extra = categories.slice(MAX_INLINE);
  const linkClass = (active: boolean) =>
    cn(
      "whitespace-nowrap border-b border-transparent py-1 text-[13px] text-mc-ink/80 transition-colors hover:text-mc-violet-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mc-primary/40",
      active && "border-mc-violet-950 text-mc-violet-950"
    );

  return (
    <nav aria-label="Categorias" className={cn("items-center gap-5 xl:gap-7", className)}>
      {inline.map((category) => (
        <Link
          key={category.id}
          to={`/categoria/${category.slug}`}
          aria-current={pathname === `/categoria/${category.slug}` ? "page" : undefined}
          className={linkClass(pathname === `/categoria/${category.slug}`)}
        >
          {category.name}
        </Link>
      ))}
      {extra.length > 0 && (
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger className={cn(linkClass(false), "inline-flex items-center gap-1")}>
            Mais <ChevronDown size={14} strokeWidth={1.5} aria-hidden="true" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {extra.map((category) => (
              <DropdownMenuItem key={category.id} asChild>
                <Link to={`/categoria/${category.slug}`}>{category.name}</Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </nav>
  );
}
