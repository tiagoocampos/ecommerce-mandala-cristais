import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    PackageCheck,
    ArrowLeft,
    ShoppingBag,
    ChevronRight,
} from "lucide-react";
import { AnnouncementBar } from "../../components/store/AnnouncementBar";
import { StoreHeader } from "../../components/store/StoreHeader";
import { StoreFooter } from "../../components/store/StoreFooter";
import { Loading } from "../../components/Loading";
import { Button } from "../../components/ui/button";
import { ProtectedRoute } from "../../components/ProtectedRoute";
import { formatPrice, formatDate } from "../../lib/utils-api";
import { api } from "../../services/api";
import type { Order } from "../../types";
import { ProductImage } from "../../components/store/ProductImage";
import { OrderStatusBadge } from "../../components/OrderStatusBadge";

export function OrderDetail() {
    const { order_id } = useParams<{ order_id: string }>();
    const navigate = useNavigate();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        let mounted = true;
        async function fetchOrder() {
            setLoading(true);
            setNotFound(false);
            try {
                const { data } = await api.get<Order>(`/order/${order_id}`);
                if (!mounted) return;
                setOrder(data);
            } catch {
                if (!mounted) return;
                // Se o backend retornar 404, o axios joga no catch
                setNotFound(true);
                setOrder(null);
            } finally {
                if (mounted) setLoading(false);
            }
        }
        if (order_id) {
            fetchOrder();
        }
        return () => {
            mounted = false;
        };
    }, [order_id]);


    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-mc-sand-50 flex flex-col">
                <AnnouncementBar />
                <StoreHeader />

                <main className="flex-1">
                    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
                        <button
                            onClick={() => navigate("/pedidos")}
                            className="flex items-center gap-1.5 text-sm text-mc-ink/60 hover:text-mc-violet-950 mb-5"
                        >
                            <ArrowLeft size={15} /> Voltar para meus pedidos
                        </button>

                        {loading ? (
                            <div className="py-16 flex justify-center">
                                <Loading />
                            </div>
                        ) : notFound || !order ? (
                            <div className="text-center py-14 flex flex-col items-center gap-4">
                                <ShoppingBag size={44} className="text-mc-violet-950/20" />
                                <h1 className="font-display text-2xl text-mc-violet-950">
                                    Pedido não encontrado
                                </h1>
                                <p className="text-sm text-mc-ink/60 max-w-sm">
                                    O pedido que você está procurando não existe ou não
                                    pertence à sua conta.
                                </p>
                                <Button
                                    onClick={() => navigate("/pedidos")}
                                    className="bg-mc-violet-950 hover:bg-mc-violet-800 text-mc-sand-50 rounded-full"
                                >
                                    Ver meus pedidos
                                </Button>
                            </div>
                        ) : (
                            <>
                                {/* cabeçalho de confirmação */}
                                <div className="bg-mc-blush-100 border border-mc-violet-950/10 rounded-lg p-5 sm:p-6 mb-6">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-10 h-10 rounded-full bg-mc-success-100 flex items-center justify-center">
                                            <PackageCheck
                                                size={20}
                                                className="text-mc-success-700"
                                            />
                                        </div>
                                        <div>
                                            <h1 className="font-display text-xl text-mc-violet-950">
                                                Pedido confirmado!
                                            </h1>
                                            <p className="text-xs text-mc-ink/60">
                                                {order.id.slice(0, 8).toUpperCase()} —{" "}
                                                {formatDate(order.createdAt)}
                                            </p>
                                        </div>
                                    </div>
                                    <OrderStatusBadge status={order.status} size="md" />
                                </div>

                                {/* itens do pedido */}
                                <div className="bg-white border border-mc-violet-950/10 rounded-lg p-5 sm:p-6 mb-6">
                                    <h2 className="font-display text-lg text-mc-violet-950 mb-4">
                                        Itens do pedido
                                    </h2>
                                    <div className="space-y-3">
                                        {order.items.map((item) => {
                                            const unitPrice = item.unit_price;
                                            return (
                                                <div
                                                    key={item.id}
                                                    className="flex gap-3 items-center"
                                                >
                                                    <div className="w-14 h-14 rounded-md overflow-hidden bg-mc-blush-100 shrink-0">
                                                        <ProductImage src={item.product.banner} alt={item.product.name} iconSize={20} />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-mc-violet-950 line-clamp-1">
                                                            {item.product.name}
                                                        </p>
                                                        <p className="text-xs text-mc-ink/60">
                                                            Qtd: {item.quantity} ×{" "}
                                                            {formatPrice(unitPrice)}
                                                        </p>
                                                    </div>
                                                    <span className="text-sm font-medium text-mc-violet-950 whitespace-nowrap">
                                                        {formatPrice(unitPrice * item.quantity)}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* resumo financeiro */}
                                <div className="bg-mc-blush-100 border border-mc-violet-950/10 rounded-lg p-5 sm:p-6 mb-6">
                                    <h2 className="font-display text-lg text-mc-violet-950 mb-4">
                                        Resumo financeiro
                                    </h2>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between text-mc-ink/70">
                                            <span>Subtotal</span>
                                            <span>{formatPrice(order.subtotal)}</span>
                                        </div>
                                        {order.discount > 0 && (
                                            <div className="flex justify-between text-mc-success-700">
                                                <span>Desconto</span>
                                                <span>-{formatPrice(order.discount)}</span>
                                            </div>
                                        )}
                                        {order.shipping_cost > 0 && (
                                            <div className="flex justify-between text-mc-ink/70">
                                                <span>Frete</span>
                                                <span>{formatPrice(order.shipping_cost)}</span>
                                            </div>
                                        )}
                                        <div className="border-t border-mc-violet-950/10 pt-2 flex justify-between font-semibold text-mc-violet-950">
                                            <span>Total</span>
                                            <span>{formatPrice(order.total)}</span>
                                        </div>
                                    </div>
                                </div>
                               
                                {order.status === "PENDING" && (
                                    <div className="bg-mc-blush-100 border border-mc-violet-950/10 rounded-lg p-5 sm:p-6 mb-6 flex flex-col sm:flex-row items-center justify-between gap-3">
                                        <p className="text-sm text-mc-ink/70 text-center sm:text-left">
                                            Este pedido ainda aguarda pagamento.
                                        </p>
                                        <Button
                                            onClick={() => navigate(`/payment/${order.id}`)}
                                            className="bg-mc-gold-500 hover:bg-mc-gold-600 text-mc-violet-950 rounded-full px-6 h-10 font-semibold"
                                        >
                                            Ir para o pagamento
                                        </Button>
                                    </div>
                                )}

                                {/* botão para listagem */}
                                <div className="text-center">
                                    <Button
                                        onClick={() => navigate("/pedidos")}
                                        variant="ghost"
                                        className="text-mc-violet-950 hover:bg-mc-blush-100"
                                    >
                                        Ver todos os meus pedidos
                                        <ChevronRight size={15} />
                                    </Button>
                                </div>
                            </>
                        )}

                        

                    </div>

                    
                </main>

                <StoreFooter />
            </div>
        </ProtectedRoute>
    );
}

