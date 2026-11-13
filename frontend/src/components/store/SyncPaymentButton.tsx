import { useState } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { api } from "../../services/api";
import { showApiError } from "../../lib/utils-api";
import type { Order } from "../../types";

interface SyncPaymentButtonProps {
    orderId: string;
    /** recebe o pedido atualizado (já reconciliado com o Mercado Pago) */
    onSynced: (order: Order) => void;
    /** rota do backend; o admin usa /admin/orders/:id/sync-payment */
    admin?: boolean;
    label?: string;
    className?: string;
}

/** "Já paguei — verificar pagamento": confere o pagamento no Mercado Pago na hora. */
export function SyncPaymentButton({
    orderId,
    onSynced,
    admin = false,
    label = "Já paguei — verificar pagamento",
    className,
}: SyncPaymentButtonProps) {
    const [loading, setLoading] = useState(false);

    async function handleClick() {
        setLoading(true);
        try {
            const path = admin ? `/admin/orders/${orderId}/sync-payment` : `/order/${orderId}/sync-payment`;
            const { data } = await api.post<Order & { sync?: { outcome: string; manual_refund: boolean; message?: string } }>(path);
            onSynced(data);

            if (data.sync?.manual_refund) {
                toast.error(
                    admin
                        ? data.sync.message ?? "Reembolso manual necessário: confira o pagamento no Mercado Pago."
                        : "Identificamos seu pagamento, mas houve um problema com o pedido. Fale com a loja pelo WhatsApp.",
                    { duration: 10000 }
                );
            } else if (data.status !== "PENDING" && data.status !== "CANCELED") {
                toast.success("Pagamento confirmado!");
            } else if (data.status === "CANCELED") {
                toast.info("Este pedido está cancelado.");
            } else {
                toast.info("Ainda não identificamos o pagamento. Se você acabou de pagar, aguarde um instante e tente de novo.");
            }
        } catch (err) {
            showApiError(err, "Não foi possível verificar o pagamento agora.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClick}
            disabled={loading}
            className={className ?? "border-mc-violet-950/20 text-mc-violet-950"}
        >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
            {label}
        </Button>
    );
}
