import { z } from "zod";

const isValidDate = (value: string) => !Number.isNaN(Date.parse(value));

// Campos comuns a cupons pessoais e genéricos.
// value: PERCENTAGE = 1..100 (%), FIXED = centavos.
export const couponValueFields = {
  type: z.enum(["PERCENTAGE", "FIXED"], { message: "Tipo deve ser PERCENTAGE ou FIXED" }),
  value: z.number({ message: "O valor deve ser um número" }).int({ message: "O valor deve ser inteiro" }),
  expires_at: z
    .string()
    .refine(isValidDate, { message: "Data de validade inválida" })
    .nullish(),
};

export function refineCouponValue(
  data: { type: "PERCENTAGE" | "FIXED"; value: number },
  ctx: z.RefinementCtx
) {
  if (data.type === "PERCENTAGE" && (data.value < 1 || data.value > 100)) {
    ctx.addIssue({ code: "custom", path: ["value"], message: "Percentual deve estar entre 1 e 100" });
  }
  if (data.type === "FIXED" && data.value < 1) {
    ctx.addIssue({ code: "custom", path: ["value"], message: "Valor do desconto deve ser maior que zero" });
  }
}

export const createCouponSchema = z.object({
  body: z
    .object({
      code: z
        .string({ message: "O código é obrigatório" })
        .trim()
        .regex(/^[A-Z0-9_-]{3,30}$/, {
          message: "Código deve ter de 3 a 30 caracteres, em MAIÚSCULAS, sem espaços (letras, números, - ou _)",
        }),
      first_purchase_only: z.boolean().optional(),
      ...couponValueFields,
    })
    .superRefine(refineCouponValue),
});

export const updateCouponStatusSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    active: z.boolean({ message: "active deve ser true ou false" }),
  }),
});

export const validateCouponSchema = z.object({
  body: z.object({
    code: z.string({ message: "Informe o código do cupom" }).trim().min(1, { message: "Informe o código do cupom" }),
  }),
});
