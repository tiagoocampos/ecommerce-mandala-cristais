import { useState } from "react";
import { toast } from "sonner";
import { ConfirmDelete } from "../ui/confirm-delete";
import { getApiErrorMessage } from "../../lib/utils-api";
import { api } from "../../services/api";
import type { Order } from "../../types";

interface CancelOrderButtonProps {
    orderId: string;
    /** pedido já cancelado, devolvido pelo backend */
    onCanceled: (order: Order) => void;
    /** cancelamento recusado (ex.: pagamento identificado): quem chama recarrega o pedido */
    onRejected?: () => void;
}

export function CancelOrderButton({ orderId, onCanceled, onRejected }: CancelOrderButtonProps) {
    const [canceling, setCanceling] = useState(false);

    async function cancel() {
        setCanceling(true);
        try {
            const { data } = await api.post<Order>(`/order/${orderId}/cancel`);
            toast.success("Pedido cancelado. Os produtos voltaram para a loja.");
            onCanceled(data);
        } catch (err) {
            toast.error(getApiErrorMessage(err, "Não foi possível cancelar o pedido."));
            onRejected?.();
        } finally {
            setCanceling(false);
        }
    }

    return (
        <ConfirmDelete
            title="Cancelar este pedido?"
            description="Os produtos voltam para a loja e esta ação não pode ser desfeita."
            confirmText="Sim, cancelar"
            cancelText="Manter pedido"
            onConfirm={cancel}
            disabled={canceling}
            trigger={
                <button
                    type="button"
                    disabled={canceling}
                    className="text-xs text-red-700 underline underline-offset-4 hover:text-red-800 disabled:opacity-50"
                >
                    {canceling ? "Cancelando..." : "Cancelar pedido"}
                </button>
            }
        />
    );
}
