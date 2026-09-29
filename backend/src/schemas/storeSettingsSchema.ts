import { z } from "zod";

// Nomes de ícones do lucide-react que o frontend sabe renderizar na faixa de confiança.
// Manter em sincronia com TRUST_ICONS em frontend/src/lib/trust-icons.ts.
export const TRUST_ICON_NAMES = [
  "Gem",
  "Truck",
  "CreditCard",
  "Tag",
  "Sparkles",
  "ShieldCheck",
  "Leaf",
  "Heart",
  "Gift",
  "Star",
  "Package",
  "RefreshCw",
  "Clock",
  "Moon",
  "Percent",
] as const;

export const trustStripItemSchema = z.object({
  icon: z.enum(TRUST_ICON_NAMES, { message: "Ícone inválido" }),
  label: z.string().trim().min(1, { message: "O texto do item é obrigatório" }).max(60),
});

export const updateStoreSettingsSchema = z.object({
  body: z
    .object({
      announcement_text: z.string().trim().max(200),
      announcement_coupon_code: z.string().trim().toUpperCase().max(30).nullable(),
      free_shipping_threshold: z.number().int().min(0).nullable(),
      trust_strip_items: z.array(trustStripItemSchema).max(8),
    })
    .partial(),
});
