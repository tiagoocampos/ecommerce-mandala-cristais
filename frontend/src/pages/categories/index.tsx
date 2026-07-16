import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { api } from "../../services/api";
import { Header } from "../../components/Header";
import { Loading } from "../../components/Loading";
import { ProtectedRoute } from "../../components/ProtectedRoute";
import { Button } from "../../components/ui/button";
import { getAuthHeaders, getStoredUser } from "../../lib/auth";
import {
    applyFieldErrors,
    formatDate,
    formatPrice,
    inputClassName,
    buttonClassName,
    showApiError,
} from "../../lib/utils-api";
import type { Category, Product } from "../../types";

export function Categories() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [name, setName] = useState("");
    const [errors, setErrors] = useState({ name: "" });

    const [expandedCategoryId, setExpandedCategoryId] = useState<string | null>(null);
    const [categoryProducts, setCategoryProducts] = useState<Record<string, Product[]>>({});
    const [loadingProducts, setLoadingProducts] = useState<string | null>(null);

    const user = getStoredUser();
    const isAdmin = user?.role === "ADMIN";

    useEffect(() => {
        fetchCategories();
    }, []);

    async function fetchCategories() {
        const headers = getAuthHeaders();
        if (!headers) return;

        try {
            const response = await api.get("/category", { headers });
            setCategories(response.data);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                showApiError(error, "Erro ao carregar categorias");
            }
        } finally {
            setLoading(false);
        }
    }

    async function handleCreateCategory() {
        const headers = getAuthHeaders();
        if (!headers) return;

        try {
            if (!name.trim()) {
                toast.error("Informe o nome da categoria", { position: "top-center" });
                return;
            }

            setErrors({ name: "" });
            setSubmitting(true);

            await api.post("/category", { name }, { headers });
            toast.success("Categoria criada com sucesso!", { position: "top-center" });
            setName("");
            await fetchCategories();
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (!applyFieldErrors(error, { name: "" }, setErrors)) {
                    showApiError(error, "Erro ao criar categoria");
                }
            }
        } finally {
            setSubmitting(false);
        }
    }

    async function handleToggleProducts(categoryId: string) {
        // Se já está expandida, só fecha
        if (expandedCategoryId === categoryId) {
            setExpandedCategoryId(null);
            return;
        }

        setExpandedCategoryId(categoryId);

        // Se já buscou os produtos dessa categoria antes, não busca de novo
        if (categoryProducts[categoryId]) return;

        const headers = getAuthHeaders();
        if (!headers) return;

        try {
            setLoadingProducts(categoryId);

            const response = await api.get(`/category/product?category_id=${categoryId}`, { headers });

            setCategoryProducts((prev) => ({
                ...prev,
                [categoryId]: response.data,
            }));
        } catch (error) {
            if (axios.isAxiosError(error)) {
                showApiError(error, "Erro ao carregar produtos da categoria");
            }
            setExpandedCategoryId(null);
        } finally {
            setLoadingProducts(null);
        }
    }

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-[#baa88d]">
                <Header />

                <main className="px-4 sm:px-6 lg:px-8 py-6 max-w-5xl mx-auto">
                    <h1 className="text-gray-100 text-xl font-semibold mb-4">Categorias</h1>

                    {isAdmin && (
                        <div className="bg-gray-200 rounded-md p-4 mb-6 flex flex-col sm:flex-row gap-3 sm:items-end">
                            <div className="flex flex-col gap-1 flex-1">
                                <label className="text-sm text-gray-700">Nova categoria</label>
                                <input
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    type="text"
                                    placeholder="Nome da categoria"
                                    className={inputClassName}
                                />
                                {errors.name && <p className="text-xs text-red-800">{errors.name}</p>}
                            </div>
                            <Button
                                onClick={handleCreateCategory}
                                disabled={submitting}
                                className={`${buttonClassName} sm:w-auto sm:px-6 cursor-pointer text-sm font-medium`}
                            >
                                {submitting ? <Loading /> : "Criar"}
                            </Button>
                        </div>
                    )}

                    {loading ? (
                        <Loading />
                    ) : categories.length === 0 ? (
                        <p className="text-gray-200 text-sm">Nenhuma categoria encontrada.</p>
                    ) : (
                        <div className="flex flex-col gap-3">
                            {categories.map((category) => (
                                <div
                                    key={category.id}
                                    className="bg-gray-200 rounded-md p-4 flex flex-col gap-2"
                                >
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                        <span className="text-sm font-medium text-gray-700">
                                            {category.name}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            Criada em {formatDate(category.createdAt)}
                                        </span>
                                        <button
                                            onClick={() => handleToggleProducts(category.id)}
                                            className="text-xs text-amber-950 underline text-left"
                                        >
                                            {expandedCategoryId === category.id
                                                ? "Ocultar produtos"
                                                : "Ver produtos"}
                                        </button>
                                    </div>

                                    {expandedCategoryId === category.id && (
                                        <div className="flex flex-col gap-2 border-t border-gray-300 pt-2">
                                            {loadingProducts === category.id ? (
                                                <Loading />
                                            ) : categoryProducts[category.id]?.length ? (
                                                categoryProducts[category.id].map((product) => (
                                                    <div
                                                        key={product.id}
                                                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 bg-gray-100 rounded-sm p-2"
                                                    >
                                                        <span className="text-xs text-gray-700">
                                                            {product.name}
                                                        </span>
                                                        <span className="text-xs text-gray-500">
                                                            {formatPrice(product.price)}
                                                        </span>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-xs text-gray-500">
                                                    Nenhum produto nessa categoria.
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </main>
            </div>
        </ProtectedRoute>
    );
}
