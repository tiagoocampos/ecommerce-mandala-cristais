import prismaClient from "../../prisma/index.js";
import { cancelOrderAndRestoreStock } from "./CancelOrderAndRestoreStockService.js";

// Margem para um pagamento aprovado no último minuto cujo webhook ainda não chegou
const GRACE_MS = 2 * 60 * 1000;
const BATCH_SIZE = 50;

// Cancela pedidos PENDING vencidos e devolve o estoque (via serviço idempotente, então
// não precisa de lock: rodar em duas instâncias ao mesmo tempo é seguro).
class ExpirePendingOrdersService {
    async execute() {
        let checked = 0;
        let canceled = 0;
        const failed: string[] = []; // ficam fora do resto da execução, para não travar os demais
        let batch: { id: string }[];

        do {
            batch = await prismaClient.order.findMany({
                where: {
                    status: "PENDING",
                    expires_at: { lt: new Date(Date.now() - GRACE_MS) },
                    ...(failed.length > 0 && { id: { notIn: failed } }),
                },
                select: { id: true },
                take: BATCH_SIZE,
            });

            for (const { id } of batch) {
                try {
                    const { restored } = await cancelOrderAndRestoreStock(id, { onlyPending: true });
                    if (restored) canceled++;
                } catch (error) {
                    failed.push(id);
                    console.error(`[expiração] Falha ao cancelar o pedido ${id}:`, error);
                    continue;
                }
            }
            checked += batch.length;
        } while (batch.length === BATCH_SIZE);

        if (canceled > 0) {
            console.log(`[expiração] ${canceled} pedido(s) pendente(s) expirado(s) cancelado(s); estoque devolvido.`);
        }
        return { checked, canceled };
    }
}

export { ExpirePendingOrdersService };
