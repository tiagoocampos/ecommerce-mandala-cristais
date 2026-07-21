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
    total: number;
    user_id: string;
    address_id: string;
    createdAt: string;
    updatedAt: string;
    items: AdminDetailItem[];
    user: AdminDetailUser;
    address: AdminDetailAddress;
}

const STATUS_LABELS: Record<OrderStatus, string> = {
    PENDING: "Aguardando pagamento",
    PAID: "Pago",
    SHIPPED: "Enviado",
    DELIVERED: "Entregue",
    CANCELED: "Cancelado",
};

const STATUS_COLORS: Record<OrderStatus, string> = {
    PENDING: "bg-amber-100 text-amber-800 border-amber-300",
    PAID: "bg-sky-100 text-sky-800 border-sky-300",
    SHIPPED: "bg-purple-100 text-purple-800 border-purple-300",
    DELIVERED: "bg-emerald-100 text-emerald-800 border-emerald-300",
    CANCELED: "bg-red-100 text-red-800 border-red-300",
};

const STATUS_OPTIONS: OrderStatus[] = [
    "PENDING",
    "PAID",
    "SHIPPED",
    "DELIVERED",
    "CANCELED",
];

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
            await api.patch(`/order/${order.id}/status`, { status: selectedStatus });
            toast.success(`Status atualizado para "${STATUS_LABELS[selectedStatus]}"`);
            setOrder((prev) =>
                prev ? { ...prev, status: selectedStatus } : prev
            );
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

    const badgeColor = STATUS_COLORS[order.status];

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
                            <span
                                className={`inline-block text-xs font-medium px-3 py-1 rounded-full border shrink-0 ${badgeColor}`}
                            >
                                {STATUS_LABELS[order.status]}
                            </span>
                        </div>
                    </div>

                    {/* customer info */}
                    <div className="bg-white border border-mc-violet-950/10 rounded-lg p-5">
                        <h2 className="font-display text-lg text-mc-violet-950 mb-4 flex items-center gap-2">
                            <User size={16} className="text-mc-gold-600" />
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
                            <MapPin size={16} className="text-mc-gold-600" />
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
                                        {item.product.banner ? (
                                            <img
                                                src={item.product.banner}
                                                alt={item.product.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-lg">
                                                💎
                                            </div>
                                        )}
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
                                <div className="flex justify-between text-emerald-700">
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

                    {/* status update */}
                    <div className="bg-white border border-mc-violet-950/10 rounded-lg p-5">
                        <h2 className="font-display text-lg text-mc-violet-950 mb-4">
                            Atualizar status
                        </h2>
                        <p className="text-xs text-mc-ink/60 mb-3">
                            Status atual:{" "}
                            <span className="font-medium text-mc-violet-950">
                                {STATUS_LABELS[order.status]}
                            </span>
                        </p>
                        <select
                            value={selectedStatus || order.status}
                            onChange={(e) =>
                                setSelectedStatus(e.target.value as OrderStatus)
                            }
                            className="w-full rounded-lg border border-mc-violet-950/15 bg-white px-3 py-2 text-sm outline-none focus:border-mc-violet-950/30 mb-3"
                        >
                            {STATUS_OPTIONS.map((s) => (
                                <option key={s} value={s}>
                                    {STATUS_LABELS[s]}
                                </option>
                            ))}
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
                                        <strong>{STATUS_LABELS[order.status]}</strong> para{" "}
                                        <strong>
                                            {STATUS_LABELS[selectedStatus || order.status]}
                                        </strong>
                                        . O cliente final verá essa mudança.
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
                    </div>
                </div>
            </div>
        </div>
    );
}

