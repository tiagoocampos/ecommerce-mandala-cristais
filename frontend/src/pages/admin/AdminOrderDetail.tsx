import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, MapPin, User } from "lucide-react";
import { Loading } from "../../components/Loading";
import { Button } from "../../components/ui/button";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "../../components/ui/alert-dialog";
import { formatPrice, formatDate, showApiError } from "../../lib/utils-api";
import { api } from "../../services/api";
import type { OrderStatus } from "../../types";
import { ProductImage } from "../../components/store/ProductImage";
import { OrderStatusBadge } from "../../components/OrderStatusBadge";
import { ORDER_STATUS_LABELS } from "../../lib/order-status";

// Interfaces específicas do admin detail
interface AdminDetailUser {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
}

interface AdminDetailAddress {
    id: string;
    street: string;
    number: string;
    complement?: string | null;
    neighborhood: string;
    city: string;
    state: string;
    zip_code: string;
}

interface AdminDetailItemProduct {
    id: string;
    name: string;
    banner: string;
}

interface AdminDetailItem {
    id: string;
    quantity: number;
    unit_price: number;
    product: AdminDetailItemProduct;
}

interface AdminDetailOrder {
    id: string;
    status: OrderStatus;
    subtotal: number;
    discount: number;
    shipping_cost: number;
    shipping_service?: string | null;
    shipping_delivery_days?: number | null;
    shipping_cost_estimated?: boolean;
    total: number;
    user_id: string;
    address_id: string;
    createdAt: string;
    updatedAt: string;
    items: AdminDetailItem[];
    user: AdminDetailUser;
    address: AdminDetailAddress;
}

// Mesmas regras do backend (UpdateOrderStatusService.ALLOWED_TRANSITIONS).
// CANCELED e DELIVERED são finais.
const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
    PENDING: ["PAID", "CANCELED"],
    PAID: ["SHIPPED", "CANCELED"],
    SHIPPED: ["DELIVERED"],
    DELIVERED: [],
    CANCELED: [],
};

export function AdminOrderDetail() {
    const { order_id } = useParams<{ order_id: string }>();
    const navigate = useNavigate();
    const [order, setOrder] = useState<AdminDetailOrder | null>(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [updatingStatus, setUpdatingStatus] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState<OrderStatus | null>(null);
    const [confirmOpen, setConfirmOpen] = useState(false);

    useEffect(() => {
        let mounted = true;
        async function fetchOrder() {
            setLoading(true);
            setNotFound(false);
            try {
                const { data } = await api.get<AdminDetailOrder>(
                    `/admin/orders/${order_id}`
                );
                if (!mounted) return;
                setOrder(data);
            } catch {
                if (!mounted) return;
                setNotFound(true);
            } finally {
                if (mounted) setLoading(false);
            }
        }
        if (order_id) fetchOrder();
        return () => {
            mounted = false;
        };
    }, [order_id]);

    async function handleUpdateStatus() {
        if (!order || !selectedStatus || selectedStatus === order.status) return;
        setUpdatingStatus(true);
        try {
            const { data } = await api.patch<{ notice?: string }>(`/order/${order.id}/status`, {
                status: selectedStatus,
            });
            toast.success(`Status atualizado para "${ORDER_STATUS_LABELS[selectedStatus]}"`);
            // cancelamento de pedido pago: lembrete do reembolso manual
            if (data?.notice) toast.warning(data.notice, { duration: 10000 });
            setOrder((prev) =>
                prev ? { ...prev, status: selectedStatus } : prev
            );
            setSelectedStatus(null);
        } catch (error) {
            showApiError(error, "Erro ao atualizar status");
        } finally {
            setUpdatingStatus(false);
            setConfirmOpen(false);
        }
    }

    if (loading) {
        return (
            <div className="p-6">
                <Loading />
            </div>
        );
    }

    if (notFound || !order) {
        return (
            <div className="p-6">
                <div className="text-center py-14">
                    <h1 className="font-display text-2xl text-mc-violet-950 mb-2">
                        Pedido não encontrado
                    </h1>
                    <p className="text-sm text-mc-ink/60 mb-4">
                        O pedido que você está procurando não existe.
                    </p>
                    <Button
                        onClick={() => navigate("/admin/pedidos")}
                        className="bg-mc-violet-950 hover:bg-mc-violet-800 text-mc-sand-50 rounded-full"
                    >
                        Voltar para pedidos
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6">
            {/* back */}
            <button
                onClick={() => navigate("/admin/pedidos")}
                className="flex items-center gap-1.5 text-sm text-mc-ink/60 hover:text-mc-violet-950 mb-5"
            >
                <ArrowLeft size={15} /> Voltar para pedidos
            </button>

            <div className="grid lg:grid-cols-[1fr_380px] gap-6 items-start">
                {/* left column */}
                <div className="space-y-6">
                    {/* header */}
                    <div className="bg-white border border-mc-violet-950/10 rounded-lg p-5">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h1 className="font-display text-xl text-mc-violet-950">
                                    Pedido #{order.id.slice(0, 8).toUpperCase()}
                                </h1>
                                <p className="text-xs text-mc-ink/60 mt-1">
                                    {formatDate(order.createdAt)}
                                </p>
                            </div>
                            <OrderStatusBadge status={order.status} size="md" />
                        </div>
                    </div>

                    {/* customer info */}
                    <div className="bg-white border border-mc-violet-950/10 rounded-lg p-5">
                        <h2 className="font-display text-lg text-mc-violet-950 mb-4 flex items-center gap-2">
                            <User size={16} className="text-mc-gold-700" />
                            Cliente
                        </h2>
                        <div className="space-y-1 text-sm">
                            <p className="text-mc-violet-950 font-medium">
                                {order.user.name}
                            </p>
                            <p className="text-mc-ink/70">{order.user.email}</p>
                            {order.user.phone && (
                                <p className="text-mc-ink/70">{order.user.phone}</p>
                            )}
                        </div>
                    </div>

                    {/* address */}
                    <div className="bg-white border border-mc-violet-950/10 rounded-lg p-5">
                        <h2 className="font-display text-lg text-mc-violet-950 mb-4 flex items-center gap-2">
                            <MapPin size={16} className="text-mc-gold-700" />
                            Endereço de entrega
                        </h2>
                        <div className="text-sm space-y-1">
                            <p className="text-mc-violet-950 font-medium">
                                {order.address.street}, {order.address.number}
                            </p>
                            {order.address.complement && (
                                <p className="text-mc-ink/70">
                                    {order.address.complement}
                                </p>
                            )}
                            <p className="text-mc-ink/70">
                                {order.address.neighborhood}
                            </p>
                            <p className="text-mc-ink/70">
                                {order.address.city} — {order.address.state}
                            </p>
                            <p className="text-mc-ink/70">{order.address.zip_code}</p>
                        </div>
                    </div>

                    {/* items */}
                    <div className="bg-white border border-mc-violet-950/10 rounded-lg p-5">
                        <h2 className="font-display text-lg text-mc-violet-950 mb-4">
                            Itens do pedido
                        </h2>
                        <div className="divide-y divide-mc-violet-950/10">
                            {order.items.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                                >
                                    <div className="w-12 h-12 rounded-md overflow-hidden bg-mc-blush-100 shrink-0">
                                        <ProductImage src={item.product.banner} alt={item.product.name} iconSize={18} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-mc-violet-950 line-clamp-1">
                                            {item.product.name}
                                        </p>
                                        <p className="text-xs text-mc-ink/60">
                                            Qtd: {item.quantity} ×{" "}
                                            {formatPrice(item.unit_price)}
                                        </p>
                                    </div>
                                    <span className="text-sm font-medium text-mc-violet-950 whitespace-nowrap">
                                        {formatPrice(item.unit_price * item.quantity)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* right column */}
                <div className="space-y-6 lg:sticky lg:top-6">
                    {/* financial summary */}
                    <div className="bg-mc-blush-100 border border-mc-violet-950/10 rounded-lg p-5">
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
                            {(order.shipping_cost > 0 || order.shipping_service) && (
                                <div className="flex justify-between text-mc-ink/70">
                                    <span>
                                        Frete
                                        {order.shipping_service &&
                                            ` (${[
                                                order.shipping_service,
                                                order.shipping_delivery_days &&
                                                    `até ${order.shipping_delivery_days} dias úteis`,
                                            ]
                                                .filter(Boolean)
                                                .join(" · ")})`}
                                    </span>
                                    <span>{formatPrice(order.shipping_cost)}</span>
                                </div>
                            )}
                            {order.shipping_cost_estimated && (
                                <p className="rounded-md border border-mc-gold-500/50 bg-mc-gold-500/15 px-2.5 py-1.5 text-xs text-mc-gold-800">
                                    ⚠ Frete estimado: o Melhor Envio estava fora do ar quando o pedido
                                    foi feito, e foi usado o valor que o cliente viu na tela. Confira o
                                    frete real antes de enviar.
                                </p>
                            )}
                            <div className="border-t border-mc-violet-950/10 pt-2 flex justify-between font-semibold text-mc-violet-950">
                                <span>Total</span>
                                <span>{formatPrice(order.total)}</span>
                            </div>
                        </div>
                    </div>

                    {/* status update */}
                    <div className="bg-white border border-mc-violet-950/10 rounded-lg p-5">
                        <h2 className="font-display text-lg text-mc-violet-950 mb-4">
                            Atualizar status
                        </h2>
                        <p className="text-xs text-mc-ink/60 mb-3">
                            Status atual:{" "}
                            <OrderStatusBadge status={order.status} className="ml-1 align-middle" />
                        </p>
                        {ALLOWED_TRANSITIONS[order.status].length === 0 ? (
                            <p className="text-sm text-mc-ink/60">
                                {order.status === "CANCELED"
                                    ? "Pedido cancelado: o estoque dos itens já voltou para a loja. Este status é final."
                                    : "Pedido entregue: este status é final."}
                            </p>
                        ) : (
                        <>
                        <select
                            value={selectedStatus || order.status}
                            onChange={(e) =>
                                setSelectedStatus(e.target.value as OrderStatus)
                            }
                            className="w-full rounded-lg border border-mc-violet-950/15 bg-white px-3 py-2 text-sm outline-none focus:border-mc-violet-950/30 mb-3"
                        >
                            <option value={order.status}>
                                {ORDER_STATUS_LABELS[order.status]} (atual)
                            </option>
                            {(["PENDING", "PAID", "SHIPPED", "DELIVERED", "CANCELED"] as OrderStatus[])
                                .filter((s) => s !== order.status)
                                .map((s) => {
                                    const allowed = ALLOWED_TRANSITIONS[order.status].includes(s);
                                    return (
                                        <option key={s} value={s} disabled={!allowed}>
                                            {ORDER_STATUS_LABELS[s]}
                                            {allowed ? "" : " (não permitido)"}
                                        </option>
                                    );
                                })}
                        </select>

                        <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                            <AlertDialogTrigger asChild>
                                <Button
                                    disabled={
                                        !selectedStatus ||
                                        selectedStatus === order.status ||
                                        updatingStatus
                                    }
                                    className="w-full bg-mc-violet-950 hover:bg-mc-violet-800 text-mc-sand-50 rounded-full"
                                >
                                    {updatingStatus ? "Atualizando..." : "Atualizar status"}
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>
                                        Alterar status do pedido?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                        O status será alterado de{" "}
                                        <strong>{ORDER_STATUS_LABELS[order.status]}</strong> para{" "}
                                        <strong>
                                            {ORDER_STATUS_LABELS[selectedStatus || order.status]}
                                        </strong>
                                        . O cliente final verá essa mudança.
                                        {selectedStatus === "CANCELED" && (
                                            <span className="mt-3 block rounded-md border border-mc-gold-500/50 bg-mc-gold-500/15 p-2.5 text-mc-gold-800">
                                                O estoque dos itens volta automaticamente. Se o pedido já foi
                                                pago, o reembolso precisa ser feito manualmente no Mercado Pago.
                                            </span>
                                        )}
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel disabled={updatingStatus}>
                                        Cancelar
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                        disabled={updatingStatus}
                                        onClick={handleUpdateStatus}
                                        className="bg-mc-violet-950 hover:bg-mc-violet-800 text-mc-sand-50"
                                    >
                                        {updatingStatus
                                            ? "Atualizando..."
                                            : "Confirmar alteração"}
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                        </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

