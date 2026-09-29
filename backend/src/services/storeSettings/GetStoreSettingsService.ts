import prismaClient from "../../prisma/index.js";

// A tabela tem uma linha só, com id fixo.
export const STORE_SETTINGS_ID = "default";

// Valores que antes estavam fixos em AnnouncementBar.tsx / TrustStrip.tsx.
export const DEFAULT_STORE_SETTINGS = {
    announcement_text: "10% OFF na primeira compra com o cupom BEMVINDA10",
    announcement_coupon_code: "BEMVINDA10",
    free_shipping_threshold: 29900,
    trust_strip_items: [
        { icon: "Gem", label: "Pedras 100% naturais" },
        { icon: "Truck", label: "Envio rápido para todo o Brasil" },
        { icon: "CreditCard", label: "Até 3x sem juros" },
        { icon: "Tag", label: "10% OFF na primeira compra" },
    ],
};

class GetStoreSettingsService {
    async execute() {
        const current = await prismaClient.storeSettings.findUnique({ where: { id: STORE_SETTINGS_ID } });
        if (current) return current;

        // primeira leitura: cria o padrão (upsert com id fixo evita duplicar a linha em acessos simultâneos)
        return prismaClient.storeSettings.upsert({
            where: { id: STORE_SETTINGS_ID },
            update: {},
            create: { id: STORE_SETTINGS_ID, ...DEFAULT_STORE_SETTINGS },
        });
    }
}

export { GetStoreSettingsService };
