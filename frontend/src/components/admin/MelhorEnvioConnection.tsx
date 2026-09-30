import { useCallback, useEffect, useState } from "react";
import { ExternalLink, Truck } from "lucide-react";
import { Button } from "../ui/button";
import { formatDay } from "../../lib/admin-format";
import { showApiError } from "../../lib/utils-api";
import { api } from "../../services/api";

interface IntegrationStatus {
    environment: "sandbox" | "production";
    configured: boolean;
    connected: boolean;
    expires_at: string | null;
    refresh_expires_at: string | null;
    updated_at: string | null;
}

// Conexão OAuth2 com o Melhor Envio: o lojista autoriza o app uma vez; depois o
// backend renova o token sozinho. Precisa reconectar só se o refresh falhar (45 dias sem uso).
export function MelhorEnvioConnection() {
    const [status, setStatus] = useState<IntegrationStatus | null>(null);
    const [opening, setOpening] = useState(false);

    const fetchStatus = useCallback(async () => {
        try {
            const { data } = await api.get<IntegrationStatus>("/admin/integrations/melhorenvio");
            setStatus(data);
        } catch (error) {
            showApiError(error, "Erro ao consultar integração com o Melhor Envio");
        }
    }, []);

    useEffect(() => {
        fetchStatus();
    }, [fetchStatus]);

    async function handleConnect() {
        setOpening(true);
        try {
            const { data } = await api.get<{ url: string }>("/admin/integrations/melhorenvio/authorize-url");
            window.open(data.url, "_blank", "noopener,noreferrer");
        } catch (error) {
            showApiError(error, "Não foi possível gerar o link de autorização");
        } finally {
            setOpening(false);
        }
    }

    const expired = !!status?.refresh_expires_at && new Date(status.refresh_expires_at).getTime() < Date.now();

    return (
        <section className="mb-10 rounded-lg border border-mc-violet-950/10 bg-white p-4 sm:p-5">
            <h2 className="font-display text-lg text-mc-violet-950 flex items-center gap-2">
                <Truck size={18} className="text-mc-gold-700" /> Frete — Melhor Envio
            </h2>
            <p className="text-xs text-mc-ink/60 mb-4">
                A cotação de frete do checkout usa a sua conta do Melhor Envio. Autorize uma vez; o
                acesso é renovado automaticamente.
            </p>

            {!status ? (
                <p className="text-sm text-mc-ink/50">Carregando...</p>
            ) : !status.configured ? (
                <p className="text-sm text-destructive">
                    Faltam variáveis no backend: MELHORENVIO_CLIENT_ID, MELHORENVIO_CLIENT_SECRET e
                    MELHORENVIO_REDIRECT_URI (veja backend/.env.example).
                </p>
            ) : (
                <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                        <span
                            className={`inline-block text-[11px] font-medium px-2 py-0.5 rounded-full border ${
                                status.connected && !expired
                                    ? "bg-mc-success-100 text-mc-success-700 border-mc-success-700/25"
                                    : "bg-mc-gold-500/20 text-mc-gold-800 border-mc-gold-500/50"
                            }`}
                        >
                            {status.connected && !expired ? "Conectado" : status.connected ? "Autorização vencida" : "Não conectado"}
                        </span>
                        <span className="text-xs text-mc-ink/50">
                            Ambiente: {status.environment === "production" ? "produção" : "sandbox (testes)"}
                        </span>
                        {status.connected && (
                            <span className="text-xs text-mc-ink/50">
                                · token válido até {formatDay(status.expires_at)} (renovado automaticamente)
                            </span>
                        )}
                    </div>

                    <Button
                        type="button"
                        onClick={handleConnect}
                        disabled={opening}
                        className="bg-mc-violet-950 hover:bg-mc-violet-800 text-mc-sand-50"
                    >
                        <ExternalLink size={14} />
                        {status.connected ? "Reconectar conta" : "Conectar conta do Melhor Envio"}
                    </Button>
                    <p className="text-xs text-mc-ink/50">
                        Abre o Melhor Envio em outra aba. Depois de autorizar, volte aqui e{" "}
                        <button type="button" onClick={fetchStatus} className="underline hover:text-mc-violet-950">
                            atualize o status
                        </button>
                        .
                    </p>
                </div>
            )}
        </section>
    );
}
