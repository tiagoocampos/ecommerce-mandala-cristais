import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PackageSearch, ArrowLeft, ChevronRight } from "lucide-react";
import { AnnouncementBar } from "../../components/store/AnnouncementBar";
import { StoreHeader } from "../../components/store/StoreHeader";
import { StoreFooter } from "../../components/store/StoreFooter";
import { EmptyState } from "../../components/store/EmptyState";
import { ProtectedRoute } from "../../components/ProtectedRoute";
import { formatPrice, formatDate } from "../../lib/utils-api";
import { api } from "../../services/api";
import type { Order } from "../../types";
import { OrderPaymentStrip } from "../../components/store/OrderPaymentStrip";
import { orderPaymentState } from "../../lib/orderPayment";
import { OrderStatusBadge } from "../../components/OrderStatusBadge";

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
                            Meus <span className="italic text-mc-gold-700">pedidos</span>
                        </h1>

                        {loading ? (
                            <div className="space-y-3" role="status" aria-label="Carregando pedidos">
                                {Array.from({ length: 3 }).map((_, i) => (
                                    <div key={i} className="h-24 rounded-lg bg-mc-blush-100 animate-pulse" />
                                ))}
                            </div>
                        ) : orders.length === 0 ? (
                            <EmptyState
                                icon={PackageSearch}
                                title="Você ainda não tem pedidos"
                                description="Quando você finalizar uma compra, ela aparece aqui para acompanhar."
                                actionLabel="Ver produtos"
                                onAction={() => navigate("/produtos")}
                            />
                        ) : (
                            <div className="space-y-3">
                                {orders.map((order) => {
                                    const itemCount = order.items?.length ?? 0;
                                    const payment = orderPaymentState(order);

                                    return (
                                        <div
                                            key={order.id}
                                            className="bg-white border border-mc-violet-950/10 rounded-lg overflow-hidden hover:border-mc-gold-600/40 hover:shadow-sm transition-all"
                                        >
                                        <button
                                            type="button"
                                            onClick={() => navigate(`/pedido/${order.id}`)}
                                            className="w-full text-left p-4 sm:p-5"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <span className="text-xs text-mc-ink/50">
                                                            {formatDate(order.createdAt)}
                                                        </span>
                                                        <OrderStatusBadge status={order.status} />
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
                                        <OrderPaymentStrip order={order} state={payment} compact />
                                        </div>
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
