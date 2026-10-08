import prismaClient from "../../prisma/index.js";
import { cancelOrderAndRestoreStock } from "./CancelOrderAndRestoreStockService.js";

// Margem para um pagamento aprovado no último minuto cujo webhook ainda não chegou
const GRACE_MS = 2 * 60 * 1000;
const INTERVAL_MS = 5 * 60 * 1000;

// Cancela pedidos PENDING vencidos e devolve o estoque (via serviço idempotente, então
// não precisa de lock: rodar em duas instâncias ao mesmo tempo é seguro).
class ExpirePendingOrdersService {
    async execute() {
        const overdue = await prismaClient.order.findMany({
            where: { status: "PENDING", expires_at: { lt: new Date(Date.now() - GRACE_MS) } },
            select: { id: true },
        });

        let canceled = 0;
        for (const { id } of overdue) {
            try {
                const { restored } = await cancelOrderAndRestoreStock(id);
                if (restored) canceled++;
            } catch (error) {
                // erro em um pedido não interrompe os demais
                console.error(`[expiração] Falha ao cancelar o pedido ${id}:`, error);
            }
        }

        if (canceled > 0) {
            console.log(`[expiração] ${canceled} pedido(s) pendente(s) expirado(s) cancelado(s); estoque devolvido.`);
        }
        return { checked: overdue.length, canceled };
    }
}

/** Roda uma vez na inicialização e depois a cada 5 minutos. */
export function startOrderExpirationJob() {
    const run = () =>
        new ExpirePendingOrdersService().execute().catch((error) => {
            console.error("[expiração] Falha no job de expiração de pedidos:", error);
        });

    void run();
    const timer = setInterval(run, INTERVAL_MS);
    timer.unref(); // não segura o processo aberto sozinho
    return timer;
}

export { ExpirePendingOrdersService };
