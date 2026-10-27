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
        let batch: { id: string }[];

        do {
            batch = await prismaClient.order.findMany({
                where: { status: "PENDING", expires_at: { lt: new Date(Date.now() - GRACE_MS) } },
                select: { id: true },
                take: BATCH_SIZE,
            });

            let failed = 0;
            for (const { id } of batch) {
                try {
                    const { restored } = await cancelOrderAndRestoreStock(id);
                    if (restored) canceled++;
                } catch (error) {
                    // erro em um pedido não interrompe os demais
                    failed++;
                    console.error(`[expiração] Falha ao cancelar o pedido ${id}:`, error);
                }
            }
            checked += batch.length;

            // Repete só se o lote veio cheio; com falhas pararia de avançar, então encerra
            if (failed > 0) break;
        } while (batch.length === BATCH_SIZE);

        if (canceled > 0) {
            console.log(`[expiração] ${canceled} pedido(s) pendente(s) expirado(s) cancelado(s); estoque devolvido.`);
        }
        return { checked, canceled };
    }
}

export { ExpirePendingOrdersService };
