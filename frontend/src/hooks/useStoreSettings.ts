import { useEffect, useState } from "react";
import { api } from "../services/api";
import type { StoreSettings } from "../types/admin";

// Fallback local (valores anteriores ao painel) — o topo do site nunca fica em branco se a API falhar.
export const FALLBACK_STORE_SETTINGS: StoreSettings = {
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

// Cache compartilhado entre AnnouncementBar, TrustStrip etc.: uma requisição por carregamento do site.
let cached: StoreSettings | null = null;
let inflight: Promise<StoreSettings> | null = null;
const listeners = new Set<(settings: StoreSettings) => void>();

function load(): Promise<StoreSettings> {
    if (!inflight) {
        inflight = api
            .get<StoreSettings>("/store-settings")
            .then(({ data }) => {
                cached = data;
                return data;
            })
            .catch(() => {
                inflight = null; // tenta de novo na próxima montagem
                return FALLBACK_STORE_SETTINGS;
            });
    }
    return inflight;
}

/** Atualiza o cache após o admin salvar, para a loja refletir sem recarregar. */
export function setStoreSettingsCache(settings: StoreSettings) {
    cached = settings;
    inflight = Promise.resolve(settings);
    listeners.forEach((listener) => listener(settings));
}

export function useStoreSettings(): StoreSettings {
    const [settings, setSettings] = useState<StoreSettings>(cached ?? FALLBACK_STORE_SETTINGS);

    useEffect(() => {
        let mounted = true;
        listeners.add(setSettings);
        if (!cached) {
            load().then((data) => {
                if (mounted) setSettings(data);
            });
        }
        return () => {
            mounted = false;
            listeners.delete(setSettings);
        };
    }, []);

    return settings;
}
