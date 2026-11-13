// Recuperação de pagamentos aprovados no Mercado Pago que não chegaram ao pedido.
//
//   npx tsx scripts/reconcile-payments.ts [--days 14]            -> SIMULA (não grava nada)
//   npx tsx scripts/reconcile-payments.ts [--days 14] --apply    -> grava
//
// Usa o DATABASE_URL e o MERCADOPAGO_ACCESS_TOKEN do ambiente (.env). Rodar contra produção
// só com autorização do dono do projeto.
import "dotenv/config";
import prismaClient from "../src/prisma/index.js";
import { reconcileOrderPayment } from "../src/services/payment/reconcileOrderPayment.js";

function parseArgs(argv: string[]) {
    const apply = argv.includes("--apply");
    const index = argv.indexOf("--days");
    const days = index >= 0 ? Number(argv[index + 1]) : 14;
    if (!Number.isFinite(days) || days <= 0) {
        throw new Error("--days precisa ser um número positivo");
    }
    return { apply, days };
}

function maskEmail(email: string): string {
    const [user = "", domain = ""] = email.split("@");
    return `${user.slice(0, 2)}***@${domain}`;
}

async function main() {
    const { apply, days } = parseArgs(process.argv.slice(2));
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    console.log(`Modo: ${apply ? "APLICAR (grava no banco)" : "SIMULAÇÃO (nada é gravado)"} | pedidos dos últimos ${days} dia(s)`);

    const orders = await prismaClient.order.findMany({
        where: {
            createdAt: { gte: since },
            status: { in: ["PENDING", "CANCELED"] },
            OR: [{ payment: { is: null } }, { payment: { is: { status: { not: "APPROVED" } } } }],
        },
        orderBy: { createdAt: "asc" },
        select: { id: true, status: true, user: { select: { email: true } } },
    });
    console.log(`${orders.length} pedido(s) PENDING/CANCELED sem pagamento aprovado.\n`);

    const rows: Record<string, string>[] = [];
    const manualRefunds: string[] = [];

    for (const order of orders) {
        try {
            const result = await reconcileOrderPayment(order.id, { dryRun: !apply });
            if (result.outcome === "no_mp_payment") continue; // nunca foi pago: nada a recuperar
            rows.push({
                pedido: order.id.slice(0, 8),
                cliente: maskEmail(order.user.email),
                antes: result.order_status_before ?? "-",
                depois: result.order_status_after ?? "-",
                mp_pagamento: String(result.mp_payment_id),
                mp_status: result.mp_status,
                resultado: result.outcome,
            });
            if (result.manual_refund) {
                manualRefunds.push(`${order.id} (pagamento MP ${result.mp_payment_id}): ${result.message}`);
            }
        } catch (error) {
            rows.push({
                pedido: order.id.slice(0, 8),
                cliente: maskEmail(order.user.email),
                antes: order.status,
                depois: "?",
                mp_pagamento: "-",
                mp_status: "-",
                resultado: `ERRO: ${error instanceof Error ? error.message : "falha"}`,
            });
        }
        await new Promise((resolve) => setTimeout(resolve, 200)); // respeita o limite da API
    }

    if (rows.length) console.table(rows);
    else console.log("Nenhum pedido com pagamento no Mercado Pago para recuperar.");

    if (manualRefunds.length) {
        console.log("\nREEMBOLSO MANUAL NECESSÁRIO (estorne no painel do Mercado Pago):");
        manualRefunds.forEach((line) => console.log(` - ${line}`));
    }
    if (!apply) console.log("\nSimulação: rode de novo com --apply para gravar.");
}

main()
    .catch((error) => {
        console.error("Falha:", error instanceof Error ? error.message : error);
        process.exitCode = 1;
    })
    .finally(() => prismaClient.$disconnect());
