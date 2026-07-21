import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { Loading } from "../../components/Loading";
import { formatPrice, formatDate } from "../../lib/utils-api";
import { api } from "../../services/api";
import type { OrderStatus } from "../../types";

// O admin order vem do backend com user e address incluídos
interface AdminOrderItemProduct {
    id: string;
    name: string;
    banner: string;
}

interface AdminOrderItem {
    id: string;
    quantity: number;
    unit_price: number;
    product: AdminOrderItemProduct;
}

interface AdminOrderUser {
    id: string;
    name: string;
    email: string;
}

interface AdminOrderAddress {
    city: string;
    state: string;
}

interface AdminOrder {
    id: string;
    status: OrderStatus;
    subtotal: number;
    discount: number;
    shipping_cost: number;
    total: number;
    user_id: string;
    address_id: string;
    createdAt: string;
    updatedAt: string;
    items: AdminOrderItem[];
    user: AdminOrderUser;
    address: AdminOrderAddress;
}

const STATUS_LABELS: Record<OrderStatus, string> = {
    PENDING: "Aguardando pagamento",
    PAID: "Pago",
    SHIPPED: "Enviado",
    DELIVERED: "Entregue",
    CANCELED: "Cancelado",
};

const STATUS_FILTERS: Array<{ label: string; value: OrderStatus | "ALL" }> = [
    { label: "Todos", value: "ALL" },
    { label: "Pendentes", value: "PENDING" },
    { label: "Pagos", value: "PAID" },
    { label: "Enviados", value: "SHIPPED" },
    { label: "Entregues", value: "DELIVERED" },
    { label: "Cancelados", value: "CANCELED" },
];

const STATUS_BADGE: Record<OrderStatus, string> = {
    PENDING: "bg-amber-100 text-amber-800 border-amber-300",
    PAID: "bg-sky-100 text-sky-800 border-sky-300",
    SHIPPED: "bg-purple-100 text-purple-800 border-purple-300",
    DELIVERED: "bg-emerald-100 text-emerald-800 border-emerald-300",
    CANCELED: "bg-red-100 text-red-800 border-red-300",
};

export function AdminOrders() {
    const navigate = useNavigate();
    const [orders, setOrders] = useState<AdminOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<OrderStatus | "ALL">("ALL");

    const fetchOrders = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await api.get<AdminOrder[]>("/admin/orders");
            setOrders(data);
        } catch {
            setOrders([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const filtered = filter === "ALL" ? orders : orders.filter((o) => o.status === filter);

    if (loading) {
        return (
            <div className="p-6">
                <Loading />
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6">
            <h1 className="font-display text-2xl sm:text-3xl text-mc-violet-950 mb-1">
                Pedidos
            </h1>
            <p className="text-sm text-mc-ink/60 mb-6">
                {orders.length} pedido(s) no total
            </p>

            {/* filter tabs */}
            <div className="flex flex-wrap gap-1 mb-4">
                {STATUS_FILTERS.map((f) => (
                    <button
                        key={f.value}
                        type="button"
                        onClick={() => setFilter(f.value)}
                        className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
                            filter === f.value
                                ? "bg-mc-violet-950 text-mc-sand-50 border-mc-violet-950"
                                : "bg-white text-mc-ink/60 border-mc-violet-950/10 hover:bg-mc-blush-100"
                        }`}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            <div className="overflow-x-auto rounded-lg border border-mc-violet-950/10">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-mc-blush-100 text-mc-violet-950 text-left">
                            <th className="py-3 px-4 font-medium">Cliente</th>
                            <th className="py-3 px-4 font-medium">Data</th>
                            <th className="py-3 px-4 font-medium">Status</th>
                            <th className="py-3 px-4 font-medium">Total</th>
                            <th className="py-3 px-4 font-medium">Itens</th>
                            <th className="py-3 px-4" />
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-mc-violet-950/10">
                        {filtered.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="py-10 text-center text-mc-ink/50">
                                    Nenhum pedido encontrado.
                                </td>
                            </tr>
                        ) : (
                            filtered.map((order) => {
                                const badgeColor = STATUS_BADGE[order.status];
                                return (
                                    <tr
                                        key={order.id}
                                        className="bg-white hover:bg-mc-sand-50/80 cursor-pointer"
                                        onClick={() => navigate(`/admin/pedidos/${order.id}`)}
                                    >
                                        <td className="py-3 px-4">
                                            <div className="text-mc-violet-950 font-medium">
                                                {order.user?.name || "—"}
                                            </div>
                                            <div className="text-xs text-mc-ink/50">
                                                {order.user?.email || "—"}
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-mc-ink/70 whitespace-nowrap">
                                            {formatDate(order.createdAt)}
                                        </td>
                                        <td className="py-3 px-4">
                                            <span
                                                className={`inline-block text-[11px] font-medium px-2.5 py-0.5 rounded-full border ${badgeColor}`}
                                            >
                                                {STATUS_LABELS[order.status]}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 font-medium text-mc-violet-950 whitespace-nowrap">
                                            {formatPrice(order.total)}
                                        </td>
                                        <td className="py-3 px-4 text-mc-ink/70">
                                            {order.items?.length ?? 0}
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            <ChevronRight
                                                size={16}
                                                className="text-mc-ink/30 inline"
                                            />
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

