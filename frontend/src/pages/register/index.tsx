import { Link } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { api } from "../../services/api";
import { Button } from "../../components/ui/button";
import { Loading } from "../../components/Loading";
import { applyFieldErrors, inputClassName, buttonClassName, labelClassName, showApiError } from "../../lib/utils-api";

export function Register() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [errors, setErrors] = useState({ name: "", email: "", password: "" });
    const [loading, setLoading] = useState(false);

    async function handleRegister() {
        try {
            if (!name || !email || !password) {
                toast.error("Preencha corretamente os campos", { position: "top-center" });
                return;
            }

            if (password !== confirmPassword) {
                toast.error("As senhas devem ser iguais", { position: "top-center" });
                return;
            }

            setErrors({ name: "", email: "", password: "" });
            setLoading(true);

            await api.post("/users", { name, email, password });
            toast.success("Cadastro realizado com sucesso!", { position: "top-center" });
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (!applyFieldErrors(error, { name: "", email: "", password: "" }, setErrors)) {
                    showApiError(error, "Erro ao cadastrar");
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
                    <h1 className="text-mc-violet-950 text-2xl font-semibold font-display">Cadastrar</h1>
                    <p className="text-mc-violet-800 text-sm mt-1">Crie sua conta para começar</p>
                </div>

                <div className="h-1 w-full bg-mc-violet-950/20 rounded-full mb-6" />

                <div className="flex justify-center">
                    <div className="w-full max-w-sm bg-mc-blush-100 rounded-md p-6 flex flex-col gap-4 border border-mc-violet-950/10">

                        <div className="flex flex-col gap-1">
                            <label className={labelClassName}>Usuário</label>
                            <input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                type="text"
                                placeholder="Seu nome de usuário"
                                className={inputClassName}
                            />
                            {errors.name && <p className="text-xs text-red-800">{errors.name}</p>}
                        </div>

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
                                placeholder="mínimo 6 caracteres"
                                className={inputClassName}
                            />
                            {errors.password && (
                                <p className="text-xs text-red-800">{errors.password}</p>
                            )}
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className={labelClassName}>Confirmar Senha</label>
                            <input
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                type="password"
                                placeholder="Repita a senha"
                                className={inputClassName}
                            />
                            {confirmPassword && password !== confirmPassword && (
                                <p className="text-xs text-red-800">As senhas devem ser iguais</p>
                            )}
                        </div>

                        <Button
                            onClick={handleRegister}
                            disabled={loading}
                            className={`${buttonClassName} cursor-pointer text-sm font-medium`}
                        >
                            {loading ? <Loading /> : "Cadastrar"}
                        </Button>

                        <p className="text-sm text-gray-700 text-center">
                            Já tem conta?{" "}
                            <Link
                                to="/login"
                                className="text-amber-950 underline hover:text-amber-900 underline-offset-4"
                            >
                                Entrar
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

