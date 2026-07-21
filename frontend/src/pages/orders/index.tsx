import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PackageSearch, ArrowLeft, ChevronRight } from "lucide-react";
import { AnnouncementBar } from "../../components/store/AnnouncementBar";
import { StoreHeader } from "../../components/store/StoreHeader";
import { StoreFooter } from "../../components/store/StoreFooter";
import { Loading } from "../../components/Loading";
import { Button } from "../../components/ui/button";
import { ProtectedRoute } from "../../components/ProtectedRoute";
import { formatPrice, formatDate } from "../../lib/utils-api";
import { api } from "../../services/api";
import type { Order, OrderStatus } from "../../types";

const STATUS_LABELS: Record<OrderStatus, string> = {
    PENDING: "Aguardando pagamento",
    PAID: "Pago",
    SHIPPED: "Enviado",
    DELIVERED: "Entregue",
    CANCELED: "Cancelado",
};

const STATUS_COLORS: Record<OrderStatus, string> = {
    PENDING: "bg-mc-gold-600/20 text-mc-gold-800 border-mc-gold-600/30",
    PAID: "bg-emerald-100 text-emerald-800 border-emerald-300",
    SHIPPED: "bg-sky-100 text-sky-800 border-sky-300",
    DELIVERED: "bg-mc-violet-950/10 text-mc-violet-950 border-mc-violet-950/20",
    CANCELED: "bg-red-100 text-red-800 border-red-300",
};

export function Orders() {
    const navigate = useNavigate();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchOrders = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await api.get<Order[]>("/orders");
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

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-mc-sand-50 flex flex-col">
                <AnnouncementBar />
                <StoreHeader />

                <main className="flex-1">
                    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
                        <button
                            onClick={() => navigate("/")}
                            className="flex items-center gap-1.5 text-sm text-mc-ink/60 hover:text-mc-violet-950 mb-8"
                        >
                            <ArrowLeft size={15} /> Voltar para a loja
                        </button>

                        <h1 className="font-display text-2xl sm:text-3xl text-mc-violet-950 mb-8">
                            Meus <span className="italic text-mc-gold-600">pedidos</span>
                        </h1>

                        {loading ? (
                            <div className="py-16 flex justify-center">
                                <Loading />
                            </div>
                        ) : orders.length === 0 ? (
                            <div className="text-center py-14 flex flex-col items-center gap-4">
                                <PackageSearch size={44} className="text-mc-violet-950/20" />
                                <p className="text-sm text-mc-ink/60 max-w-sm">
                                    Você ainda não tem nenhum pedido.
                                </p>
                                <Button
                                    onClick={() => navigate("/produtos")}
                                    className="bg-mc-violet-950 hover:bg-mc-violet-800 text-mc-sand-50 rounded-full mt-2"
                                >
                                    Explorar produtos
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {orders.map((order) => {
                                    const statusLabel = STATUS_LABELS[order.status];
                                    const statusColor = STATUS_COLORS[order.status];
                                    const itemCount = order.items?.length ?? 0;

                                    return (
                                        <button
                                            key={order.id}
                                            type="button"
                                            onClick={() => navigate(`/pedido/${order.id}`)}
                                            className="w-full text-left bg-white border border-mc-violet-950/10 rounded-lg p-4 sm:p-5 hover:border-mc-gold-600/40 hover:shadow-sm transition-all"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <span className="text-xs text-mc-ink/50">
                                                            {formatDate(order.createdAt)}
                                                        </span>
                                                        <span
                                                            className={`inline-block text-[11px] font-medium px-2.5 py-0.5 rounded-full border ${statusColor}`}
                                                        >
                                                            {statusLabel}
                                                        </span>
                                                    </div>
                                                    <div className="mt-2 flex items-baseline gap-2">
                                                        <span className="text-lg font-semibold text-mc-violet-950">
                                                            {formatPrice(order.total)}
                                                        </span>
                                                        <span className="text-xs text-mc-ink/50">
                                                            {itemCount}{" "}
                                                            {itemCount === 1 ? "item" : "itens"}
                                                        </span>
                                                    </div>
                                                </div>
                                                <ChevronRight
                                                    size={18}
                                                    className="text-mc-ink/30 mt-1 shrink-0"
                                                />
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </main>

                <StoreFooter />
            </div>
        </ProtectedRoute>
    );
}
