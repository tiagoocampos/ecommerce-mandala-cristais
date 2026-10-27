import prismaClient from "../../prisma/index.js";

// Único caminho que devolve estoque de um pedido (job de expiração, admin, webhook).
// Idempotente: só devolve se ESTA chamada foi a que mudou o status para CANCELED —
// webhook duplicado, job rodando duas vezes ou duas instâncias do servidor nunca
// devolvem o mesmo estoque duas vezes. Pedidos SHIPPED/DELIVERED nunca são cancelados aqui.
//
// Cancelar um pedido PAID devolve o estoque (a peça não saiu), mas NÃO faz reembolso:
// o estorno é manual, no painel do Mercado Pago.
//
// onlyPending: true é o modo da expiração (job, abrir pagamento): só cancela PENDING, para que um
// pedido pago no mesmo instante (ex.: Pix aprovado) jamais seja cancelado nem perca o estoque.
export async function cancelOrderAndRestoreStock(
    order_id: string,
    { onlyPending = false }: { onlyPending?: boolean } = {}
): Promise<{ restored: boolean }> {
    return prismaClient.$transaction(async (tx) => {
        const changed = await tx.order.updateMany({
            where: { id: order_id, status: { in: onlyPending ? ["PENDING"] : ["PENDING", "PAID"] } },
            data: { status: "CANCELED" },
        });

        if (changed.count === 0) {
            return { restored: false }; // já cancelado, enviado, entregue ou inexistente
        }

        const items = await tx.orderItem.findMany({ where: { order_id } });
        for (const item of items) {
            await tx.product.update({
                where: { id: item.product_id },
                data: { stock: { increment: item.quantity } },
            });
        }

        return { restored: true };
    });
}
