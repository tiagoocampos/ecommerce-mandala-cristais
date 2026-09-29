import prismaClient from "../../prisma/index.js";
import { DEFAULT_STORE_SETTINGS, STORE_SETTINGS_ID } from "./GetStoreSettingsService.js";

interface UpdateStoreSettingsServiceProps {
    announcement_text?: string;
    announcement_coupon_code?: string | null;
    free_shipping_threshold?: number | null;
    trust_strip_items?: { icon: string; label: string }[];
}

class UpdateStoreSettingsService {
    async execute(input: UpdateStoreSettingsServiceProps) {
        // Só os campos realmente enviados: um `undefined` explícito sobrescreveria o
        // valor padrão no `create` do upsert e o Prisma rejeitaria a operação.
        const data = Object.fromEntries(
            Object.entries(input).filter(([, value]) => value !== undefined)
        ) as UpdateStoreSettingsServiceProps;

        const normalized = {
            ...data,
            ...(data.announcement_text !== undefined && {
                announcement_text: data.announcement_text.trim(),
            }),
            // string vazia = sem cupom em destaque
            ...(data.announcement_coupon_code !== undefined && {
                announcement_coupon_code: data.announcement_coupon_code?.trim().toUpperCase() || null,
            }),
            ...(data.trust_strip_items !== undefined && {
                trust_strip_items: data.trust_strip_items.map((item) => ({
                    icon: item.icon,
                    label: item.label.trim(),
                })),
            }),
        };

        return prismaClient.storeSettings.upsert({
            where: { id: STORE_SETTINGS_ID },
            update: normalized,
            create: { id: STORE_SETTINGS_ID, ...DEFAULT_STORE_SETTINGS, ...normalized },
        });
    }
}

export { UpdateStoreSettingsService };
