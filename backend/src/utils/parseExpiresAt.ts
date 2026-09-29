// Aceita "YYYY-MM-DD" (vale até o fim do dia, horário de Brasília) ou data ISO completa.
export function parseExpiresAt(value?: string | null): Date | null {
    if (!value) return null;
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return new Date(`${value}T23:59:59-03:00`);
    }
    return new Date(value);
}
