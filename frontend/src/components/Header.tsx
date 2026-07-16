import { useNavigate, useLocation } from "react-router-dom";
import {
    Menu,
    LogOut,
    Home,
    Tag,
    Package,
    ClipboardList,
    User,
    Settings
} from "lucide-react";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "./ui/sheet";
import { clearAuth, getStoredUser } from "../lib/auth";

const baseNavLinks = [
    { path: "/", label: "Home", icon: Home },
    { path: "/categories", label: "Categorias", icon: Tag },
    { path: "/products", label: "Produtos", icon: Package },
    { path: "/orders", label: "Pedidos", icon: ClipboardList },
    { path: "/profile", label: "Perfil", icon: User },
];

export function Header() {
    const navigate = useNavigate();
    const location = useLocation();
    const user = getStoredUser();

    const isAdmin = user?.role === "ADMIN";

    const navLinks = [
        ...baseNavLinks,
        ...(isAdmin
            ? [
                  {
                      path: "/admin",
                      label: "Painel admin",
                      icon: Settings,
                  },
              ]
            : []),
    ];

    function handleLogout() {
        clearAuth();
        navigate("/login");
    }

    function handleNavigate(path: string) {
        navigate(path);
    }

    const linkClass = (path: string) =>
        `text-sm flex items-center gap-1 ${
            location.pathname === path
                ? "text-gray-100"
                : "text-gray-300 hover:text-gray-100"
        }`;

    return (
        <header className="bg-amber-950 px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <button
                onClick={() => handleNavigate("/")}
                className="text-gray-100 font-semibold text-lg"
            >
                Café Central
            </button>

            
            <nav className="hidden lg:flex items-center gap-4">
                {navLinks.map(({ path, label, icon: Icon }) => (
                    <button
                        key={path}
                        onClick={() => handleNavigate(path)}
                        className={linkClass(path)}
                    >
                        <Icon size={16} />
                        {label}
                    </button>
                ))}

                <Button
                    onClick={handleLogout}
                    className="bg-gray-200 text-amber-950 hover:bg-gray-300 text-sm px-3 py-1 rounded-sm flex items-center gap-1"
                >
                    <LogOut size={16} />
                    Sair
                </Button>
            </nav>

            
            <div className="lg:hidden">
                <Sheet>
                    <SheetTrigger asChild>
                        <button
                            className="text-gray-100"
                            aria-label="Abrir menu"
                        >
                            <Menu size={24} />
                        </button>
                    </SheetTrigger>

                    <SheetContent
                        side="right"
                        className="bg-amber-950 border-amber-900 w-64"
                    >
                        <div className="flex flex-col gap-6 mt-8">
                            <p className="text-gray-300 mx-auto text-lg">
                                Olá,{" "}
                                <span className="text-gray-100 font-medium">
                                    {user?.name}
                                </span>
                            </p>

                            <div className="flex flex-col gap-4">
                                {navLinks.map(({ path, label, icon: Icon }) => (
                                    <SheetClose key={path} asChild>
                                        <button
                                            onClick={() => handleNavigate(path)}
                                            className={`text-lg ml-5 flex items-center gap-2 ${
                                                location.pathname === path
                                                    ? "text-gray-100"
                                                    : "text-gray-300 hover:text-gray-100"
                                            }`}
                                        >
                                            <Icon size={16} />
                                            {label}
                                        </button>
                                    </SheetClose>
                                ))}

                                <SheetClose asChild>
                                    <button
                                        onClick={handleLogout}
                                        className="text-red-400 hover:text-red-300 text-lg ml-5 flex items-center gap-2"
                                    >
                                        <LogOut size={16} />
                                        Sair
                                    </button>
                                </SheetClose>
                            </div>
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
        </header>
    );
}