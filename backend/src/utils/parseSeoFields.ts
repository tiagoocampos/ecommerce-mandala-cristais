type RawSeoFields = {
    meta_description?: string;
    image_alt_text?: string;
};

type SeoFields = {
    meta_description?: string | null;
    image_alt_text?: string | null;
};

// undefined = campo não enviado (não altera) | "" = limpar (null) | texto = texto sem espaços nas pontas
function parseOptionalText(value: string | undefined): string | null | undefined {
    if (value === undefined) return undefined;
    const trimmed = value.trim();
    return trimmed === "" ? null : trimmed;
}

/** Campos de SEO vindos do multipart/form-data, sem as chaves não enviadas. */
export function parseSeoFields(body: RawSeoFields): SeoFields {
    const parsed = {
        meta_description: parseOptionalText(body.meta_description),
        image_alt_text: parseOptionalText(body.image_alt_text),
    };
    return Object.fromEntries(
        Object.entries(parsed).filter(([, value]) => value !== undefined)
    ) as SeoFields;
}
