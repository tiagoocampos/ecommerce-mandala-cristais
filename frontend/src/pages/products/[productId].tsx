import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../../services/api";
import { Header } from "../../components/Header";
import { Loading } from "../../components/Loading";
import { ProtectedRoute } from "../../components/ProtectedRoute";
import { Button } from "../../components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../../components/ui/alert-dialog";
import { getAuthHeaders, getStoredUser } from "../../lib/auth";
import { formatPrice, showApiError } from "../../lib/utils-api";
import type { Product } from "../../types";

export function ProductDetailsPage() {
  const { productId } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const user = getStoredUser();
  const isAdmin = user?.role === "ADMIN";

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  async function fetchProduct() {
    const headers = getAuthHeaders();
    if (!headers || !productId) return;

    try {
      setLoading(true);
    
      const res = await api.get(`/products?disabled=false`, { headers });
      const found = (res.data as Product[]).find((p) => p.id === productId) ?? null;
      setProduct(found);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        showApiError(error, "Erro ao carregar detalhes do produto");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    const headers = getAuthHeaders();
    if (!headers) return;

    try {
      setSubmitting(true);
      await api.delete(`/product?product_id=${id}`, { headers });
      navigate("/products");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        showApiError(error, "Erro ao deletar produto");
      }
    } finally {
      setSubmitting(false);
    }
  }

  const title = useMemo(() => product?.name ?? "Detalhes do produto", [product?.name]);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#baa88d]">
        <Header />

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between gap-4 mb-4">
            <button
              onClick={() => navigate(-1)}
              className="text-gray-100 text-sm hover:underline"
            >
              ← Voltar
            </button>

            <h1 className="text-gray-100 text-xl font-semibold">{title}</h1>

            <div className="w-24" />
          </div>

          {loading ? (
            <Loading />
          ) : !product ? (
            <p className="text-gray-100">Produto não encontrado.</p>
          ) : (
            <div className="bg-gray-200 rounded-md overflow-hidden">
              <img
                src={product.banner}
                alt={product.name}
                className="w-full h-72 object-cover"
              />

              <div className="p-4 sm:p-6 flex flex-col gap-4">
                <div>
                  <p className="text-xs text-gray-600">ID</p>
                  <p className="text-sm text-gray-800 break-all">{product.id}</p>
                </div>

                <div>
                  <p className="text-xs text-gray-600">Nome</p>
                  <p className="text-sm text-gray-800">{product.name}</p>
                </div>

                <div>
                  <p className="text-xs text-gray-600">Preço</p>
                  <p className="text-sm text-gray-800 font-semibold">{formatPrice(product.price)}</p>
                </div>

                <div>
                  <p className="text-xs text-gray-600">Descrição</p>
                  <p className="text-sm text-gray-800">{product.description}</p>
                </div>

                {product.disabled && (
                  <span className="text-xs text-red-800 font-medium">Desativado</span>
                )}

                {isAdmin && (
                  <div className="flex items-center justify-end gap-3 pt-2">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          disabled={submitting}
                          className="bg-red-800 hover:bg-red-700 text-white"
                        >
                          Deletar
                        </Button>
                      </AlertDialogTrigger>

                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Tem certeza de que deseja excluir {product.name}?
                          </AlertDialogTitle>

                          <AlertDialogDescription>
                            Todos os dados relacionados a este produto serão removidos permanentemente.
                            Esta ação não poderá ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>

                        <AlertDialogFooter>
                          <AlertDialogCancel disabled={submitting}>Cancelar</AlertDialogCancel>
                          <AlertDialogAction disabled={submitting} onClick={() => handleDelete(product.id)}>
                            Confirmar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}

