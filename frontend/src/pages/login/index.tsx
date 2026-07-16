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
        <div className="min-h-screen bg-[#baa88d] flex justify-center items-center px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-4 w-full p-6 rounded max-w-xs sm:max-w-sm">
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
                    {errors.password && <p className="text-xs text-red-800">{errors.password}</p>}
                </div>

                <Button
                    onClick={handleLogin}
                    disabled={loading}
                    className={`${buttonClassName} cursor-pointer text-sm font-medium`}
                >
                    {loading ? <Loading /> : "Entrar"}
                </Button>

                <p className="text-sm text-gray-100 text-center">
                    Não tem conta?{" "}
                    <Link
                        to="/register"
                        className="text-foreground underline hover:text-gray-300 underline-offset-4"
                    >
                        Cadastrar
                    </Link>
                </p>
            </div>
        </div>
    );
}
