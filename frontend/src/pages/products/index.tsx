import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

import { api } from "../../services/api";
import { Header } from "../../components/Header";
import { Loading } from "../../components/Loading";
import { ProtectedRoute } from "../../components/ProtectedRoute";
import { Button } from "../../components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../../components/ui/alert-dialog";
import { getAuthHeaders, getStoredUser } from "../../lib/auth";
import {
  applyFieldErrors,
  formatPrice,
  inputClassName,
  buttonClassName,
  showApiError,
} from "../../lib/utils-api";
import type { Category, Product } from "../../types";

export function Products() {
  const navigate = useNavigate();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showDisabled, setShowDisabled] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const [errors, setErrors] = useState({
    name: "",
    description: "",
    price: "",
    category_id: "",
  });

  const user = getStoredUser();
  const isAdmin = user?.role === "ADMIN";

  useEffect(() => {
    fetchData();
  }, [showDisabled]);

  async function fetchData() {
    const headers = getAuthHeaders();
    if (!headers) return;

    setLoading(true);

    try {
      const disabledParam = showDisabled ? "true" : "false";
      const [productsRes, categoriesRes] = await Promise.all([
        api.get(`/products?disabled=${disabledParam}`, { headers }),
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

  async function handleCreateProduct() {
    const headers = getAuthHeaders();
    if (!headers) return;

    try {
      setErrors({ name: "", description: "", price: "", category_id: "" });
      setSubmitting(true);

      if (!file) {
        toast.error("Selecione uma imagem para o produto", { position: "top-center" });
        return;
      }

      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      const priceInCents = Math.round(parseFloat(price.replace(",", ".")) * 100);
      formData.append("price", String(priceInCents));
      formData.append("category_id", categoryId);
      formData.append("file", file);

      await api.post("/product", formData, {
        headers: {
          ...headers,
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Produto criado com sucesso!", { position: "top-center" });
      setName("");
      setDescription("");
      setPrice("");
      setCategoryId("");
      setFile(null);
      setShowForm(false);
      await fetchData();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (
          !applyFieldErrors(
            error,
            { name: "", description: "", price: "", category_id: "" },
            setErrors
          )
        ) {
          showApiError(error, "Erro ao criar produto");
        }
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleEnableProduct(product: Product) {
    const headers = getAuthHeaders();
    if (!headers) return;

    try {
      setSubmitting(true);
      await api.put(`/product/${product.id}/active`, null, { headers });
      toast.success("Produto ativado com sucesso!", { position: "top-center" });
      await fetchData();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        showApiError(error, "Erro ao ativar produto");
      }
    } finally {
      setSubmitting(false);
    }
  }

  const categoryNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of categories) map.set(c.id, c.name);
    return map;
  }, [categories]);

  function getCategoryName(categoryId?: string): string {
    if (!categoryId) return "";
    return categoryNameById.get(categoryId) ?? "";
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#baa88d]">
        <Header />

        <main className="px-4 sm:px-6 lg:px-8 py-6 max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <h1 className="text-gray-100 text-xl font-semibold">Produtos</h1>

            {isAdmin && (
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <button
                  onClick={() => setShowDisabled(!showDisabled)}
                  className="bg-gray-200 text-amber-950 text-sm px-4 py-3 rounded-sm hover:bg-gray-300 w-full sm:w-auto"
                >
                  {showDisabled ? "Ver ativos" : "Ver desativados"}
                </button>

                <button
                  onClick={() => setShowForm(!showForm)}
                  className="bg-amber-950 text-gray-100 text-sm px-4 py-3 rounded-sm hover:bg-amber-950/80 w-full sm:w-auto"
                >
                  {showForm ? "Cancelar" : "Novo produto"}
                </button>
              </div>
            )}
          </div>

          {isAdmin && showForm && (
            <div className="bg-gray-200 rounded-md p-4 mb-6 flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-700">Nome</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  type="text"
                  placeholder="Nome do produto"
                  className={inputClassName}
                />
                {errors.name && <p className="text-xs text-red-800">{errors.name}</p>}
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-700">Descrição</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descrição do produto"
                  rows={3}
                  className={inputClassName}
                />
                {errors.description && (
                  <p className="text-xs text-red-800">{errors.description}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-sm text-gray-700">Preço (R$)</label>
                  <input
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    type="text"
                    placeholder="Ex: 15,00"
                    className={inputClassName}
                  />
                  {errors.price && <p className="text-xs text-red-800">{errors.price}</p>}
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-sm text-gray-700">Categoria</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className={inputClassName}
                  >
                    <option value="">Selecione</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  {errors.category_id && (
                    <p className="text-xs text-red-800">{errors.category_id}</p>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-700">Imagem</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  className="text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-amber-950 file:text-gray-100 hover:file:bg-amber-950/80"
                />
              </div>

              <Button
                onClick={handleCreateProduct}
                disabled={submitting}
                className={`${buttonClassName} sm:w-auto sm:px-6 cursor-pointer text-sm font-medium`}
              >
                {submitting ? <Loading /> : "Criar produto"}
              </Button>
            </div>
          )}

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

                  <div className="p-3 flex flex-col gap-2">
                    <span className="text-xs text-gray-500">
                      {getCategoryName(product.category_id)}
                    </span>
                    <h2 className="text-sm font-medium text-gray-700">{product.name}</h2>
                    <p className="text-xs text-gray-500 line-clamp-2">{product.description}</p>
                    <span className="text-sm font-semibold text-amber-950 mt-1">
                      {formatPrice(product.price)}
                    </span>

                    {product.disabled && (
                      <div className="flex flex-col gap-2">
                        <span className="text-xs text-red-800 font-medium">
                          Desativado
                        </span>

                        <Button
                          onClick={() => handleEnableProduct(product)}
                          disabled={submitting}
                          className="bg-amber-950 hover:bg-amber-950/80 text-gray-100 text-xs w-full"
                        >
                          {submitting ? <Loading /> : "Ativar"}
                        </Button>
                      </div>
                    )}

                    <div className="flex items-center gap-2 pt-1">
                      <Button
                        className="bg-amber-950 hover:bg-amber-950/80 text-gray-100 text-xs w-full"
                        onClick={() => navigate(`/products/${product.id}`)}
                      >
                        Ver detalhes
                      </Button>
                      
                    </div>

                    {isAdmin && product.disabled && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            disabled
                            className="bg-red-800 hover:bg-red-700 text-white text-xs w-full opacity-60"
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
                            <AlertDialogCancel disabled>Cancelar</AlertDialogCancel>
                            <AlertDialogAction disabled>Confirmar</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
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

