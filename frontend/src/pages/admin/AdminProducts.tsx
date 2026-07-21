import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import {
    Plus,
    Edit3,
    Archive,
    Eye,
    Search,
    ImageIcon,
    X,
} from "lucide-react";
import { Loading } from "../../components/Loading";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { ConfirmDelete } from "../../components/ui/confirm-delete";
import { formatPrice, showApiError } from "../../lib/utils-api";
import { api } from "../../services/api";
import type { Product, Category } from "../../types";

type ProductForm = {
    name: string;
    description: string;
    price: string;
    promo_price: string;
    stock: string;
    category_id: string;
    file: File | null;
};

const emptyForm: ProductForm = {
    name: "",
    description: "",
    price: "",
    promo_price: "",
    stock: "",
    category_id: "",
    file: null,
};

export function AdminProducts() {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [search, setSearch] = useState("");
    const [showArchived, setShowArchived] = useState(false);

    // modal state
    const [modalOpen, setModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState<ProductForm>(emptyForm);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [formErrors, setFormErrors] = useState<Partial<Record<keyof ProductForm, string>>>({});

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [productsRes, catsRes] = await Promise.all([
                api.get<Product[]>("/products"),
                api.get<Category[]>("/category"),
            ]);
            setProducts(productsRes.data);
            setCategories(catsRes.data);
        } catch (error) {
            showApiError(error, "Erro ao carregar dados");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const filteredProducts = products.filter((p) => {
        if (!showArchived && p.disabled) return false;
        if (search) {
            const q = search.toLowerCase();
            return (
                p.name.toLowerCase().includes(q) ||
                p.category?.name?.toLowerCase().includes(q)
            );
        }
        return true;
    });

    function resetModal() {
        setForm(emptyForm);
        setEditingId(null);
        setPreviewUrl(null);
        setFormErrors({});
    }

    function openCreate() {
        resetModal();
        setModalOpen(true);
    }

    function openEdit(product: Product) {
        setForm({
            name: product.name,
            description: product.description,
            price: String(product.price),
            promo_price: product.promo_price ? String(product.promo_price) : "",
            stock: String(product.stock),
            category_id: product.category_id || "",
            file: null,
        });
        setEditingId(product.id);
        setPreviewUrl(product.banner || null);
        setFormErrors({});
        setModalOpen(true);
    }

    function validate(): boolean {
        const errors: typeof formErrors = {};
        if (!form.name.trim()) errors.name = "Nome é obrigatório";
        if (!form.description.trim()) errors.description = "Descrição é obrigatória";
        if (!form.price || isNaN(Number(form.price))) errors.price = "Preço inválido";
        if (!form.stock || isNaN(Number(form.stock))) errors.stock = "Estoque inválido";
        if (!form.category_id) errors.category_id = "Selecione uma categoria";
        if (form.promo_price && !isNaN(Number(form.promo_price)) && Number(form.promo_price) >= Number(form.price)) {
            errors.promo_price = "Promoção deve ser menor que o preço normal";
        }
        if (!editingId && !form.file) {
            errors.file = "Imagem é obrigatória";
        }
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    }

    async function handleSave() {
        if (!validate()) return;
        setSubmitting(true);

        const fd = new FormData();
        fd.append("name", form.name);
        fd.append("description", form.description);
        fd.append("price", form.price);
        fd.append("stock", form.stock);
        fd.append("category_id", form.category_id);
        if (form.promo_price) fd.append("promo_price", form.promo_price);
        if (form.file) fd.append("file", form.file);

        try {
            if (editingId) {
                await api.put(`/product?product_id=${editingId}`, fd);
                toast.success("Produto atualizado!");
            } else {
                await api.post("/product", fd);
                toast.success("Produto criado!");
            }
            setModalOpen(false);
            resetModal();
            await fetchData();
        } catch (error) {
            showApiError(error, `Erro ao ${editingId ? "atualizar" : "criar"} produto`);
        } finally {
            setSubmitting(false);
        }
    }

    async function handleArchive(product: Product) {
        try {
            await api.delete(`/product?product_id=${product.id}`);
            toast.success(`"${product.name}" arquivado`);
            await fetchData();
        } catch (error) {
            showApiError(error, "Erro ao arquivar produto");
        }
    }

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0] || null;
        setForm((prev) => ({ ...prev, file }));
        if (file) {
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        }
    }

    if (loading) {
        return (
            <div className="p-6">
                <Loading />
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6">
            {/* header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <div>
                    <h1 className="font-display text-2xl sm:text-3xl text-mc-violet-950">
                        Produtos
                    </h1>
                    <p className="text-sm text-mc-ink/60">
                        {products.filter((p) => !p.disabled).length} ativos ·{" "}
                        {products.filter((p) => p.disabled).length} arquivados
                    </p>
                </div>
                <Button
                    onClick={openCreate}
                    className="bg-mc-violet-950 hover:bg-mc-violet-800 text-mc-sand-50 rounded-full self-start"
                >
                    <Plus size={16} /> Novo produto
                </Button>
            </div>

            {/* filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <div className="relative flex-1 max-w-xs">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-mc-ink/40" />
                    <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Buscar produto..."
                        className="pl-8 bg-white border-mc-violet-950/15"
                    />
                </div>
                <label className="flex items-center gap-2 text-sm text-mc-ink/70 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={showArchived}
                        onChange={(e) => setShowArchived(e.target.checked)}
                        className="accent-mc-violet-950"
                    />
                    Mostrar arquivados
                </label>
            </div>

            {/* table */}
            <div className="overflow-x-auto rounded-lg border border-mc-violet-950/10">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-mc-blush-100 text-mc-violet-950 text-left">
                            <th className="py-3 px-4 font-medium">Produto</th>
                            <th className="py-3 px-4 font-medium">Categoria</th>
                            <th className="py-3 px-4 font-medium">Preço</th>
                            <th className="py-3 px-4 font-medium">Estoque</th>
                            <th className="py-3 px-4 font-medium">Status</th>
                            <th className="py-3 px-4 font-medium text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-mc-violet-950/10">
                        {filteredProducts.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="py-10 text-center text-mc-ink/50">
                                    Nenhum produto encontrado.
                                </td>
                            </tr>
                        ) : (
                            filteredProducts.map((product) => {
                                const lowStock = product.stock < 5;
                                const archived = !!product.disabled;
                                return (
                                    <tr key={product.id} className="bg-white hover:bg-mc-sand-50/80">
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-md overflow-hidden bg-mc-blush-100 shrink-0">
                                                    {product.banner ? (
                                                        <img
                                                            src={product.banner}
                                                            alt={product.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-lg">
                                                            💎
                                                        </div>
                                                    )}
                                                </div>
                                                <span className="font-medium text-mc-violet-950 line-clamp-1">
                                                    {product.name}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-mc-ink/70">
                                            {product.category?.name || "—"}
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="space-y-0.5">
                                                <span className="text-mc-violet-950 font-medium">
                                                    {formatPrice(product.price)}
                                                </span>
                                                {product.promo_price && (
                                                    <div className="text-xs text-emerald-700">
                                                        Promo: {formatPrice(product.promo_price)}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span
                                                className={`inline-flex items-center gap-1 ${
                                                    lowStock
                                                        ? "text-red-700 font-medium"
                                                        : "text-mc-ink/70"
                                                }`}
                                            >
                                                {lowStock && <span className="w-1.5 h-1.5 rounded-full bg-red-500" />}
                                                {product.stock}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span
                                                className={`inline-block text-[11px] font-medium px-2 py-0.5 rounded-full border ${
                                                    archived
                                                        ? "bg-gray-100 text-gray-600 border-gray-200"
                                                        : "bg-emerald-100 text-emerald-800 border-emerald-300"
                                                }`}
                                            >
                                                {archived ? "Arquivado" : "Ativo"}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    type="button"
                                                    onClick={() => openEdit(product)}
                                                    className="p-1.5 hover:bg-mc-blush-100 rounded-md text-mc-violet-950"
                                                    title="Editar"
                                                >
                                                    <Edit3 size={15} />
                                                </button>
                                                {archived ? (
                                                    <span
                                                        className="p-1.5 rounded-md text-gray-300 cursor-not-allowed inline-block"
                                                        title="Reativação temporariamente indisponível — o backend não expõe campo disabled no update"
                                                    >
                                                        <Archive size={15} />
                                                    </span>
                                                ) : (
                                                    <ConfirmDelete
                                                        trigger={
                                                            <button
                                                                type="button"
                                                                className="p-1.5 hover:bg-red-50 rounded-md text-red-600"
                                                                title="Arquivar"
                                                            >
                                                                <Archive size={15} />
                                                            </button>
                                                        }
                                                        title={`Arquivar "${product.name}"?`}
                                                        description="O produto será arquivado (soft delete) e não aparecerá mais na loja. É possível reativá-lo quando o backend suportar."
                                                        confirmText="Arquivar"
                                                        onConfirm={() => handleArchive(product)}
                                                    />
                                                )}
                                                <button
                                                    type="button"
                                                    className="p-1.5 hover:bg-mc-blush-100 rounded-md text-mc-ink/50"
                                                    title="Ver na loja"
                                                    onClick={() =>
                                                        window.open(
                                                            `/produto/${product.slug}`,
                                                            "_blank"
                                                        )
                                                    }
                                                >
                                                    <Eye size={15} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* modal */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-start justify-center pt-6 sm:pt-16 px-4">
                    <div
                        className="fixed inset-0 bg-black/40"
                        onClick={() => !submitting && setModalOpen(false)}
                    />
                    <div className="relative bg-white rounded-xl border border-mc-violet-950/10 shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="font-display text-xl text-mc-violet-950">
                                {editingId ? "Editar produto" : "Novo produto"}
                            </h2>
                            <button
                                type="button"
                                onClick={() => setModalOpen(false)}
                                disabled={submitting}
                                className="text-mc-ink/40 hover:text-mc-violet-950"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {/* imagem */}
                            <div>
                                <Label className="text-sm text-mc-ink/70">Imagem</Label>
                                <div className="mt-1 flex items-center gap-3">
                                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-mc-blush-100 border border-mc-violet-950/10 shrink-0">
                                        {previewUrl ? (
                                            <img
                                                src={previewUrl}
                                                alt="Preview"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-mc-ink/30">
                                                <ImageIcon size={20} />
                                            </div>
                                        )}
                                    </div>
                                    <label className="cursor-pointer text-sm text-mc-violet-950 hover:underline">
                                        {previewUrl ? "Trocar imagem" : "Selecionar imagem"}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            className="hidden"
                                        />
                                    </label>
                                </div>
                                {formErrors.file && (
                                    <p className="text-xs text-red-600 mt-1">{formErrors.file}</p>
                                )}
                            </div>

                            <div>
                                <Label className="text-sm text-mc-ink/70">Nome</Label>
                                <Input
                                    value={form.name}
                                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                                    className="bg-white border-mc-violet-950/15"
                                />
                                {formErrors.name && (
                                    <p className="text-xs text-red-600 mt-1">{formErrors.name}</p>
                                )}
                            </div>

                            <div>
                                <Label className="text-sm text-mc-ink/70">Descrição</Label>
                                <textarea
                                    value={form.description}
                                    onChange={(e) =>
                                        setForm((p) => ({ ...p, description: e.target.value }))
                                    }
                                    rows={3}
                                    className="w-full rounded-lg border border-mc-violet-950/15 bg-white px-3 py-2 text-sm outline-none focus:border-mc-violet-950/30 resize-none"
                                />
                                {formErrors.description && (
                                    <p className="text-xs text-red-600 mt-1">
                                        {formErrors.description}
                                    </p>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-sm text-mc-ink/70">Preço (centavos)</Label>
                                    <Input
                                        value={form.price}
                                        onChange={(e) =>
                                            setForm((p) => ({ ...p, price: e.target.value }))
                                        }
                                        className="bg-white border-mc-violet-950/15"
                                        placeholder="Ex: 15000"
                                    />
                                    {formErrors.price && (
                                        <p className="text-xs text-red-600 mt-1">
                                            {formErrors.price}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <Label className="text-sm text-mc-ink/70">
                                        Preço promocional
                                    </Label>
                                    <Input
                                        value={form.promo_price}
                                        onChange={(e) =>
                                            setForm((p) => ({
                                                ...p,
                                                promo_price: e.target.value,
                                            }))
                                        }
                                        className="bg-white border-mc-violet-950/15"
                                        placeholder="Opcional"
                                    />
                                    {formErrors.promo_price && (
                                        <p className="text-xs text-red-600 mt-1">
                                            {formErrors.promo_price}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-sm text-mc-ink/70">Estoque</Label>
                                    <Input
                                        value={form.stock}
                                        onChange={(e) =>
                                            setForm((p) => ({ ...p, stock: e.target.value }))
                                        }
                                        className="bg-white border-mc-violet-950/15"
                                        placeholder="Ex: 50"
                                    />
                                    {formErrors.stock && (
                                        <p className="text-xs text-red-600 mt-1">
                                            {formErrors.stock}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <Label className="text-sm text-mc-ink/70">Categoria</Label>
                                    <select
                                        value={form.category_id}
                                        onChange={(e) =>
                                            setForm((p) => ({
                                                ...p,
                                                category_id: e.target.value,
                                            }))
                                        }
                                        className="w-full h-8 rounded-lg border border-mc-violet-950/15 bg-white px-2.5 text-sm outline-none focus:border-mc-violet-950/30"
                                    >
                                        <option value="">Selecione...</option>
                                        {categories.map((cat) => (
                                            <option key={cat.id} value={cat.id}>
                                                {cat.name}
                                            </option>
                                        ))}
                                    </select>
                                    {formErrors.category_id && (
                                        <p className="text-xs text-red-600 mt-1">
                                            {formErrors.category_id}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end gap-3">
                            <Button
                                variant="ghost"
                                onClick={() => setModalOpen(false)}
                                disabled={submitting}
                                className="text-mc-ink/60"
                            >
                                Cancelar
                            </Button>
                            <Button
                                onClick={handleSave}
                                disabled={submitting}
                                className="bg-mc-violet-950 hover:bg-mc-violet-800 text-mc-sand-50"
                            >
                                {submitting
                                    ? "Salvando..."
                                    : editingId
                                    ? "Atualizar"
                                    : "Criar produto"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

