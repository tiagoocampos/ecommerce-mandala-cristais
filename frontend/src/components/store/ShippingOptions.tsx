import { AlertCircle, Loader2, RefreshCw, Store, Truck } from "lucide-react";
import { Button } from "../ui/button";
import { formatPrice } from "../../lib/utils-api";
import { cn } from "../../lib/utils";

export interface ShippingOption {
    service: string;
    service_id: number;
    company: string | null;
    price_cents: number;
    delivery_days: number | null;
}

/** PAC/SEDEX que o Melhor Envio não conseguiu cotar: aparecem desabilitados */
export interface UnavailableShipping {
    service_id: number;
    service: string;
    company: string | null;
    reason: string;
}

interface ShippingOptionsProps {
    hasAddress: boolean;
    loading: boolean;
    error: string | null;
    options: ShippingOption[];
    unavailable: UnavailableShipping[];
    selected: string | null;
    onSelect: (service: string) => void;
    onRetry: () => void;
    /** retirada ativa na loja: vira alternativa em destaque quando nada dá para enviar */
    pickupEnabled?: boolean;
    onChoosePickup?: () => void;
}

function deliveryLabel(days: number | null) {
    if (!days) return "Prazo informado após a postagem";
    return `Até ${days} ${days === 1 ? "dia útil" : "dias úteis"}`;
}

// "Correios — PAC"
function serviceLabel(item: { company: string | null; service: string }) {
    return item.company ? `${item.company} — ${item.service}` : item.service;
}

export function ShippingOptions({
    hasAddress,
    loading,
    error,
    options,
    unavailable,
    selected,
    onSelect,
    onRetry,
    pickupEnabled = false,
    onChoosePickup,
}: ShippingOptionsProps) {
    const hasList = options.length > 0 || unavailable.length > 0;
    const noneAvailable = options.length === 0 && unavailable.length > 0;

    return (
        <div className="bg-white border border-mc-violet-950/10 rounded-lg p-5">
            <h2 className="font-display text-lg text-mc-violet-950 mb-4 flex items-center gap-2">
                <Truck size={18} className="text-mc-gold-700" />
                Frete
            </h2>

            {!hasAddress ? (
                <p className="text-sm text-mc-ink/60">Selecione um endereço para calcular o frete.</p>
            ) : loading ? (
                <div className="flex items-center gap-2 py-2 text-sm text-mc-ink/60" role="status">
                    <Loader2 size={16} className="animate-spin text-mc-violet-700" />
                    Calculando o frete para o seu CEP...
                </div>
            ) : (
                <div className="space-y-3">
                    {error && (
                        <div className="flex flex-col items-start gap-3 rounded-lg border border-destructive/25 bg-destructive/5 p-3">
                            <p className="flex items-start gap-2 text-sm text-destructive">
                                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                                {error}
                            </p>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={onRetry}
                                className="border-mc-violet-950/20 text-mc-violet-950"
                            >
                                <RefreshCw size={14} /> Tentar novamente
                            </Button>
                        </div>
                    )}

                    {(noneAvailable || error) && pickupEnabled && onChoosePickup && (
                        <button
                            type="button"
                            onClick={onChoosePickup}
                            className="w-full flex items-center gap-3 text-left rounded-lg border-2 border-mc-gold-500 bg-mc-blush-100 p-3 hover:bg-mc-blush-100/70"
                        >
                            <Store size={18} className="text-mc-gold-700 shrink-0" />
                            <span className="flex-1">
                                <span className="block text-sm font-semibold text-mc-violet-950">Retirar na loja (grátis)</span>
                                <span className="block text-xs text-mc-ink/60">
                                    Sem opção de envio para este endereço? Você pode retirar o pedido na loja.
                                </span>
                            </span>
                        </button>
                    )}

                    {hasList && (
                        <div className="space-y-2" role="radiogroup" aria-label="Opções de frete">
                            {options.map((option) => {
                                const isSelected = selected === option.service;
                                return (
                                    <button
                                        key={option.service}
                                        type="button"
                                        role="radio"
                                        aria-checked={isSelected}
                                        onClick={() => onSelect(option.service)}
                                        className={cn(
                                            "w-full flex items-center gap-3 text-left border rounded-lg p-3 transition-all",
                                            isSelected
                                                ? "border-mc-gold-500 bg-mc-blush-100 ring-1 ring-mc-gold-500/40"
                                                : "border-mc-violet-950/10 bg-mc-sand-50 hover:bg-mc-blush-100"
                                        )}
                                    >
                                        <span
                                            className={cn(
                                                "w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center",
                                                isSelected ? "border-mc-gold-500" : "border-mc-violet-950/30"
                                            )}
                                        >
                                            {isSelected && <span className="w-2 h-2 rounded-full bg-mc-gold-500" />}
                                        </span>
                                        <span className="flex-1 min-w-0">
                                            <span className="block text-sm font-medium text-mc-violet-950">
                                                {serviceLabel(option)}
                                            </span>
                                            <span className="block text-xs text-mc-ink/60">{deliveryLabel(option.delivery_days)}</span>
                                        </span>
                                        <span className="text-sm font-semibold text-mc-violet-950 whitespace-nowrap">
                                            {formatPrice(option.price_cents)}
                                        </span>
                                    </button>
                                );
                            })}

                            {unavailable.map((item) => (
                                <div
                                    key={item.service_id}
                                    role="radio"
                                    aria-checked={false}
                                    aria-disabled="true"
                                    title={item.reason}
                                    className="w-full flex items-center gap-3 border border-mc-violet-950/10 rounded-lg p-3 bg-mc-sand-50 opacity-60 cursor-not-allowed"
                                >
                                    <span className="w-4 h-4 rounded-full border-2 border-mc-violet-950/20 shrink-0" />
                                    <span className="flex-1 min-w-0">
                                        <span className="block text-sm font-medium text-mc-violet-950">
                                            {serviceLabel(item)}
                                        </span>
                                        <span className="block text-xs text-mc-ink/60">
                                            Indisponível para este endereço/pedido
                                        </span>
                                    </span>
                                    <span className="text-xs text-mc-ink/50 whitespace-nowrap">Indisponível</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
