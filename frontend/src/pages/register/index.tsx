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
        <div className="min-h-screen bg-[#baa88d] flex justify-center items-center px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-4 w-full p-6 rounded max-w-xs sm:max-w-sm">
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
                    {errors.password && <p className="text-xs text-red-800">{errors.password}</p>}
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

                <p className="text-sm text-gray-100 text-center">
                    Já tem conta?{" "}
                    <Link
                        to="/login"
                        className="text-foreground underline hover:text-gray-300 underline-offset-4"
                    >
                        Entrar
                    </Link>
                </p>
            </div>
        </div>
    );
}
