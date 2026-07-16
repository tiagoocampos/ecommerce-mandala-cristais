import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ShoppingBag, User, Menu, X, Sparkles } from "lucide-react";
import { Button } from "../ui/button";
import { cn } from "../../lib/utils";

const CATEGORIES = [
    "Pedras",
    "Incenso",
    "Energia",
    "Para Casa",
    "Acessórios",
    "Bem Estar",
    "Iniciante",
    "Kits",
];

interface StoreHeaderProps {
    cartCount?: number;
}

export function StoreHeader({ cartCount = 0 }: StoreHeaderProps) {
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <header className="sticky top-0 z-40 bg-mc-sand-50/95 backdrop-blur border-b border-mc-violet-950/10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                {/* linha principal */}
                <div className="flex items-center justify-between gap-4 py-4">
                    <button
                        className="lg:hidden text-mc-violet-950"
                        onClick={() => setMenuOpen((v) => !v)}
                        aria-label="Abrir menu"
                    >
                        {menuOpen ? <X size={22} /> : <Menu size={22} />}
                    </button>

                    <button
                        onClick={() => navigate("/")}
                        className="flex items-center gap-2 shrink-0"
                    >
                        <Sparkles className="text-mc-gold-500" size={22} />
                        <span className="font-display italic text-2xl text-mc-violet-950 tracking-tight">
                            Mandala Cristais
                        </span>
                    </button>

                    <div className="hidden md:flex flex-1 max-w-md relative">
                        <input
                            type="text"
                            placeholder="Buscar cristais, incensos..."
                            className="w-full rounded-full border border-mc-violet-950/15 bg-white/70 px-4 py-2.5 text-sm text-mc-ink placeholder:text-mc-ink/40 outline-none focus:ring-2 focus:ring-mc-gold-500/50"
                        />
                        <Search
                            size={16}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-mc-violet-950/40"
                        />
                    </div>

                    <div className="flex items-center gap-1 sm:gap-3">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="hidden sm:flex text-mc-violet-950 hover:bg-mc-blush-100"
                            onClick={() => navigate("/login")}
                        >
                            <User size={20} />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="relative text-mc-violet-950 hover:bg-mc-blush-100"
                            onClick={() => navigate("/cart")}
                        >
                            <ShoppingBag size={20} />
                            {cartCount > 0 && (
                                <span className="absolute -top-0.5 -right-0.5 bg-mc-gold-500 text-mc-violet-950 text-[10px] font-bold rounded-full w-4.5 h-4.5 flex items-center justify-center">
                                    {cartCount}
                                </span>
                            )}
                        </Button>
                    </div>
                </div>

                {/* navegação de categorias */}
                <nav
                    className={cn(
                        "lg:flex items-center gap-6 pb-3 overflow-x-auto",
                        menuOpen ? "flex flex-col items-start gap-3 pb-4" : "hidden"
                    )}
                >
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => {
                                setMenuOpen(false);
                                navigate(`/categoria/${cat.toLowerCase().replace(/\s+/g, "-")}`);
                            }}
                            className="text-xs font-medium tracking-wide uppercase text-mc-violet-950/70 hover:text-mc-violet-950 whitespace-nowrap transition-colors"
                        >
                            {cat}
                        </button>
                    ))}
                </nav>
            </div>
        </header>
    );
}
