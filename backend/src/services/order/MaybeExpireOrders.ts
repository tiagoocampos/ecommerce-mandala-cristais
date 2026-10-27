import { ExpirePendingOrdersService } from "./ExpirePendingOrdersService.js";

const MIN_JOB_MINUTES = 15;

function minutesFromEnv(name: string, fallback: number): number {
    const value = Number(process.env[name]);
    return Number.isFinite(value) && value > 0 ? value : fallback;
}

let lastRun = 0; // horário (ms) da última tentativa, com sucesso ou não
let running = false;

/**
 * Verificação "oportunista": chamada SEM await nos pontos em que o banco já vai ser
 * consultado de qualquer jeito, para não precisar de um relógio que o mantenha acordado.
 * Nunca lança erro, nunca atrasa a resposta e roda no máximo uma vez por janela de throttle
 * (inclusive após falha, para não inundar o log quando o banco estiver fora/sem cota).
 */
export function maybeExpireOrders(): void {
    const throttleMs = minutesFromEnv("ORDER_EXPIRATION_CHECK_THROTTLE_MINUTES", 10) * 60 * 1000;
    if (running || Date.now() - lastRun < throttleMs) return;

    running = true;
    lastRun = Date.now();
    new ExpirePendingOrdersService()
        .execute()
        .catch((error) => {
            console.error("[expiração] Falha na verificação de pedidos vencidos:", error instanceof Error ? error.message : error);
        })
        .finally(() => {
            running = false;
        });
}

/** Rede de segurança opcional (ORDER_EXPIRATION_JOB_ENABLED=true). Sem execução ao subir. */
export function startOrderExpirationJob() {
    if (process.env.ORDER_EXPIRATION_JOB_ENABLED !== "true") return null;

    let minutes = minutesFromEnv("ORDER_EXPIRATION_JOB_MINUTES", 60);
    if (minutes < MIN_JOB_MINUTES) {
        console.warn(`[expiração] ORDER_EXPIRATION_JOB_MINUTES=${minutes} é menor que o mínimo; usando ${MIN_JOB_MINUTES}.`);
        minutes = MIN_JOB_MINUTES;
    }

    const timer = setInterval(maybeExpireOrders, minutes * 60 * 1000);
    timer.unref(); // não segura o processo aberto sozinho
    console.log(`[expiração] Job periódico ativo a cada ${minutes} min.`);
    return timer;
}
