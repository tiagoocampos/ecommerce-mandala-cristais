import jwt from "jsonwebtoken";

// O `state` do OAuth2 protege o callback público contra uso por terceiros (CSRF).
// Segredo DERIVADO de propósito: um JWT assinado só com JWT_SECRET seria aceito pelo
// middleware isAuthenticated como token de login, e este aparece na URL.
function stateSecret() {
    return `${process.env.JWT_SECRET as string}:melhorenvio-oauth-state`;
}

const PURPOSE = "melhorenvio-oauth";

export function createOAuthState(): string {
    return jwt.sign({ purpose: PURPOSE }, stateSecret(), { expiresIn: "15m" });
}

export function isValidOAuthState(state: string): boolean {
    try {
        const payload = jwt.verify(state, stateSecret()) as { purpose?: string };
        return payload.purpose === PURPOSE;
    } catch {
        return false;
    }
}
