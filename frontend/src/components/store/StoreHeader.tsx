import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Search,
    ShoppingBag,
    User,
    Menu,
    X,
    Sparkles,
    LogOut,
} from "lucide-react";
import { Button } from "../ui/button";
import { cn } from "../../lib/utils";
import { clearAuth, getStoredUser } from "../../lib/auth";
import { api } from "../../services/api";
import { useCart } from "../../contexts/CartContext";
import type { Category } from "../../types";

export function StoreHeader() {
    const navigate = useNavigate();
    const { itemCount } = useCart();
    const [menuOpen, setMenuOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [search, setSearch] = useState("");

    const user = getStoredUser();
    const isLogged = !!user;

    useEffect(() => {
        api
            .get<Category[]>("/category")
            .then(({ data }) => setCategories(data))
            .catch(() => {
                // Se o catálogo de categorias não carregar, a navegação
                // principal do site continua funcionando normalmente.
            });
    }, []);

    function handleUserIconClick() {
        if (isLogged) {
            setUserMenuOpen((v) => !v);
        } else {
            navigate("/login");
        }
    }

    function handleLogout() {
        setUserMenuOpen(false);
        setMenuOpen(false);
        clearAuth();
        navigate("/");
    }

    function handleSearchSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!search.trim()) return;
        setMenuOpen(false);
        navigate(`/produtos?q=${encodeURIComponent(search.trim())}`);
    }

    return (
        <header className="sticky top-0 z-40 bg-mc-sand-50/95 backdrop-blur border-b border-mc-violet-950/10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                {/* linha principal */}
                <div className="flex items-center justify-between gap-2 sm:gap-4 py-3 sm:py-4">
                    <button
                        className="lg:hidden text-mc-violet-950 shrink-0"
                        onClick={() => setMenuOpen((v) => !v)}
                        aria-label="Abrir menu"
                    >
                        {menuOpen ? <X size={22} /> : <Menu size={22} />}
                    </button>

                    <button
                        onClick={() => navigate("/")}
                        className="flex items-center gap-1.5 sm:gap-2 shrink-0"
                    >
                        <Sparkles className="text-mc-gold-500" size={20} />
                        <span className="font-display italic text-lg sm:text-2xl text-mc-violet-950 tracking-tight whitespace-nowrap">
                            Mandala Cristais
                        </span>
                    </button>

                    <form
                        onSubmit={handleSearchSubmit}
                        className="hidden md:flex flex-1 max-w-md relative"
                    >
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Buscar cristais, incensos..."
                            className="w-full rounded-full border border-mc-violet-950/15 bg-white/70 px-4 py-2.5 text-sm text-mc-ink placeholder:text-mc-ink/40 outline-none focus:ring-2 focus:ring-mc-gold-500/50"
                        />
                        <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2">
                            <Search size={16} className="text-mc-violet-950/40" />
                        </button>
                    </form>

                    <div className="flex items-center gap-0.5 sm:gap-3">
                        <div className="relative">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-mc-violet-950 hover:bg-mc-blush-100 cursor-pointer"
                                onClick={handleUserIconClick}
                            >
                                <User size={20} />
                            </Button>

                            {isLogged && userMenuOpen && (
                                <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-mc-violet-950/10 rounded-lg shadow-lg py-1.5 z-50">
                                    <p className="px-4 py-1.5 text-xs text-mc-ink/50 truncate">
                                        {user?.name}
                                    </p>
                                    <button
                                        className="w-full text-left px-4 py-2 text-sm text-mc-ink/80 hover:bg-mc-blush-100 cursor-pointer"
                                        onClick={() => {
                                            setUserMenuOpen(false);
                                            navigate("/profile");
                                        }}
                                    >
                                        Meus dados e endereços
                                    </button>
                                    <button
                                        className="w-full text-left px-4 py-2 text-sm text-mc-ink/80 hover:bg-mc-blush-100 cursor-pointer"
                                        onClick={() => {
                                            setUserMenuOpen(false);
                                            navigate("/pedidos");
                                        }}
                                    >
                                        Meus pedidos
                                    </button>
                                    {user?.role === "ADMIN" && (
                                        <button
                                            className="w-full text-left px-4 py-2 text-sm text-mc-ink/80 hover:bg-mc-blush-100 cursor-pointer"
                                            onClick={() => {
                                                setUserMenuOpen(false);
                                                navigate("/admin");
                                            }}
                                        >
                                            Painel admin
                                        </button>
                                    )}
                                    <div className="border-t border-mc-violet-950/10 my-1" />
                                    <button
                                        className="w-full text-left px-4 py-2 text-sm text-mc-violet-950 hover:bg-mc-blush-200 cursor-pointer flex items-center gap-2"
                                        onClick={handleLogout}
                                    >
                                        <LogOut size={14} /> Sair
                                    </button>
                                </div>
                            )}
                        </div>

                        <Button
                            variant="ghost"
                            size="icon"
                            className="relative text-mc-violet-950 hover:bg-mc-blush-100 cursor-pointer"
                            onClick={() => navigate("/carrinho")}
                        >
                            <ShoppingBag size={20} />
                            {itemCount > 0 && (
                                <span className="absolute -top-0.5 -right-0.5 bg-mc-gold-500 text-mc-violet-950 text-[10px] font-bold rounded-full min-w-4.5 h-4.5 px-1 flex items-center justify-center">
                                    {itemCount}
                                </span>
                            )}
                        </Button>
                    </div>
                </div>

                {/* busca no mobile, abaixo da linha principal */}
                <form onSubmit={handleSearchSubmit} className="md:hidden relative pb-3">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Buscar cristais, incensos..."
                        className="w-full rounded-full border border-mc-violet-950/15 bg-white/70 px-4 py-2 text-sm text-mc-ink placeholder:text-mc-ink/40 outline-none focus:ring-2 focus:ring-mc-gold-500/50"
                    />
                    <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 -mt-1.5">
                        <Search size={15} className="text-mc-violet-950/40" />
                    </button>
                </form>

                {/* navegação de categorias */}
                <nav
                    className={cn(
                        "lg:flex items-center gap-6 pb-3 overflow-x-auto",
                        menuOpen ? "flex flex-col items-start gap-3 pb-4" : "hidden"
                    )}
                >
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => {
                                setMenuOpen(false);
                                navigate(`/categoria/${cat.slug}`);
                            }}
                            className="text-xs font-medium tracking-wide uppercase text-mc-violet-950/70 hover:text-mc-violet-950 whitespace-nowrap transition-colors"
                        >
                            {cat.name}
                        </button>
                    ))}

                    {menuOpen && (
                        <>
                            <div className="w-full border-t border-mc-violet-950/10 my-1 lg:hidden" />
                            <button
                                onClick={() => {
                                    setMenuOpen(false);
                                    isLogged ? navigate("/profile") : navigate("/login");
                                }}
                                className="text-xs font-medium tracking-wide uppercase text-mc-violet-950/70 hover:text-mc-violet-950 lg:hidden"
                            >
                                {isLogged ? "Minha conta" : "Entrar"}
                            </button>
                            {isLogged && (
                                <button
                                    onClick={handleLogout}
                                    className="text-xs font-medium tracking-wide uppercase text-mc-violet-950/70 hover:text-mc-violet-950 lg:hidden"
                                >
                                    Sair
                                </button>
                            )}
                        </>
                    )}
                </nav>
            </div>
        </header>
    );
}
