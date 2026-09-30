import { AlertCircle, Loader2, RefreshCw, Truck } from "lucide-react";
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

interface ShippingOptionsProps {
    hasAddress: boolean;
    loading: boolean;
    error: string | null;
    options: ShippingOption[];
    selected: string | null;
    onSelect: (service: string) => void;
    onRetry: () => void;
}

function deliveryLabel(days: number | null) {
    if (!days) return "Prazo informado após a postagem";
    return `Até ${days} ${days === 1 ? "dia útil" : "dias úteis"}`;
}

export function ShippingOptions({ hasAddress, loading, error, options, selected, onSelect, onRetry }: ShippingOptionsProps) {
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
            ) : error ? (
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
            ) : (
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
                                        {option.service}
                                        {option.company && (
                                            <span className="font-normal text-mc-ink/50"> · {option.company}</span>
                                        )}
                                    </span>
                                    <span className="block text-xs text-mc-ink/60">{deliveryLabel(option.delivery_days)}</span>
                                </span>
                                <span className="text-sm font-semibold text-mc-violet-950 whitespace-nowrap">
                                    {formatPrice(option.price_cents)}
                                </span>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
