import { useNavigate } from "react-router-dom";
import {
  User,
  ShoppingBag,
  LogOut,
  LayoutDashboard,
  Menu,
  type LucideIcon,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Logo } from "./Logo";
import { SearchBar } from "./SearchBar";
import { CategoriesBar } from "./CategoriesBar";
import { clearAuth } from "@/lib/auth";
import type { Category, User as UserType } from "@/types";

type MobileMenuSheetProps = {
  categories: Category[];
  user: UserType | null;
  isLogged: boolean;
  itemCount: number;
};

type MobileLink = {
  label: string;
  icon: LucideIcon;
  path: string;
};

function MobileLink({
  link,
  badge,
}: {
  link: MobileLink;
  badge?: number;
}) {
  const navigate = useNavigate();
  const Icon = link.icon;

  return (
    <SheetClose asChild>
      <button
        type="button"
        onClick={() => navigate(link.path)}
        className="group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-mc-primary/80 transition-all duration-200 hover:bg-mc-primary-soft hover:text-mc-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mc-primary/40"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-mc-primary-soft text-mc-primary transition-all duration-200 group-hover:bg-mc-primary group-hover:text-white">
          <Icon size={17} aria-hidden="true" />
        </span>
        <span className="flex-1">{link.label}</span>
        {badge !== undefined && badge > 0 && (
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-mc-primary px-1.5 text-[10px] font-bold text-white">
            {badge}
          </span>
        )}
      </button>
    </SheetClose>
  );
}

export function MobileMenuSheet({
  categories,
  user,
  isLogged,
  itemCount,
}: MobileMenuSheetProps) {
  const navigate = useNavigate();

  function handleLogout() {
    clearAuth();
    navigate("/");
  }

  const accountLinks: MobileLink[] = [
    { label: "Minha conta", icon: User, path: "/profile" },
    { label: "Carrinho", icon: ShoppingBag, path: "/carrinho" },
  ];

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Abrir menu"
          className="shrink-0 text-mc-primary transition-all duration-200 hover:bg-mc-primary-soft hover:text-mc-primary-dark cursor-pointer lg:hidden"
        >
          <Menu size={22} aria-hidden="true" />
        </Button>
      </SheetTrigger>

      <SheetContent
        side="left"
        className="w-[20rem] max-w-[88vw] border-r border-mc-primary/10 bg-gradient-to-b from-mc-sand-50 to-mc-primary-soft p-0"
      >
        {/* Topo com logo */}
        <div className="border-b border-mc-primary/10 bg-white/70 px-5 py-4 backdrop-blur-sm">
          <Logo onClick={undefined} />
        </div>

        <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-5 py-5">
          {/* Busca */}
          <SearchBar />

          {/* Categorias */}
          <section aria-label="Categorias">
            <p className="mb-3 px-1 text-[11px] font-semibold uppercase tracking-wider text-mc-primary/40">
              Categorias
            </p>
            <CategoriesBar
              categories={categories}
              variant="vertical"
              onNavigate={() => {}}
            />
          </section>

          {/* Conta e ações */}
          <section aria-label="Conta">
            <div className="my-1 h-px bg-mc-primary/10" />
            <p className="mb-2 px-1 pt-3 text-[11px] font-semibold uppercase tracking-wider text-mc-primary/40">
              Você
            </p>

            {isLogged ? (
              <>
                <div className="mb-2 flex items-center gap-2 rounded-xl bg-mc-primary-soft px-3 py-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-mc-primary text-white">
                    <User size={15} aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-mc-primary">
                      {user?.name}
                    </p>
                    <p className="truncate text-xs text-mc-primary/60">
                      {user?.email}
                    </p>
                  </div>
                </div>

                {accountLinks.map((link) => (
                  <MobileLink
                    key={link.path}
                    link={link}
                    badge={link.path === "/carrinho" ? itemCount : undefined}
                  />
                ))}

                {user?.role === "ADMIN" && (
                  <MobileLink
                    link={{
                      label: "Painel Admin",
                      icon: LayoutDashboard,
                      path: "/admin",
                    }}
                  />
                )}

                <SheetClose asChild>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-red-600/80 transition-all duration-200 hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-500 transition-all duration-200 group-hover:bg-red-600 group-hover:text-white">
                      <LogOut size={17} aria-hidden="true" />
                    </span>
                    <span className="flex-1">Sair</span>
                  </button>
                </SheetClose>
              </>
            ) : (
              <div className="flex flex-col gap-2">
                <SheetClose asChild>
                  <Button
                    type="button"
                    onClick={() => navigate("/login")}
                    className="w-full rounded-full bg-mc-primary text-white transition-colors hover:bg-mc-primary-dark cursor-pointer"
                  >
                    Entrar
                  </Button>
                </SheetClose>
                <SheetClose asChild>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/register")}
                    className="w-full rounded-full border-mc-primary/25 text-mc-primary transition-colors hover:bg-mc-primary-soft cursor-pointer"
                  >
                    Criar conta
                  </Button>
                </SheetClose>
              </div>
            )}
          </section>
        </div>
      </SheetContent>
    </Sheet>
  );
}
