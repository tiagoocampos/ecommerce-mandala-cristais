import { useCallback, useEffect, useRef, useState } from "react";
import { AlertCircle, Check, CheckCircle2, Copy, Loader2, QrCode } from "lucide-react";
import { formatPrice, getApiErrorMessage } from "../../lib/utils-api";
import { api } from "../../services/api";
import type { Order } from "../../types";

interface PixData {
    order_id: string;
    payment_id: string;
    original_total: number;
    pix_discount: number;
    amount_to_pay: number;
    qr_code: string;
    qr_code_base64: string;
    ticket_url: string | null;
    expires_at: string;
}

interface PixPaymentProps {
    orderId: string;
    /** chamado quando o pedido passa a PAID (depois da mensagem de sucesso) */
    onPaid: () => void;
}

const POLL_MS = 5000;

export function PixPayment({ orderId, onPaid }: PixPaymentProps) {
    const [pix, setPix] = useState<PixData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [paid, setPaid] = useState(false);
    const [expired, setExpired] = useState(false);
    const codeRef = useRef<HTMLTextAreaElement>(null);

    const generate = useCallback(async () => {
        setLoading(true);
        setError(null);
        setExpired(false);
        try {
            const { data } = await api.post<PixData>("/payment/pix", { order_id: orderId });
            setPix(data);
        } catch (err) {
            setError(getApiErrorMessage(err, "Não foi possível gerar o Pix. Tente novamente."));
        } finally {
            setLoading(false);
        }
    }, [orderId]);

    useEffect(() => {
        generate();
    }, [generate]);

    // Confirmação automática: consulta o pedido enquanto o Pix está ativo
    useEffect(() => {
        if (!pix || paid || expired) return;
        let stopped = false;

        const check = async () => {
            try {
                const { data } = await api.get<Order>(`/order/${orderId}`);
                if (!stopped && data.status === "PAID") setPaid(true);
            } catch {
                // falha pontual de rede: tenta de novo no próximo ciclo
            }
        };
        const timer = setInterval(() => {
            if (new Date(pix.expires_at).getTime() <= Date.now()) {
                setExpired(true);
                return;
            }
            check();
        }, POLL_MS);

        return () => {
            stopped = true;
            clearInterval(timer);
        };
    }, [pix, paid, expired, orderId]);

    useEffect(() => {
        if (!paid) return;
        const timer = setTimeout(onPaid, 2500);
        return () => clearTimeout(timer);
    }, [paid, onPaid]);

    async function copyCode() {
        if (!pix) return;
        try {
            await navigator.clipboard.writeText(pix.qr_code);
        } catch {
            // sem API de clipboard (ou sem permissão): seleciona o texto para copiar manualmente
            codeRef.current?.select();
            document.execCommand("copy");
        }
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    if (paid) {
        return (
            <div className="bg-mc-success-100 border border-mc-success-700/25 rounded-lg p-5 text-center">
                <CheckCircle2 size={32} className="text-mc-success-700 mx-auto mb-2" />
                <p className="text-sm font-medium text-mc-success-700">Pagamento confirmado!</p>
                <p className="text-xs text-mc-success-700/80 mt-1">Levando você ao seu pedido...</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="py-8 flex flex-col items-center gap-2 text-sm text-mc-ink/60">
                <Loader2 size={22} className="animate-spin" />
                Gerando Pix...
            </div>
        );
    }

    if (error || !pix) {
        return (
            <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-lg p-4">
                <AlertCircle size={18} className="text-red-600 shrink-0 mt-0.5" />
                <div>
                    <p className="text-sm font-medium text-red-800">{error}</p>
                    <button
                        type="button"
                        onClick={generate}
                        className="text-sm text-red-700 underline hover:no-underline mt-1"
                    >
                        Tentar novamente
                    </button>
                </div>
            </div>
        );
    }

    if (expired) {
        return (
            <div className="bg-mc-sand-100 border border-mc-violet-950/10 rounded-lg p-4 text-center space-y-3">
                <p className="text-sm font-medium text-mc-violet-950">Pix expirado</p>
                <button
                    type="button"
                    onClick={generate}
                    className="bg-mc-gold-500 hover:bg-mc-gold-600 text-mc-violet-950 rounded-full h-10 px-6 font-semibold text-sm"
                >
                    Gerar novo Pix
                </button>
            </div>
        );
    }

    const payUntil = new Date(pix.expires_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

    return (
        <div className="space-y-4">
            <div className="text-center">
                <p className="text-xs text-mc-ink/60">Valor a pagar</p>
                <p className="font-display text-3xl text-mc-violet-950">{formatPrice(pix.amount_to_pay)}</p>
                {pix.pix_discount > 0 && (
                    <p className="text-xs text-mc-success-700 mt-1">
                        Desconto Pix: -{formatPrice(pix.pix_discount)}
                    </p>
                )}
                <p className="text-xs text-mc-gold-800 mt-1">Pague até {payUntil}</p>
            </div>

            <div>
                <label htmlFor="pix-code" className="text-xs font-medium text-mc-ink/70">
                    Pix copia e cola
                </label>
                <textarea
                    id="pix-code"
                    ref={codeRef}
                    readOnly
                    rows={3}
                    value={pix.qr_code}
                    onFocus={(e) => e.currentTarget.select()}
                    className="mt-1 w-full text-xs font-mono bg-mc-sand-50 border border-mc-violet-950/15 rounded-md p-2 resize-none"
                />
                <button
                    type="button"
                    onClick={copyCode}
                    className="mt-2 w-full bg-mc-gold-500 hover:bg-mc-gold-600 text-mc-violet-950 rounded-full h-12 font-semibold flex items-center justify-center gap-2"
                >
                    {copied ? <Check size={18} /> : <Copy size={18} />}
                    {copied ? "Copiado!" : "Copiar código Pix"}
                </button>
            </div>

            <div className="flex flex-col items-center gap-2">
                <p className="text-xs text-mc-ink/60 flex items-center gap-1.5">
                    <QrCode size={14} /> ou escaneie o QR Code
                </p>
                <img
                    src={`data:image/png;base64,${pix.qr_code_base64}`}
                    alt="QR Code do Pix"
                    className="w-44 h-44 border border-mc-violet-950/10 rounded-md bg-white p-1"
                />
            </div>

            <p className="text-[11px] text-mc-ink/50 text-center">
                Abra o app do seu banco, escolha Pix &gt; Pagar com QR Code ou Pix copia e cola.
                A confirmação é automática assim que o pagamento for feito.
            </p>
        </div>
    );
}
