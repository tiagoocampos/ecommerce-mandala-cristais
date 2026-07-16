import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { api } from "../../services/api";
import { Header } from "../../components/Header";
import { Loading } from "../../components/Loading";
import { ProtectedRoute } from "../../components/ProtectedRoute";
import { Button } from "../../components/ui/button";
import { clearAuth, getAuthHeaders } from "../../lib/auth";
import { buttonClassName, formatDate, showApiError } from "../../lib/utils-api";
import type { User } from "../../types";

export function Profile() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchProfile();
    }, []);

    async function fetchProfile() {
        const headers = getAuthHeaders();
        if (!headers) return;

        try {
            const response = await api.get("/me", { headers });
            setUser(response.data);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                showApiError(error, "Erro ao carregar perfil");
            }
        } finally {
            setLoading(false);
        }
    }

    function handleLogout() {
        clearAuth();
        navigate("/login");
    }

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-[#baa88d]">
                <Header />

                <main className="px-4 sm:px-6 lg:px-8 py-6 max-w-5xl mx-auto">
                    <h1 className="text-gray-100 text-xl font-semibold mb-4">Meu Perfil</h1>

                    {loading ? (
                        <Loading />
                    ) : user ? (
                        <div className="bg-gray-200 rounded-md p-6 flex flex-col gap-4 max-w-md">
                            <div className="flex flex-col gap-1">
                                <span className="text-xs text-gray-500">Nome</span>
                                <span className="text-sm font-medium text-gray-700">{user.name}</span>
                            </div>

                            <div className="flex flex-col gap-1">
                                <span className="text-xs text-gray-500">Email</span>
                                <span className="text-sm font-medium text-gray-700">{user.email}</span>
                            </div>

                            <div className="flex flex-col gap-1">
                                <span className="text-xs text-gray-500">Função</span>
                                <span className="text-sm font-medium text-gray-700">
                                    {user.role === "ADMIN" ? "Administrador" : "Funcionário"}
                                </span>
                            </div>

                            {user.createdAt && (
                                <div className="flex flex-col gap-1">
                                    <span className="text-xs text-gray-500">Data de cadastro</span>
                                    <span className="text-sm font-medium text-gray-700">
                                        {formatDate(user.createdAt)}
                                    </span>
                                </div>
                            )}

                            <Button
                                onClick={handleLogout}
                                className={`${buttonClassName} cursor-pointer text-sm font-medium mt-2`}
                            >
                                Sair
                            </Button>
                        </div>
                    ) : (
                        <p className="text-gray-200 text-sm">Não foi possível carregar o perfil.</p>
                    )}
                </main>
            </div>
        </ProtectedRoute>
    );
}
