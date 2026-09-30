import { useState } from "react";
import { Link } from "react-router-dom";
import { MailCheck } from "lucide-react";
import { AuthPageShell } from "../../components/store/AuthPageShell";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { getApiErrorMessage, inputClassName } from "../../lib/utils-api";
import { api } from "../../services/api";

// Mesma mensagem que o backend devolve — não revela se o e-mail tem cadastro
const GENERIC_MESSAGE =
    "Se esse e-mail estiver cadastrado, você vai receber um link para redefinir a senha em instantes.";

export function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [sending, setSending] = useState(false);
    const [done, setDone] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!email.trim()) return;
        setSending(true);
        setError(null);
        try {
            await api.post("/password/forgot", { email: email.trim() });
            setDone(true);
        } catch (err) {
            // só erro de validação (e-mail mal digitado) ou servidor fora do ar chega aqui
            setError(getApiErrorMessage(err, "Não foi possível enviar agora. Tente novamente."));
        } finally {
            setSending(false);
        }
    }

    return (
        <AuthPageShell title="Esqueci minha senha" subtitle="Enviaremos um link para você criar uma nova senha">
            {done ? (
                <div className="flex flex-col items-center gap-3 text-center">
                    <MailCheck size={40} strokeWidth={1.5} className="text-mc-violet-700" />
                    <p className="text-sm text-mc-ink/80">{GENERIC_MESSAGE}</p>
                    <p className="text-xs text-mc-ink/60">Confira também a caixa de spam. O link vale por 1 hora.</p>
                    <Link to="/login" className="mt-2 text-sm text-mc-violet-950 underline underline-offset-4 decoration-mc-gold-500">
                        Voltar para o login
                    </Link>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                        <Label htmlFor="email" className="text-sm text-mc-ink/70">E-mail da sua conta</Label>
                        <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="seu@email.com"
                            autoComplete="email"
                            required
                            className={inputClassName}
                        />
                        {error && <p className="text-xs text-red-800 mt-1">{error}</p>}
                    </div>
                    <Button
                        type="submit"
                        disabled={sending || !email.trim()}
                        className="facet-cut-sm bg-mc-violet-950 hover:bg-mc-violet-800 text-mc-sand-50 rounded-none w-full h-10 text-sm font-medium"
                    >
                        {sending ? "Enviando..." : "Enviar link"}
                    </Button>
                    <Link to="/login" className="text-center text-sm text-mc-ink/70 underline underline-offset-4 hover:text-mc-violet-950">
                        Lembrei a senha
                    </Link>
                </form>
            )}
        </AuthPageShell>
    );
}
