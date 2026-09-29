// Número do lojista: (54) 99183-6035 → 55 (Brasil) + 54 + 991836035
export const WHATSAPP_NUMBER = "5554991836035";
export const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}`;

export function whatsappLink(message: string): string {
    return `${WHATSAPP_URL}?text=${encodeURIComponent(message)}`;
}
