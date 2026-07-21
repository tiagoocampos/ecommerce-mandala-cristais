import { useEffect, useState } from "react";
import { Package, AlertTriangle, ClipboardList, Clock } from "lucide-react";
import { Loading } from "../../components/Loading";
import { api } from "../../services/api";
import type { Product, Order } from "../../types";

interface DashboardData {
    totalProducts: number;
    lowStockCount: number;
    totalOrders: number;
    pendingOrders: number;
}

export function AdminDashboard() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        let mounted = true;
        async function fetchData() {
            setLoading(true);
            setError(false);
            try {
                const [productsRes, ordersRes] = await Promise.all([
                    api.get<Product[]>("/products?disabled=false"),
                    api.get<Order[]>("/admin/orders"),
                ]);
                if (!mounted) return;

                const products = productsRes.data;
                const orders = ordersRes.data;

                setData({
                    totalProducts: products.length,
                    lowStockCount: products.filter((p) => p.stock < 5).length,
                    totalOrders: orders.length,
                    pendingOrders: orders.filter((o) => o.status === "PENDING").length,
                });
            } catch {
                if (!mounted) return;
                setError(true);
            } finally {
                if (mounted) setLoading(false);
            }
        }
        fetchData();
        return () => {
            mounted = false;
        };
    }, []);

    if (loading) {
        return (
            <div className="p-6">
                <Loading />
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="p-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-800">
                    Erro ao carregar dados do dashboard.
                </div>
            </div>
        );
    }

    const cards = [
        {
            label: "Produtos ativos",
            value: data.totalProducts,
            icon: Package,
            color: "bg-mc-violet-950/10 text-mc-violet-950",
        },
        {
            label: "Estoque baixo (< 5)",
            value: data.lowStockCount,
            icon: AlertTriangle,
            color: data.lowStockCount > 0
                ? "bg-amber-100 text-amber-800"
                : "bg-emerald-100 text-emerald-800",
        },
        {
            label: "Total de pedidos",
            value: data.totalOrders,
            icon: ClipboardList,
            color: "bg-mc-blush-100 text-mc-violet-950",
        },
        {
            label: "Pedidos pendentes",
            value: data.pendingOrders,
            icon: Clock,
            color: data.pendingOrders > 0
                ? "bg-mc-gold-600/20 text-mc-gold-800"
                : "bg-emerald-100 text-emerald-800",
        },
    ];

    return (
        <div className="p-4 sm:p-6">
            <h1 className="font-display text-2xl sm:text-3xl text-mc-violet-950 mb-1">
                Dashboard
            </h1>
            <p className="text-sm text-mc-ink/60 mb-6">
                Visão geral da loja
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {cards.map((card) => (
                    <div
                        key={card.label}
                        className="bg-white border border-mc-violet-950/10 rounded-lg p-5"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs uppercase tracking-wide text-mc-ink/50 font-medium">
                                {card.label}
                            </span>
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${card.color}`}>
                                <card.icon size={16} />
                            </div>
                        </div>
                        <span className="text-2xl font-bold text-mc-violet-950">
                            {card.value}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

