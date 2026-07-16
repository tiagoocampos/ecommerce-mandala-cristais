import { useEffect, useState } from "react";
import axios from "axios";
import { api } from "../../services/api";
import { Header } from "../../components/Header";
import { Loading } from "../../components/Loading";
import { ProtectedRoute } from "../../components/ProtectedRoute";
import { getAuthHeaders } from "../../lib/auth";
import { formatPrice, showApiError } from "../../lib/utils-api";
import type { Category, Product } from "../../types";

export function Home() {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    async function fetchData() {
        const headers = getAuthHeaders();
        if (!headers) return;

        try {
            const [productsRes, categoriesRes] = await Promise.all([
                api.get("/products?disabled=false", { headers }),
                api.get("/category", { headers }),
            ]);

            setProducts(productsRes.data);
            setCategories(categoriesRes.data);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                showApiError(error, "Erro ao carregar produtos");
            }
        } finally {
            setLoading(false);
        }
    }

    function getCategoryName(categoryId?: string): string {
        if (!categoryId) return "";
        return categories.find((c) => c.id === categoryId)?.name ?? "";
    }

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-[#baa88d]">
                <Header />

                <main className="px-4 sm:px-6 lg:px-8 py-6 max-w-5xl mx-auto">
                    <h1 className="text-gray-100 text-xl font-semibold mb-4">Produtos</h1>

                    {loading ? (
                        <Loading />
                    ) : products.length === 0 ? (
                        <p className="text-gray-200 text-sm">Nenhum produto encontrado.</p>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {products.map((product) => (
                                <div
                                    key={product.id}
                                    className="bg-gray-200 rounded-md overflow-hidden flex flex-col"
                                >
                                    <img
                                        src={product.banner}
                                        alt={product.name}
                                        className="w-full h-40 object-cover"
                                    />
                                    <div className="p-3 flex flex-col gap-1">
                                        <span className="text-xs text-gray-500">
                                            {product.category?.name || getCategoryName(product.category_id)}
                                        </span>
                                        <h2 className="text-sm font-medium text-gray-700">
                                            {product.name}
                                        </h2>
                                        <p className="text-xs text-gray-500 line-clamp-2">
                                            {product.description}
                                        </p>
                                        <span className="text-sm font-semibold text-amber-950 mt-1">
                                            {formatPrice(product.price)}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </main>
            </div>
        </ProtectedRoute>
    );
}
