import { useEffect, useState, type ReactNode } from "react";
import { useNavigate, useLocation, Outlet, Link } from "react-router-dom";
import { toast } from "sonner";
import {
    LayoutDashboard,
    Package,
    Tags,
    ClipboardList,
    Users,
    LogOut,
    Menu,
    X,
    Store,
    Megaphone,
} from "lucide-react";
import { ProtectedRoute } from "../../components/ProtectedRoute";
import { getStoredUser, clearAuth } from "../../lib/auth";
import { Loading } from "../../components/Loading";

const NAV_ITEMS = [
    { label: "Dashboard", icon: LayoutDashboard, href: "/admin" },
    { label: "Produtos", icon: Package, href: "/admin/produtos" },
    { label: "Categorias", icon: Tags, href: "/admin/categorias" },
    { label: "Pedidos", icon: ClipboardList, href: "/admin/pedidos" },
    { label: "Usuários", icon: Users, href: "/admin/usuarios" },
    { label: "Vitrine e cupons", icon: Megaphone, href: "/admin/vitrine" },
];

export function AdminRoute({ children }: { children: ReactNode }) {
    const navigate = useNavigate();
    const [checked, setChecked] = useState(false);

    useEffect(() => {
        const user = getStoredUser();
        if (!user || user.role !== "ADMIN") {
            toast.error("Acesso restrito a administradores.", {
                position: "top-center",
            });
            navigate("/", { replace: true });
            return;
        }
        setChecked(true);
    }, [navigate]);

    if (!checked) {
        return (
            <div className="min-h-screen bg-mc-sand-50 flex justify-center items-center">
                <Loading />
            </div>
        );
    }

    return <>{children}</>;
}

export function AdminLayout() {
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const user = getStoredUser();

    function handleLogout() {
        clearAuth();
        toast.success("Você saiu da conta", { position: "top-center" });
        navigate("/login");
    }

    return (
        <ProtectedRoute>
            <AdminRoute>
                <div className="min-h-screen bg-mc-sand-50 flex">
                    {/* overlay mobile */}
                    {sidebarOpen && (
                        <button
                            type="button"
                            className="fixed inset-0 z-30 bg-black/40 lg:hidden"
                            onClick={() => setSidebarOpen(false)}
                            aria-label="Fechar menu"
                        />
                    )}

                    {/* sidebar */}
                    <aside
                        className={`fixed inset-y-0 left-0 z-40 w-64 bg-mc-violet-950 text-mc-sand-50 flex flex-col transform transition-transform duration-200 ease-in-out lg:relative lg:translate-x-0 ${
                            sidebarOpen ? "translate-x-0" : "-translate-x-full"
                        }`}
                    >
                        <div className="flex items-center justify-between px-5 h-20 border-b border-white/10">
                            <Link
                                to="/admin"
                                aria-label="Mandala Crystais Admin — dashboard"
                                className="flex items-center gap-3"
                            >
                                <img
                                    src="/brand/logo-branca.png"
                                    alt="Mandala Crystais"
                                    width={400}
                                    height={279}
                                    className="h-12 w-auto"
                                />
                                <span className="font-display italic text-lg text-mc-gold-400 border-l border-white/15 pl-3">
                                    Admin
                                </span>
                            </Link>
                            <button
                                type="button"
                                onClick={() => setSidebarOpen(false)}
                                className="lg:hidden text-mc-sand-50/70 hover:text-mc-sand-50"
                                aria-label="Fechar menu"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                            {NAV_ITEMS.map((item) => {
                                const isActive =
                                    item.href === "/admin"
                                        ? location.pathname === "/admin"
                                        : location.pathname.startsWith(item.href);
                                return (
                                    <Link
                                        key={item.href}
                                        to={item.href}
                                        onClick={() => setSidebarOpen(false)}
                                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                                            isActive
                                                ? "bg-mc-gold-400/15 text-mc-gold-400 font-medium"
                                                : "text-mc-sand-50/70 hover:bg-mc-violet-800 hover:text-mc-sand-50"
                                        }`}
                                    >
                                        <item.icon size={18} />
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </nav>

                        <div className="border-t border-white/10 px-3 py-3 space-y-2">
                            <Link
                                to="/"
                                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-mc-sand-50/70 hover:bg-mc-violet-800 hover:text-mc-sand-50 transition-colors"
                            >
                                <Store size={18} />
                                Ver loja
                            </Link>
                            <button
                                type="button"
                                onClick={handleLogout}
                                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-mc-sand-50/70 hover:bg-mc-violet-800 hover:text-mc-sand-50 transition-colors w-full text-left"
                            >
                                <LogOut size={18} />
                                Sair
                            </button>
                        </div>
                    </aside>

                    {/* main content */}
                    <div className="flex-1 flex flex-col min-w-0">
                        {/* top bar (mobile) */}
                        <header className="lg:hidden bg-white border-b border-mc-violet-950/10 h-14 flex items-center px-4 gap-3">
                            <button
                                type="button"
                                onClick={() => setSidebarOpen(true)}
                                className="text-mc-violet-950"
                                aria-label="Abrir menu"
                            >
                                <Menu size={22} />
                            </button>
                            <Link to="/admin" className="flex items-center gap-2">
                                <img
                                    src="/brand/logo-circulo.png"
                                    alt="Mandala Crystais"
                                    width={160}
                                    height={160}
                                    className="h-8 w-8 rounded-full"
                                />
                                <span className="font-display italic text-sm text-mc-violet-950">Admin</span>
                            </Link>
                            {user && (
                                <span className="ml-auto text-xs text-mc-ink/50">
                                    {user.name}
                                </span>
                            )}
                        </header>

                        {/* page content */}
                        <main className="flex-1">
                            <Outlet />
                        </main>
                    </div>
                </div>
            </AdminRoute>
        </ProtectedRoute>
    );
}

