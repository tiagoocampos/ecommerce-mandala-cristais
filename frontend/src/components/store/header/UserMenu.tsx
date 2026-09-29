import { useNavigate } from "react-router-dom";
import { User, ClipboardList, LayoutDashboard, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { clearAuth } from "@/lib/auth";
import type { User as UserType } from "@/types";

type UserMenuProps = {
  user: UserType | null;
  isLogged: boolean;
};

const triggerClassName =
  "relative text-mc-primary transition-all duration-200 hover:bg-mc-primary-soft hover:text-mc-primary-dark cursor-pointer";

export function UserMenu({ user, isLogged }: UserMenuProps) {
  const navigate = useNavigate();

  function handleLogout() {
    clearAuth();
    navigate("/");
  }

  if (!isLogged) {
    return (
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => navigate("/login")}
        aria-label="Entrar"
        className={triggerClassName}
      >
        <User size={20} aria-hidden="true" />
      </Button>
    );
  }

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Abrir menu do usuário"
          className={triggerClassName}
        >
          <User size={20} aria-hidden="true" />
          <span className="absolute bottom-0.5 right-0.5 h-2 w-2 rounded-full bg-mc-gold-500 ring-2 ring-mc-sand-50" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-60">
        <DropdownMenuLabel className="flex items-center gap-2.5 py-2">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-mc-primary text-white">
            <User size={16} aria-hidden="true" />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold text-mc-violet-950">
              {user?.name}
            </span>
            <span className="block truncate text-xs font-normal text-mc-ink/60">
              {user?.email}
            </span>
          </span>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem onSelect={() => navigate("/profile")}>
            <User aria-hidden="true" /> Minha conta
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => navigate("/pedidos")}>
            <ClipboardList aria-hidden="true" /> Meus pedidos
          </DropdownMenuItem>
          {user?.role === "ADMIN" && (
            <DropdownMenuItem onSelect={() => navigate("/admin")}>
              <LayoutDashboard aria-hidden="true" /> Painel Admin
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuItem variant="destructive" onSelect={handleLogout}>
          <LogOut aria-hidden="true" /> Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
