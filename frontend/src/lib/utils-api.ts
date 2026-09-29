import axios from "axios";
import { toast } from "sonner";

interface FieldError {
    path: string;
    message: string;
}

export function getApiErrorMessage(error: unknown, fallback = "Ocorreu um erro"): string {
    if (!axios.isAxiosError(error)) return fallback;
    return error.response?.data?.error || fallback;
}

export function applyFieldErrors<T extends Record<string, string>>(
    error: unknown,
    fields: T,
    setErrors: (errors: T) => void
): boolean {
    if (!axios.isAxiosError(error)) return false;

    const details = error.response?.data?.details as FieldError[] | undefined;
    if (!details) return false;

    const fieldErrors = { ...fields };
    details.forEach((detail) => {
        if (detail.path in fieldErrors) {
            fieldErrors[detail.path as keyof T] = detail.message as T[keyof T];
        }
    });
    setErrors(fieldErrors);
    return true;
}

export function showApiError(error: unknown, fallback = "Ocorreu um erro"): void {
    toast.error(getApiErrorMessage(error, fallback), { position: "top-center" });
}

export const inputClassName =
    "h-auto bg-white border border-input text-mc-ink placeholder:text-mc-ink/40 rounded-md px-3 py-3 text-sm outline-none transition-colors hover:border-mc-violet-300 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20 w-full";

export function formatPrice(cents: number): string {
    return (cents / 100).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
    });
}

export function formatDate(date: string): string {
    return new Date(date).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}
