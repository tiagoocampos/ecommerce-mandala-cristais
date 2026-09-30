type RawShippingFields = {
    weight_grams?: string;
    height_cm?: string;
    width_cm?: string;
    length_cm?: string;
};

export type ShippingFields = {
    weight_grams?: number | null | undefined;
    height_cm?: number | null | undefined;
    width_cm?: number | null | undefined;
    length_cm?: number | null | undefined;
};

type DefinedShippingFields = {
    weight_grams?: number | null;
    height_cm?: number | null;
    width_cm?: number | null;
    length_cm?: number | null;
};

// undefined = campo não enviado (não altera) | "" = limpar (null) | "123" = 123
function parseOptionalInt(value: string | undefined): number | null | undefined {
    if (value === undefined) return undefined;
    if (value.trim() === "") return null;
    return parseInt(value, 10);
}

// Os campos chegam como string (multipart/form-data), igual price/stock.
export function parseShippingFields(body: RawShippingFields): ShippingFields {
    return {
        weight_grams: parseOptionalInt(body.weight_grams),
        height_cm: parseOptionalInt(body.height_cm),
        width_cm: parseOptionalInt(body.width_cm),
        length_cm: parseOptionalInt(body.length_cm),
    };
}

/** Remove chaves undefined para o Prisma não sobrescrever o que não foi enviado. */
export function definedShippingFields(fields: ShippingFields): DefinedShippingFields {
    return Object.fromEntries(
        Object.entries(fields).filter(([, value]) => value !== undefined)
    ) as DefinedShippingFields;
}
