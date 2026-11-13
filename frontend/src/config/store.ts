// Dados de contato da loja num só lugar. Campo vazio ("") NÃO aparece na tela.
// A cliente precisa preencher: email e hours (e tiktokUrl/facebookUrl, se existirem perfis).
export const STORE = {
    name: "Mandala Crystais",
    instagramUrl: "https://www.instagram.com/mandalacrystais/",
    tiktokUrl: "",
    facebookUrl: "",
    // 55 (Brasil) + DDD + número, só dígitos: (54) 99183-6035
    whatsappNumber: "5554991836035",
    email: "",
    // texto livre, ex.: "Segunda a sexta, das 9h às 18h"
    hours: "",
} as const;

export const WHATSAPP_URL = STORE.whatsappNumber ? `https://wa.me/${STORE.whatsappNumber}` : "";

export function whatsappLink(message: string): string {
    return WHATSAPP_URL ? `${WHATSAPP_URL}?text=${encodeURIComponent(message)}` : "";
}

// Meios de pagamento exibidos no site (uma definição só; sem boleto)
export const ACCEPTED_PAYMENT_METHODS = ["Pix", "Cartão de crédito"] as const;
