import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { MailX } from "lucide-react";
import { AuthPageShell } from "../../components/store/AuthPageShell";
import { Button } from "../../components/ui/button";
import { getApiErrorMessage } from "../../lib/utils-api";
import { api } from "../../services/api";

// Página do link "Não quero mais receber ofertas" dos e-mails de marketing.
// Pede um clique de confirmação (não descadastra só de abrir o link: alguns
// provedores de e-mail abrem links automaticamente para checar segurança).
export function Unsubscribe() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token") ?? "";
    const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">(token ? "idle" : "error");
    const [message, setMessage] = useState<string>(token ? "" : "Link de descadastro inválido.");

    async function handleConfirm() {
        setStatus("sending");
        try {
            const { data } = await api.post<{ message: string }>("/marketing/unsubscribe", { token });
            setMessage(data.message);
            setStatus("done");
        } catch (err) {
            setMessage(getApiErrorMessage(err, "Não foi possível concluir agora. Tente novamente."));
            setStatus("error");
        }
    }

    return (
        <AuthPageShell title="E-mails de ofertas">
            <div className="flex flex-col items-center gap-3 text-center">
                <MailX size={40} strokeWidth={1.5} className="text-mc-violet-700" />
                {status === "done" || status === "error" ? (
                    <p className="text-sm text-mc-ink/80">{message}</p>
                ) : (
                    <>
                        <p className="text-sm text-mc-ink/80">
                            Quer parar de receber e-mails de ofertas e novidades da Mandala Crystais? E-mails
                            sobre os seus pedidos e a sua conta continuam chegando normalmente.
                        </p>
                        <Button
                            onClick={handleConfirm}
                            disabled={status === "sending"}
                            className="mt-1 rounded-full bg-mc-violet-950 px-6 text-mc-sand-50 hover:bg-mc-violet-800"
                        >
                            {status === "sending" ? "Confirmando..." : "Sim, não quero mais receber"}
                        </Button>
                    </>
                )}
                <Link to="/" className="mt-2 text-sm text-mc-violet-950 underline underline-offset-4 decoration-mc-gold-500">
                    Voltar para a loja
                </Link>
            </div>
        </AuthPageShell>
    );
}
