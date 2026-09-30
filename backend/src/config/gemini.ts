// Cliente da API Gemini (Google AI Studio) — https://ai.google.dev/gemini-api/docs
// Chave gratuita em https://aistudio.google.com/apikey. Limites do plano gratuito
// variam por conta/modelo e aparecem em https://aistudio.google.com/rate-limit.

import { AIAssistUnavailableError } from "../exceptions/AIErrors.js";

const BASE_URL = "https://generativelanguage.googleapis.com/v1beta";
const REQUEST_TIMEOUT_MS = 30_000;

// Modelo principal + alternativos. Quando um modelo está sobrecarregado no Google (503,
// "high demand") ou estourou a cota gratuita dele (429), tentamos o próximo da lista.
function models(): string[] {
    const primary = process.env.GEMINI_MODEL || "gemini-3.8-flash";
    const fallbacks = (process.env.GEMINI_FALLBACK_MODELS ?? "gemini-3.5-flash")
        .split(",")
        .map((m) => m.trim())
        .filter(Boolean);
    return [...new Set([primary, ...fallbacks])];
}

type JsonSchema = Record<string, unknown>;

// Resposta da Interactions API. O texto gerado fica nos passos de saída do modelo;
// aceitamos também os atalhos documentados para não depender de um único formato.
type InteractionResponse = {
    status?: string;
    output_text?: string;
    steps?: { type?: string; content?: { type?: string; text?: string }[] }[];
    outputs?: { type?: string; text?: string }[];
};

function extractText(data: InteractionResponse): string | null {
    if (typeof data.output_text === "string" && data.output_text.trim()) return data.output_text;

    const fromSteps = (data.steps ?? [])
        .filter((step) => !step.type || step.type === "model_output")
        .flatMap((step) => step.content ?? [])
        .filter((part) => part.type === "text" && typeof part.text === "string")
        .map((part) => part.text)
        .join("");
    if (fromSteps.trim()) return fromSteps;

    const fromOutputs = (data.outputs ?? [])
        .filter((part) => part.type === "text" && typeof part.text === "string")
        .map((part) => part.text)
        .join("");
    return fromOutputs.trim() ? fromOutputs : null;
}

type Attempt =
    | { ok: true; text: string }
    | { ok: false; retryable: boolean; error: AIAssistUnavailableError };

async function callModel(model: string, apiKey: string, prompt: string, schema: JsonSchema): Promise<Attempt> {
    let response: Response;
    try {
        response = await fetch(`${BASE_URL}/interactions`, {
            method: "POST",
            headers: { "x-goog-api-key": apiKey, "Content-Type": "application/json" },
            body: JSON.stringify({
                model,
                input: prompt,
                response_format: { type: "text", mime_type: "application/json", schema },
            }),
            signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        });
    } catch (error) {
        console.error(`[gemini] ${model}: falha de rede/timeout:`, error);
        return { ok: false, retryable: true, error: new AIAssistUnavailableError() };
    }

    if (!response.ok) {
        const body = await response.text().catch(() => "");
        console.error(`[gemini] ${model} respondeu ${response.status}: ${body.slice(0, 500)}`);
        if (response.status === 503) {
            return {
                ok: false,
                retryable: true,
                error: new AIAssistUnavailableError(
                    "Os modelos de IA do Google estão sobrecarregados agora. Tente de novo em alguns minutos ou preencha manualmente."
                ),
            };
        }
        if (response.status === 429) {
            return {
                ok: false,
                retryable: true,
                error: new AIAssistUnavailableError(
                    "O limite gratuito da IA foi atingido por agora. Tente de novo mais tarde ou preencha manualmente."
                ),
            };
        }
        if (response.status === 401 || response.status === 403) {
            return {
                ok: false,
                retryable: false,
                error: new AIAssistUnavailableError("A chave da IA (GEMINI_API_KEY) é inválida ou não tem permissão."),
            };
        }
        // 404 costuma ser nome de modelo inexistente: tenta o próximo
        return { ok: false, retryable: response.status === 404, error: new AIAssistUnavailableError() };
    }

    const data = (await response.json()) as InteractionResponse;
    if (data.status && data.status !== "completed") {
        console.error(`[gemini] ${model}: interação não concluída (${data.status})`);
        return { ok: false, retryable: true, error: new AIAssistUnavailableError() };
    }

    const text = extractText(data);
    if (!text) {
        console.error(`[gemini] ${model}: resposta sem texto:`, JSON.stringify(data).slice(0, 500));
        return {
            ok: false,
            retryable: false,
            error: new AIAssistUnavailableError("A IA não retornou conteúdo. Tente de novo ou preencha manualmente."),
        };
    }
    return { ok: true, text };
}

/** Gera uma resposta em JSON seguindo `schema`. Devolve o texto JSON cru (quem chama valida). */
async function generateJson({ prompt, schema }: { prompt: string; schema: JsonSchema }): Promise<string> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new AIAssistUnavailableError("A IA não está configurada (GEMINI_API_KEY ausente no backend).");
    }

    let lastError: AIAssistUnavailableError = new AIAssistUnavailableError();
    for (const model of models()) {
        const attempt = await callModel(model, apiKey, prompt, schema);
        if (attempt.ok) return attempt.text;
        lastError = attempt.error;
        if (!attempt.retryable) break;
        console.warn(`[gemini] ${model} indisponível; tentando o próximo modelo`);
    }
    throw lastError;
}

const gemini = { generateJson, models };

export { gemini };
