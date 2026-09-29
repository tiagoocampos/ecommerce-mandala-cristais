import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { getApiErrorMessage } from "../../lib/utils-api";
import { reaisToCents } from "../../lib/admin-format";
import type { CouponType } from "../../types/admin";

export interface CouponFormPayload {
    code?: string;
    type: CouponType;
    value: number;
    first_purchase_only?: boolean;
    expires_at?: string | null;
}

interface CouponFormProps {
    /** "personal": código gerado pelo backend | "generic": admin escolhe o código */
    mode: "personal" | "generic";
    onSubmit: (payload: CouponFormPayload) => Promise<void>;
    onCancel: () => void;
}

const fieldClass =
    "h-9 rounded-md border border-input bg-white px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20";

export function CouponForm({ mode, onSubmit, onCancel }: CouponFormProps) {
    const [code, setCode] = useState("");
    const [type, setType] = useState<CouponType>("PERCENTAGE");
    const [value, setValue] = useState("");
    const [firstPurchaseOnly, setFirstPurchaseOnly] = useState(false);
    const [expiresAt, setExpiresAt] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    function buildPayload(): CouponFormPayload | string {
        if (mode === "generic" && !/^[A-Z0-9_-]{3,30}$/.test(code)) {
            return "Código deve ter de 3 a 30 caracteres: letras maiúsculas, números, - ou _ (sem espaços).";
        }

        let parsedValue: number | null;
        if (type === "PERCENTAGE") {
            parsedValue = Number(value);
            if (!Number.isInteger(parsedValue) || parsedValue < 1 || parsedValue > 100) {
                return "Percentual deve ser um número inteiro entre 1 e 100.";
            }
        } else {
            parsedValue = reaisToCents(value);
            if (!parsedValue || parsedValue < 1) {
                return "Informe um valor em reais maior que zero (ex.: 15,00).";
            }
        }

        return {
            ...(mode === "generic" && { code, first_purchase_only: firstPurchaseOnly }),
            type,
            value: parsedValue,
            expires_at: expiresAt || null,
        };
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const payload = buildPayload();
        if (typeof payload === "string") {
            setError(payload);
            return;
        }
        setError(null);
        setSubmitting(true);
        try {
            await onSubmit(payload);
        } catch (err) {
            setError(getApiErrorMessage(err, "Erro ao criar cupom"));
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="rounded-lg border border-mc-violet-950/10 bg-mc-sand-50 p-4 mb-4 space-y-3"
        >
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {mode === "generic" && (
                    <div className="space-y-1.5">
                        <Label htmlFor="coupon-code">Código</Label>
                        <Input
                            id="coupon-code"
                            value={code}
                            onChange={(e) => setCode(e.target.value.toUpperCase().replace(/\s/g, ""))}
                            placeholder="BEMVINDA10"
                            className="bg-white font-mono"
                            maxLength={30}
                        />
                    </div>
                )}

                <div className="space-y-1.5">
                    <Label htmlFor="coupon-type">Tipo</Label>
                    <select
                        id="coupon-type"
                        value={type}
                        onChange={(e) => setType(e.target.value as CouponType)}
                        className={`w-full ${fieldClass}`}
                    >
                        <option value="PERCENTAGE">Percentual (%)</option>
                        <option value="FIXED">Valor fixo (R$)</option>
                    </select>
                </div>

                <div className="space-y-1.5">
                    <Label htmlFor="coupon-value">
                        {type === "PERCENTAGE" ? "Percentual (1 a 100)" : "Valor em reais"}
                    </Label>
                    <Input
                        id="coupon-value"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        inputMode="decimal"
                        placeholder={type === "PERCENTAGE" ? "10" : "15,00"}
                        className="bg-white"
                    />
                </div>

                <div className="space-y-1.5">
                    <Label htmlFor="coupon-expires">Validade (opcional)</Label>
                    <Input
                        id="coupon-expires"
                        type="date"
                        value={expiresAt}
                        onChange={(e) => setExpiresAt(e.target.value)}
                        className="bg-white"
                    />
                </div>
            </div>

            {mode === "generic" && (
                <label className="flex items-center gap-2 text-sm text-mc-ink/80">
                    <input
                        type="checkbox"
                        checked={firstPurchaseOnly}
                        onChange={(e) => setFirstPurchaseOnly(e.target.checked)}
                        className="h-4 w-4 accent-mc-violet-700"
                    />
                    Válido só na primeira compra
                </label>
            )}

            {mode === "personal" && (
                <p className="text-xs text-mc-ink/60">
                    O código é gerado automaticamente (ex.: MANDALA-MARIA-X7F2) e só funciona para este cliente.
                </p>
            )}

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="flex gap-2">
                <Button
                    type="submit"
                    disabled={submitting}
                    className="bg-mc-violet-950 hover:bg-mc-violet-800 text-mc-sand-50"
                >
                    {submitting ? "Criando..." : mode === "personal" ? "Criar desconto" : "Criar cupom"}
                </Button>
                <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>
                    Cancelar
                </Button>
            </div>
        </form>
    );
}
