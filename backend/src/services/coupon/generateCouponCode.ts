import { randomInt } from "node:crypto";
import prismaClient from "../../prisma/index.js";
import { generateSlug } from "../../utils/generateSlug.js";

// Sem caracteres ambíguos (0/O, 1/I/L) para o cliente não errar ao digitar.
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

function randomSuffix(length = 4) {
    return Array.from({ length }, () => ALPHABET[randomInt(ALPHABET.length)]).join("");
}

// Ex.: "Maria Souza" -> MANDALA-MARIA-X7F2
export async function generatePersonalCouponCode(userName: string): Promise<string> {
    const firstName =
        generateSlug(userName.split(" ")[0] ?? "").replace(/-/g, "").toUpperCase().slice(0, 10) || "CLIENTE";

    for (let attempt = 0; attempt < 10; attempt++) {
        const code = `MANDALA-${firstName}-${randomSuffix()}`;
        const exists = await prismaClient.coupon.findUnique({ where: { code }, select: { id: true } });
        if (!exists) return code;
    }

    return `MANDALA-${firstName}-${randomSuffix(8)}`;
}
