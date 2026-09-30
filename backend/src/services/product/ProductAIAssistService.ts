import { z } from "zod";
import { gemini } from "../../config/gemini.js";
import { AIInvalidResponseError } from "../../exceptions/AIErrors.js";
import prismaClient from "../../prisma/index.js";

interface ProductAIAssistServiceProps {
    name: string;
    category_hint?: string | undefined;
    keywords?: string | undefined;
}

// Schema pedido ao modelo (structured output) — também validado na volta.
const RESPONSE_SCHEMA = {
    type: "object",
    properties: {
        description: { type: "string" },
        meta_description: { type: "string" },
        image_alt_text: { type: "string" },
        // string simples (sem tipo união) por compatibilidade: "" = nenhuma categoria serve
        suggested_category_id: { type: "string" },
    },
    required: ["description", "meta_description", "image_alt_text", "suggested_category_id"],
};

const aiResponseSchema = z.object({
    description: z.string().trim().min(1),
    meta_description: z.string().trim().min(1),
    image_alt_text: z.string().trim().min(1),
    suggested_category_id: z.string().nullable(),
});

function buildPrompt(
    { name, category_hint, keywords }: ProductAIAssistServiceProps,
    categories: { id: string; name: string }[]
) {
    const categoryList = categories.length
        ? categories.map((c) => `- id: ${c.id} | nome: ${c.name}`).join("\n")
        : "(nenhuma categoria cadastrada)";

    return `Você escreve textos para o cadastro de produtos da Mandala Cristais, uma loja online de cristais e pedras naturais.

Produto: ${name}
Categoria já escolhida pelo lojista (contexto, pode estar vazia): ${category_hint || "(nenhuma)"}
Palavras-chave do lojista (opcional, use para guiar o texto): ${keywords || "(nenhuma)"}

Categorias existentes na loja:
${categoryList}

Gere, em português do Brasil:

1. "description": descrição do produto com 2 a 4 frases. Tom acolhedor e espiritual, mas informativo.
2. "meta_description": resumo para o resultado de busca do Google, com NO MÁXIMO 155 caracteres (contando espaços). Atrativo, sem repetir a descrição palavra por palavra.
3. "image_alt_text": uma frase curta e objetiva descrevendo VISUALMENTE o que a foto do produto mostra (ex.: "Pedra de ametista bruta roxa sobre fundo claro"). Sem linguagem de marketing — é para acessibilidade.
4. "suggested_category_id": o id de UMA das categorias existentes listadas acima que melhor combina com o produto. Use exatamente um dos ids da lista. Nunca invente categoria nova. Se nenhuma fizer sentido, retorne uma string vazia "".

Regras obrigatórias:
- NUNCA afirme propriedades medicinais, terapêuticas ou curativas como fato (ex.: "cura ansiedade", "trata insônia"). Use sempre linguagem de crença ou tradição: "acredita-se que", "é associada a", "tradicionalmente usada para". Isso vale para a descrição e para a meta descrição.
- Não invente dados técnicos que não foram informados (peso, origem, tamanho) além do que está no nome do produto.

Responda somente com o objeto JSON no formato pedido.`;
}

class ProductAIAssistService {
    async execute(input: ProductAIAssistServiceProps) {
        const categories = await prismaClient.category.findMany({
            select: { id: true, name: true },
            orderBy: { name: "asc" },
        });

        const raw = await gemini.generateJson({
            prompt: buildPrompt(input, categories),
            schema: RESPONSE_SCHEMA,
        });

        // JSON malformado ou fora do formato = erro (não tentamos "consertar" a resposta)
        let parsed: z.infer<typeof aiResponseSchema>;
        try {
            parsed = aiResponseSchema.parse(JSON.parse(raw));
        } catch (error) {
            console.error("[gemini] Resposta inválida:", raw.slice(0, 500), error);
            throw new AIInvalidResponseError();
        }

        // Sugestão só vale se for uma categoria que existe de verdade
        const suggestedExists = categories.some((c) => c.id === parsed.suggested_category_id);

        return {
            description: parsed.description,
            meta_description: parsed.meta_description,
            image_alt_text: parsed.image_alt_text,
            suggested_category_id: suggestedExists ? parsed.suggested_category_id : null,
        };
    }
}

export { ProductAIAssistService };
