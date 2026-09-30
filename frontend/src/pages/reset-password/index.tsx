import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { AuthPageShell } from "../../components/store/AuthPageShell";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { getApiErrorMessage, inputClassName } from "../../lib/utils-api";
import { api } from "../../services/api";

const MIN_PASSWORD = 6; // mesma regra do cadastro (backend: passwordField)

export function ResetPassword() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token") ?? "";

    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [tokenInvalid, setTokenInvalid] = useState(!/^[a-f0-9]{64}$/.test(token));

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        if (password.length < MIN_PASSWORD) {
            setError(`A senha deve ter no mínimo ${MIN_PASSWORD} caracteres.`);
            return;
        }
        if (password !== confirm) {
            setError("As senhas não conferem.");
            return;
        }

        setSaving(true);
        try {
            await api.post("/password/reset", { token, new_password: password });
            toast.success("Senha redefinida! Entre com a sua nova senha.");
            navigate("/login", { replace: true });
        } catch (err) {
            const message = getApiErrorMessage(err, "Não foi possível redefinir a senha. Tente novamente.");
            if (message.includes("inválido ou expirado")) setTokenInvalid(true);
            else setError(message);
        } finally {
            setSaving(false);
        }
    }

    if (tokenInvalid) {
        return (
            <AuthPageShell title="Link inválido ou expirado">
                <div className="flex flex-col items-center gap-3 text-center">
                    <p className="text-sm text-mc-ink/80">
                        Este link de redefinição não vale mais — ele expira em 1 hora e só pode ser usado uma vez.
                    </p>
                    <Link
                        to="/esqueci-senha"
                        className="mt-1 inline-flex h-10 items-center justify-center rounded-full bg-mc-violet-950 px-6 text-sm font-medium text-mc-sand-50 hover:bg-mc-violet-800"
                    >
                        Solicitar um novo link
                    </Link>
                </div>
            </AuthPageShell>
        );
    }

    return (
        <AuthPageShell title="Criar nova senha" subtitle="Escolha uma senha com pelo menos 6 caracteres">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                    <Label htmlFor="new-password" className="text-sm text-mc-ink/70">Nova senha</Label>
                    <Input
                        id="new-password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="new-password"
                        required
                        className={inputClassName}
                    />
                </div>
                <div className="flex flex-col gap-1">
                    <Label htmlFor="confirm-password" className="text-sm text-mc-ink/70">Confirme a nova senha</Label>
                    <Input
                        id="confirm-password"
                        type="password"
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                        autoComplete="new-password"
                        required
                        className={inputClassName}
                    />
                    {error && <p className="text-xs text-red-800 mt-1">{error}</p>}
                </div>
                <Button
                    type="submit"
                    disabled={saving}
                    className="facet-cut-sm bg-mc-violet-950 hover:bg-mc-violet-800 text-mc-sand-50 rounded-none w-full h-10 text-sm font-medium"
                >
                    {saving ? "Salvando..." : "Salvar nova senha"}
                </Button>
            </form>
        </AuthPageShell>
    );
}
