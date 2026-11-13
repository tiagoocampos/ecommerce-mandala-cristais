import { useEffect, useState } from "react";
import { api } from "@/services/api";
import { useAuthUser } from "@/hooks/useAuthUser";
import { useCart } from "@/contexts/CartContext";
import { cn } from "@/lib/utils";
import type { Category } from "@/types";
import {
  Logo,
  SearchBar,
  CartButton,
  UserMenu,
  CartSheet,
  MobileMenuSheet,
} from "./header";
import { HeaderNav } from "./header/HeaderNav";

export function StoreHeader() {
  const { itemCount } = useCart();
  const [categories, setCategories] = useState<Category[]>([]);
  const [scrolled, setScrolled] = useState(false);

  const user = useAuthUser();
  const isLogged = !!user;

  useEffect(() => {
    let mounted = true;

    api
      .get<Category[]>("/category")
      .then(({ data }) => {
        if (mounted) setCategories(data);
      })
      .catch(() => {
        if (mounted) setCategories([]);
      });

    return () => {
      mounted = false;
    };
  }, []);

  // Cabeçalho fixo que encolhe um pouco depois de rolar
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-mc-primary/10 bg-mc-sand-50/95 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Linha única: logo → categorias → busca → usuário → carrinho */}
        <div
          className={cn(
            "flex items-center gap-2 transition-[padding] duration-200 motion-reduce:transition-none sm:gap-4 lg:gap-8",
            scrolled ? "py-1.5" : "py-3"
          )}
        >
          <div className="flex items-center gap-1 sm:gap-2 lg:hidden">
            <MobileMenuSheet
              categories={categories}
              user={user}
              isLogged={isLogged}
              itemCount={itemCount}
            />
          </div>

          <Logo compact={scrolled} className="mx-auto lg:mx-0" />

          <HeaderNav categories={categories} className="hidden lg:flex" />

          <SearchBar className="ml-auto hidden max-w-xs flex-1 md:block lg:ml-auto" />

          <div className="flex items-center gap-0.5 sm:gap-2 lg:ml-0">
            <UserMenu user={user} isLogged={isLogged} />
            <CartButton itemCount={itemCount} />
          </div>
        </div>
        <CartSheet />
      </div>
    </header>
  );
}
