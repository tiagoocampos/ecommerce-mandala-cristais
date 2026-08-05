import { useNavigate } from "react-router-dom";
import {
  User,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  LayoutGrid,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { clearAuth } from "@/lib/auth";
import type { User as UserType } from "@/types";

type UserSheetProps = {
  user: UserType | null;
  isLogged: boolean;
  onNavigate?: () => void;
};

type MenuLink = {
  label: string;
  icon: LucideIcon;
  path: string;
};

function AccountMenuLink({
  link,
  onNavigate,
}: {
  link: MenuLink;
  onNavigate?: () => void;
}) {
  const navigate = useNavigate();
  const Icon = link.icon;

  return (
    <SheetClose asChild>
      <button
        type="button"
        onClick={() => {
          onNavigate?.();
          navigate(link.path);
        }}
        className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-mc-primary/80 transition-all duration-200 hover:bg-mc-primary-soft hover:text-mc-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mc-primary/40"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-mc-primary-soft text-mc-primary transition-all duration-200 group-hover:bg-mc-primary group-hover:text-white">
          <Icon size={16} aria-hidden="true" />
        </span>
        <span className="flex-1">{link.label}</span>
        <ChevronRight
          size={15}
          aria-hidden="true"
          className="text-mc-primary/30 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-mc-primary"
        />
      </button>
    </SheetClose>
  );
}

export function UserSheet({ user, isLogged, onNavigate }: UserSheetProps) {
  const navigate = useNavigate();

  function handleTriggerClick() {
    if (!isLogged) {
      navigate("/login");
      return;
    }
  }

  function handleLogout() {
    onNavigate?.();
    clearAuth();
    navigate("/");
  }

  const links: MenuLink[] = [
    { label: "Minha conta", icon: User, path: "/profile" },
    { label: "Meus pedidos", icon: ClipboardList, path: "/pedidos" },
  ];

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={handleTriggerClick}
          aria-label={isLogged ? "Abrir menu do usuário" : "Entrar"}
          className="relative text-mc-primary transition-all duration-200 hover:bg-mc-primary-soft hover:text-mc-primary-dark cursor-pointer"
        >
          <User
            size={20}
            aria-hidden="true"
            className="transition-transform duration-200 hover:scale-110"
          />
          {isLogged && (
            <span className="absolute bottom-0.5 right-0.5 h-2 w-2 rounded-full bg-mc-gold-500 ring-2 ring-mc-sand-50" />
          )}
        </Button>
      </SheetTrigger>

      <SheetContent
        side="right"
        className="w-[19rem] max-w-[85vw] border-l border-mc-primary/10 bg-gradient-to-b from-mc-sand-50 to-mc-primary-soft p-0"
      >
        {/* Cabeçalho do usuário */}
        <div className="relative overflow-hidden bg-mc-primary px-6 pb-6 pt-8 text-white">
          <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-mc-gold-500/20 blur-2xl" />
          <div className="absolute -left-6 -bottom-12 h-28 w-28 rounded-full bg-mc-primary-light/40 blur-2xl" />

          <div className="relative flex flex-col items-center gap-3 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/15 ring-2 ring-white/25 backdrop-blur-sm">
              <User size={30} aria-hidden="true" className="text-white" />
            </div>
            <div>
              <p className="font-display text-lg font-semibold leading-tight">
                {isLogged ? user?.name : "Olá, visitante"}
              </p>
              <p className="mt-0.5 text-xs text-white/70">
                {isLogged ? user?.email : "Entre para ver suas informações"}
              </p>
            </div>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="flex flex-1 flex-col gap-1 overflow-y-auto px-4 py-5">
          {isLogged ? (
            <>
              <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-mc-primary/40">
                Minha conta
              </p>
              {links.map((link) => (
                <AccountMenuLink key={link.path} link={link} onNavigate={onNavigate} />
              ))}

              {user?.role === "ADMIN" && (
                <>
                  <div className="my-3 h-px bg-mc-primary/10" />
                  <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-mc-primary/40">
                    Administração
                  </p>
                  <AccountMenuLink
                    link={{
                      label: "Painel Admin",
                      icon: LayoutDashboard,
                      path: "/admin",
                    }}
                    onNavigate={onNavigate}
                  />
                </>
              )}

              <div className="my-3 h-px bg-mc-primary/10" />

              <SheetClose asChild>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-red-600/80 transition-all duration-200 hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-500 transition-all duration-200 group-hover:bg-red-600 group-hover:text-white">
                    <LogOut size={16} aria-hidden="true" />
                  </span>
                  <span className="flex-1">Sair</span>
                </button>
              </SheetClose>
            </>
          ) : (
            <div className="flex flex-col items-center gap-3 px-3 pt-6 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-mc-primary-soft">
                <LayoutGrid size={22} aria-hidden="true" className="text-mc-primary" />
              </div>
              <p className="text-sm text-mc-primary/70">
                Entre para acessar sua conta, pedidos e mais benefícios.
              </p>
              <SheetClose asChild>
                <Button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="mt-2 w-full rounded-full bg-mc-primary text-white transition-colors hover:bg-mc-primary-dark cursor-pointer"
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
        </div>
      </SheetContent>
    </Sheet>
  );
}
