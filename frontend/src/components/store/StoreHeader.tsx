import { useEffect, useState } from "react";
import { api } from "@/services/api";
import { getStoredUser } from "@/lib/auth";
import { useCart } from "@/contexts/CartContext";
import type { Category } from "@/types";
import {
  Logo,
  SearchBar,
  CategoriesBar,
  CartButton,
  UserSheet,
  MobileMenuSheet,
} from "./header";

export function StoreHeader() {
  const { itemCount } = useCart();
  const [categories, setCategories] = useState<Category[]>([]);

  const user = getStoredUser();
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

  return (
    <header className="sticky top-0 z-40 border-b border-mc-primary/10 bg-mc-sand-50/95 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Linha principal */}
        <div className="flex items-center justify-between gap-2 py-3 sm:py-4 sm:gap-4">
          <div className="flex items-center gap-1 sm:gap-2">
            <MobileMenuSheet
              categories={categories}
              user={user}
              isLogged={isLogged}
              itemCount={itemCount}
            />
            <Logo className="lg:hidden" />
          </div>

          <div className="hidden lg:block">
            <Logo />
          </div>

          <SearchBar className="hidden md:block flex-1 max-w-md" />

          <div className="flex items-center gap-0.5 sm:gap-2">
            <UserSheet user={user} isLogged={isLogged} />
            <CartButton itemCount={itemCount} />
          </div>
        </div>

        {/* Categorias no desktop */}
        <div className="hidden lg:block">
          <CategoriesBar categories={categories} className="pb-2" />
        </div>
      </div>
    </header>
  );
}
