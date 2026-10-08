import { useNavigate } from "react-router-dom";
import { Clock, CreditCard } from "lucide-react";
import { Button } from "../ui/button";
import { cn } from "../../lib/utils";
import type { orderPaymentState } from "../../lib/orderPayment";
import type { OrderStatus } from "../../types";

interface OrderPaymentStripProps {
    order: { id: string; status: OrderStatus };
    state: ReturnType<typeof orderPaymentState>;
    compact?: boolean;
}

// Faixa abaixo do pedido: "Pagar agora" para pendente dentro do prazo; aviso para
// pendente vencido ou cancelado. Nada para pedidos pagos/enviados/entregues.
export function OrderPaymentStrip({ order, state, compact = false }: OrderPaymentStripProps) {
    const navigate = useNavigate();

    if (state.payable) {
        return (
            <div
                className={cn(
                    "flex flex-wrap items-center justify-between gap-2 border-t border-mc-gold-500/40 bg-mc-gold-500/10",
                    compact ? "px-4 py-2.5 sm:px-5" : "rounded-lg border p-4"
                )}
            >
                <span className="flex items-center gap-1.5 text-xs text-mc-gold-800">
                    <Clock size={13} aria-hidden="true" />
                    Aguardando pagamento · {state.reservedUntil}
                </span>
                <Button
                    size="sm"
                    onClick={() => navigate(`/payment/${order.id}`)}
                    className="rounded-full bg-mc-gold-500 hover:bg-mc-gold-600 text-mc-violet-950 font-semibold px-4"
                >
                    <CreditCard size={14} /> Pagar agora
                </Button>
            </div>
        );
    }

    if (state.expired || order.status === "CANCELED") {
        return (
            <p
                className={cn(
                    "border-t border-mc-violet-950/10 bg-mc-sand-50 text-xs text-mc-ink/60",
                    compact ? "px-4 py-2 sm:px-5" : "rounded-lg border p-3"
                )}
            >
                {state.expired
                    ? "O prazo para pagar este pedido expirou e os itens voltaram para a loja."
                    : "Pedido cancelado ou expirado."}
            </p>
        );
    }

    return null;
}
