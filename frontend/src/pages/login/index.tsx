import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { api } from "../../services/api";
import { Button } from "../../components/ui/button";
import { Loading } from "../../components/Loading";
import { applyFieldErrors, inputClassName, buttonClassName, labelClassName } from "../../lib/utils-api";

export function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({ email: "", password: "" });

    const navigate = useNavigate();

    // mantém o mesmo padrão visual das telas do store:
    // fundo, header e container centralizado.


    async function handleLogin() {
        try {
            if (!email || !password) {
                toast.error("Preencha todos os campos", { position: "top-center" });
                return;
            }

            setErrors({ email: "", password: "" });
            setLoading(true);

            const response = await api.post("/session", { email, password });

            localStorage.setItem("token", response.data.token);
            localStorage.setItem(
                "user",
                JSON.stringify({
                    id: response.data.id,
                    name: response.data.name,
                    email: response.data.email,
                    role: response.data.role,
                })
            );

            toast.success("Login realizado com sucesso!", { position: "top-center" });
            navigate("/orders");
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const data = error.response?.data;

                if (data?.details) {
                    applyFieldErrors(error, { email: "", password: "" }, setErrors);
                } else {
                    const field = data?.field;
                    const message = data?.error || "Erro ao fazer login";

                    if (field === "email") {
                        setErrors((prev) => ({ ...prev, email: message }));
                    } else if (field === "password") {
                        setErrors((prev) => ({ ...prev, password: message }));
                    } else {
                        toast.error(message, { position: "top-center" });
                    }
                }
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-mc-sand-50">
            <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-2xl mx-auto">
                <div className="text-center mb-6">
                    <h1 className="text-mc-violet-950 text-2xl font-semibold font-display">Entrar</h1>
                    <p className="text-mc-violet-800 text-sm mt-1">Acesse sua conta para continuar</p>
                </div>

                <div className="h-1 w-full bg-mc-violet-950/20 rounded-full mb-6" />

                <div className="flex justify-center">
                    <div className="w-full max-w-sm bg-mc-blush-100 rounded-md p-6 flex flex-col gap-4 border border-mc-violet-950/10">

                        <div className="flex flex-col gap-1">
                            <label className={labelClassName}>Email</label>
                            <input
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                type="email"
                                placeholder="seu@email.com"
                                className={inputClassName}
                            />
                            {errors.email && <p className="text-xs text-red-800">{errors.email}</p>}
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className={labelClassName}>Senha</label>
                            <input
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                type="password"
                                placeholder="sua senha"
                                className={inputClassName}
                            />
                            {errors.password && (
                                <p className="text-xs text-red-800">{errors.password}</p>
                            )}
                        </div>

                        <Button
                            onClick={handleLogin}
                            disabled={loading}
                            className={`${buttonClassName} cursor-pointer text-sm font-medium`}
                        >
                            {loading ? <Loading /> : "Entrar"}
                        </Button>

                        <p className="text-sm text-gray-700 text-center">
                            Não tem conta?{" "}
                            <Link
                                to="/register"
                                className="text-amber-950 underline hover:text-amber-900 underline-offset-4"
                            >
                                Cadastrar
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

