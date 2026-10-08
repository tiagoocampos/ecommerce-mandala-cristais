import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import {
    Plus,
    Edit3,
    Archive,
    Eye,
    Search,
    ImageIcon,
    X,
    Sparkles,
    Loader2,
    ArchiveRestore,
    Star,
} from "lucide-react";
import { Loading } from "../../components/Loading";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { ConfirmDelete } from "../../components/ui/confirm-delete";
import { formatPrice, getApiErrorMessage, showApiError } from "../../lib/utils-api";
import { MAX_EXTRA_IMAGES, validateImageFile } from "../../lib/productImages";
import { api } from "../../services/api";
import type { Product, Category } from "../../types";
import { ProductImage } from "../../components/store/ProductImage";

type ProductImageItem = { id: string; url: string; position: number };

type ProductForm = {
    name: string;
    description: string;
    price: string;
    promo_price: string;
    stock: string;
    category_id: string;
    file: File | null;
    weight_grams: string;
    height_cm: string;
    width_cm: string;
    length_cm: string;
    meta_description: string;
    image_alt_text: string;
    featured: boolean;
};

const META_DESCRIPTION_MAX = 160;

type AIAssistResponse = {
    description: string;
    meta_description: string;
    image_alt_text: string;
    suggested_category_id: string | null;
};

const emptyForm: ProductForm = {
    name: "",
    description: "",
    price: "",
    promo_price: "",
    stock: "",
    category_id: "",
    file: null,
    weight_grams: "",
    height_cm: "",
    width_cm: "",
    length_cm: "",
    meta_description: "",
    image_alt_text: "",
    featured: false,
};

const SHIPPING_FIELDS = [
    { key: "weight_grams", label: "Peso (g)", placeholder: "Ex: 250" },
    { key: "height_cm", label: "Altura (cm)", placeholder: "Ex: 5" },
    { key: "width_cm", label: "Largura (cm)", placeholder: "Ex: 12" },
    { key: "length_cm", label: "Comprimento (cm)", placeholder: "Ex: 16" },
] as const;

function hasShippingData(product: Product): boolean {
    return !!product.weight_grams && !!product.height_cm && !!product.width_cm && !!product.length_cm;
}

export function AdminProducts() {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [search, setSearch] = useState("");
    const [view, setView] = useState<"active" | "archived" | "all">("active");

    // modal state
    const [modalOpen, setModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState<ProductForm>(emptyForm);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    // galeria: arquivos novos (ainda não enviados) e fotos já salvas (na edição)
    const [extraFiles, setExtraFiles] = useState<{ file: File; url: string }[]>([]);
    const [savedImages, setSavedImages] = useState<ProductImageItem[]>([]);
    const [imagesBusy, setImagesBusy] = useState<string | null>(null);
    const [formErrors, setFormErrors] = useState<Partial<Record<keyof ProductForm, string>>>({});

    // "Pedir pra IA": só preenche o formulário; quem salva é o lojista
    const [aiKeywords, setAiKeywords] = useState("");
    const [aiLoading, setAiLoading] = useState(false);
    const [aiSuggestedCategoryId, setAiSuggestedCategoryId] = useState<string | null>(null);
    const [seoOpen, setSeoOpen] = useState(false);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            // Ativos + arquivados: sem o parâmetro, o backend devolve só os ativos
            // (e o filtro "mostrar arquivados" nunca tinha o que mostrar)
            const [activeRes, archivedRes, catsRes] = await Promise.all([
                api.get<Product[]>("/products?disabled=false"),
                api.get<Product[]>("/products?disabled=true"),
                api.get<Category[]>("/category"),
            ]);
            setProducts([...activeRes.data, ...archivedRes.data]);
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

    // Link vindo do dashboard ("Repor estoque"): /admin/produtos?editar=<id> abre a edição direto
    const [searchParams, setSearchParams] = useSearchParams();
    const editParam = searchParams.get("editar");
    useEffect(() => {
        if (!editParam || products.length === 0) return;
        const product = products.find((p) => p.id === editParam);
        if (product) openEdit(product);
        setSearchParams({}, { replace: true });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [editParam, products]);

    const activeCount = products.filter((p) => !p.disabled).length;
    const archivedCount = products.length - activeCount;

    const filteredProducts = products.filter((p) => {
        if (view === "active" && p.disabled) return false;
        if (view === "archived" && !p.disabled) return false;
        if (search) {
            const q = search.toLowerCase();
            return (
                p.name.toLowerCase().includes(q) ||
                p.category?.name?.toLowerCase().includes(q)
            );
        }
        return true;
    });

    // ---- Fotos adicionais (galeria) ----
    function clearExtraFiles() {
        setExtraFiles((files) => {
            files.forEach((f) => URL.revokeObjectURL(f.url));
            return [];
        });
    }

    function handleExtraFilesChange(e: React.ChangeEvent<HTMLInputElement>) {
        const picked = Array.from(e.target.files ?? []);
        e.target.value = ""; // permite escolher o mesmo arquivo de novo
        if (picked.length === 0) return;

        const errors = picked.map(validateImageFile).filter((m): m is string => !!m);
        if (errors.length) {
            toast.error(errors.join(" "));
            return;
        }
        const total = savedImages.length + extraFiles.length + picked.length;
        if (total > MAX_EXTRA_IMAGES) {
            toast.error(`Máximo de ${MAX_EXTRA_IMAGES} fotos adicionais por produto.`);
            return;
        }
        setExtraFiles((files) => [...files, ...picked.map((file) => ({ file, url: URL.createObjectURL(file) }))]);
    }

    function removeExtraFile(index: number) {
        setExtraFiles((files) => {
            URL.revokeObjectURL(files[index]!.url);
            return files.filter((_, i) => i !== index);
        });
    }

    async function handleDeleteSavedImage(imageId: string) {
        setImagesBusy(imageId);
        try {
            const { data } = await api.delete<ProductImageItem[]>(`/product/images/${imageId}`);
            setSavedImages(data);
            toast.success("Foto removida");
            await fetchData();
        } catch (error) {
            showApiError(error, "Erro ao remover a foto");
        } finally {
            setImagesBusy(null);
        }
    }

    async function handleSetMainImage(imageId: string) {
        setImagesBusy(imageId);
        try {
            const { data } = await api.patch<{ banner: string; images: ProductImageItem[] }>(
                `/product/images/${imageId}/main`
            );
            setSavedImages(data.images);
            setPreviewUrl(data.banner);
            setForm((p) => ({ ...p, file: null }));
            toast.success("Imagem principal trocada");
            await fetchData();
        } catch (error) {
            showApiError(error, "Erro ao trocar a imagem principal");
        } finally {
            setImagesBusy(null);
        }
    }

    function resetModal() {
        setForm(emptyForm);
        setEditingId(null);
        setPreviewUrl(null);
        clearExtraFiles();
        setSavedImages([]);
        setFormErrors({});
        setAiKeywords("");
        setAiSuggestedCategoryId(null);
        setSeoOpen(false);
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
            weight_grams: product.weight_grams ? String(product.weight_grams) : "",
            height_cm: product.height_cm ? String(product.height_cm) : "",
            width_cm: product.width_cm ? String(product.width_cm) : "",
            length_cm: product.length_cm ? String(product.length_cm) : "",
            meta_description: product.meta_description ?? "",
            image_alt_text: product.image_alt_text ?? "",
            featured: !!product.featured,
        });
        setEditingId(product.id);
        setPreviewUrl(product.banner || null);
        clearExtraFiles();
        setSavedImages(product.images ?? []);
        setFormErrors({});
        setAiKeywords("");
        setAiSuggestedCategoryId(null);
        setSeoOpen(false);
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
            errors.file = "A imagem principal é obrigatória";
        }
        for (const field of SHIPPING_FIELDS) {
            const value = form[field.key].trim();
            if (value && (!/^\d+$/.test(value) || Number(value) <= 0)) {
                errors[field.key] = "Use um número inteiro maior que zero";
            }
        }
        if (form.meta_description.trim().length > META_DESCRIPTION_MAX) {
            errors.meta_description = `Máximo de ${META_DESCRIPTION_MAX} caracteres`;
            setSeoOpen(true);
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
        fd.append("featured", form.featured ? "true" : "false");
        if (form.promo_price) fd.append("promo_price", form.promo_price);
        if (form.file) fd.append("file", form.file);
        for (const field of SHIPPING_FIELDS) {
            const value = form[field.key].trim();
            // na edição, enviar vazio limpa o valor salvo
            if (value || editingId) fd.append(field.key, value);
        }
        for (const key of ["meta_description", "image_alt_text"] as const) {
            const value = form[key].trim();
            // na edição, enviar vazio limpa o valor salvo
            if (value || editingId) fd.append(key, value);
        }

        try {
            if (editingId) {
                await api.put(`/product?product_id=${editingId}`, fd);
                toast.success("Produto atualizado!");
                // Fotos novas escolhidas na edição: enviadas depois do PUT dar certo.
                // Se falhar, o produto continua salvo — só avisa.
                if (extraFiles.length > 0) {
                    const imagesFd = new FormData();
                    extraFiles.forEach(({ file }) => imagesFd.append("images", file));
                    try {
                        await api.post(`/product/${editingId}/images`, imagesFd);
                    } catch (error) {
                        toast.warning(
                            `Produto salvo, mas as fotos adicionais não foram enviadas: ${getApiErrorMessage(error, "tente de novo")}`
                        );
                    }
                }
            } else {
                // criação: extras no mesmo FormData, repetindo o campo `images`
                extraFiles.forEach(({ file }) => fd.append("images", file));
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

    async function handleAIAssist() {
        const name = form.name.trim();
        if (!name) return;

        setAiLoading(true);
        try {
            const categoryName = categories.find((c) => c.id === form.category_id)?.name ?? "";
            const { data } = await api.post<AIAssistResponse>("/admin/products/ai-assist", {
                name,
                category_hint: categoryName,
                ...(aiKeywords.trim() && { keywords: aiKeywords.trim() }),
            });

            // Só preenche o formulário — nada é salvo até o lojista clicar em salvar
            setForm((p) => ({
                ...p,
                description: data.description,
                meta_description: data.meta_description,
                image_alt_text: data.image_alt_text,
            }));
            setFormErrors((errors) => ({ ...errors, description: undefined, meta_description: undefined }));
            setSeoOpen(true);
            // Sugestão de categoria nunca é aplicada sozinha
            setAiSuggestedCategoryId(data.suggested_category_id);
            toast.success("Textos gerados — revise antes de salvar");
        } catch (error) {
            showApiError(error, "Não foi possível gerar com IA agora. Você pode preencher manualmente.");
        } finally {
            setAiLoading(false);
        }
    }

    const aiSuggestedCategory =
        aiSuggestedCategoryId && aiSuggestedCategoryId !== form.category_id
            ? categories.find((c) => c.id === aiSuggestedCategoryId) ?? null
            : null;

    async function handleReactivate(product: Product) {
        const fd = new FormData();
        fd.append("disabled", "false");
        try {
            await api.put(`/product?product_id=${product.id}`, fd);
            toast.success(`"${product.name}" reativado e de volta à loja`);
            await fetchData();
        } catch (error) {
            showApiError(error, "Erro ao reativar produto");
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
                        {activeCount} ativos · {archivedCount} arquivados
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
                <div role="tablist" aria-label="Filtrar produtos" className="inline-flex self-start rounded-full border border-mc-violet-950/15 bg-white p-0.5 text-sm">
                    {([
                        ["active", `Ativos (${activeCount})`],
                        ["archived", `Arquivados (${archivedCount})`],
                        ["all", `Todos (${products.length})`],
                    ] as const).map(([value, label]) => (
                        <button
                            key={value}
                            type="button"
                            role="tab"
                            aria-selected={view === value}
                            onClick={() => setView(value)}
                            className={`rounded-full px-3.5 py-1.5 transition-colors ${
                                view === value
                                    ? "bg-mc-violet-950 text-mc-sand-50"
                                    : "text-mc-ink/70 hover:bg-mc-blush-100"
                            }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
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
                                    {view === "active" && archivedCount > 0 && !search ? (
                                        <>
                                            Nenhum produto ativo. Há {archivedCount} arquivado(s) —{" "}
                                            <button
                                                type="button"
                                                onClick={() => setView("archived")}
                                                className="font-medium text-mc-violet-700 underline underline-offset-2 hover:text-mc-violet-950"
                                            >
                                                ver arquivados para reativar
                                            </button>
                                        </>
                                    ) : (
                                        "Nenhum produto encontrado."
                                    )}
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
                                                    <ProductImage src={product.banner} alt={product.name} iconSize={18} />
                                                </div>
                                                <div className="min-w-0">
                                                    <span className="font-medium text-mc-violet-950 line-clamp-1">
                                                        {product.name}
                                                    </span>
                                                    {product.featured && (
                                                        <span className="mt-0.5 mr-1 inline-flex items-center gap-0.5 text-[10px] font-medium px-1.5 py-0.5 rounded-full border bg-mc-violet-700 text-white border-mc-violet-700">
                                                            <Star size={9} className="fill-mc-gold-400 text-mc-gold-400" /> Destaque
                                                        </span>
                                                    )}
                                                    {!hasShippingData(product) && (
                                                        <button
                                                            type="button"
                                                            onClick={() => openEdit(product)}
                                                            title="Sem peso/dimensões o frete usa um pacote padrão (300 g, 11×11×11 cm). Clique para completar."
                                                            className="mt-0.5 inline-block text-[10px] font-medium px-1.5 py-0.5 rounded-full border bg-mc-gold-500/20 text-mc-gold-800 border-mc-gold-500/50 hover:bg-mc-gold-500/30"
                                                        >
                                                            Sem peso cadastrado
                                                        </button>
                                                    )}
                                                </div>
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
                                                    <div className="text-xs text-mc-success-700">
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
                                                        ? "bg-mc-sand-100 text-mc-ink/60 border-mc-violet-950/10"
                                                        : "bg-mc-success-100 text-mc-success-700 border-mc-success-700/25"
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
                                                    <button
                                                        type="button"
                                                        onClick={() => handleReactivate(product)}
                                                        className="p-1.5 hover:bg-mc-success-100 rounded-md text-mc-success-700"
                                                        title="Reativar (volta a aparecer na loja)"
                                                    >
                                                        <ArchiveRestore size={15} />
                                                    </button>
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
                                                        description="O produto sai da loja, mas não é apagado. Você pode reativá-lo depois em &quot;Mostrar arquivados&quot;."
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
                            {/* imagem principal */}
                            <div>
                                <Label className="text-sm text-mc-ink/70">Imagem principal</Label>
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
                                            accept="image/jpeg,image/png"
                                            onChange={handleFileChange}
                                            className="hidden"
                                        />
                                    </label>
                                </div>
                                {formErrors.file && (
                                    <p className="text-xs text-red-600 mt-1">{formErrors.file}</p>
                                )}
                            </div>

                            {/* fotos adicionais (galeria) */}
                            <div>
                                <Label className="text-sm text-mc-ink/70">
                                    Fotos adicionais (opcional, até {MAX_EXTRA_IMAGES})
                                </Label>
                                <p className="text-xs text-mc-ink/50 mb-2">
                                    Aparecem na página do produto: o cliente arrasta para o lado para ver. JPEG ou PNG, até 5 MB cada.
                                </p>
                                <div className="grid grid-cols-4 gap-2">
                                    {savedImages.map((image) => (
                                        <div key={image.id} className="group relative aspect-square overflow-hidden rounded-lg border border-mc-violet-950/10 bg-mc-blush-100">
                                            <img src={image.url} alt="" className="h-full w-full object-cover" />
                                            <div className="absolute inset-x-0 bottom-0 flex flex-col gap-0.5 bg-mc-violet-950/75 p-1">
                                                <button
                                                    type="button"
                                                    disabled={imagesBusy !== null}
                                                    onClick={() => handleSetMainImage(image.id)}
                                                    className="rounded px-1 py-0.5 text-[10px] font-medium text-white hover:bg-white/15 disabled:opacity-50"
                                                >
                                                    Tornar principal
                                                </button>
                                                <ConfirmDelete
                                                    trigger={
                                                        <button
                                                            type="button"
                                                            disabled={imagesBusy !== null}
                                                            className="rounded px-1 py-0.5 text-[10px] font-medium text-red-200 hover:bg-white/15 disabled:opacity-50"
                                                        >
                                                            Remover
                                                        </button>
                                                    }
                                                    title="Remover esta foto?"
                                                    description="A foto sai da galeria do produto e é apagada. A imagem principal não é afetada."
                                                    confirmText="Remover"
                                                    onConfirm={() => handleDeleteSavedImage(image.id)}
                                                    disabled={imagesBusy !== null}
                                                />
                                            </div>
                                            {imagesBusy === image.id && (
                                                <div className="absolute inset-0 flex items-center justify-center bg-white/60">
                                                    <Loader2 size={18} className="animate-spin text-mc-violet-700" />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    {extraFiles.map((item, index) => (
                                        <div key={item.url} className="relative aspect-square overflow-hidden rounded-lg border border-dashed border-mc-gold-500/70 bg-mc-blush-100">
                                            <img src={item.url} alt="" className="h-full w-full object-cover" />
                                            <span className="absolute left-1 top-1 rounded bg-mc-gold-500 px-1 text-[9px] font-semibold text-mc-violet-950">
                                                nova
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => removeExtraFile(index)}
                                                aria-label="Remover foto nova"
                                                className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-white/90 text-red-600 hover:bg-white"
                                            >
                                                <X size={12} />
                                            </button>
                                        </div>
                                    ))}
                                    {savedImages.length + extraFiles.length < MAX_EXTRA_IMAGES && (
                                        <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-mc-violet-950/25 text-mc-ink/50 hover:bg-mc-blush-100 hover:text-mc-violet-950">
                                            <Plus size={18} />
                                            <span className="text-[10px]">Adicionar</span>
                                            <input
                                                type="file"
                                                accept="image/jpeg,image/png"
                                                multiple
                                                onChange={handleExtraFilesChange}
                                                className="hidden"
                                            />
                                        </label>
                                    )}
                                </div>
                                {editingId && extraFiles.length > 0 && (
                                    <p className="text-[11px] text-mc-ink/50 mt-1">
                                        As fotos marcadas como “nova” são enviadas ao clicar em Atualizar.
                                    </p>
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

                            {/* Pedir pra IA — preenche descrição, SEO e sugere categoria; não salva */}
                            <div className="rounded-lg border border-mc-violet-700/20 bg-mc-blush-100/60 p-3">
                                <div className="flex flex-col sm:flex-row gap-2">
                                    <Input
                                        value={aiKeywords}
                                        onChange={(e) => setAiKeywords(e.target.value)}
                                        maxLength={200}
                                        placeholder="Palavras-chave (opcional): amor próprio, sono..."
                                        aria-label="Palavras-chave para a IA"
                                        className="bg-white border-mc-violet-950/15 flex-1"
                                    />
                                    <Button
                                        type="button"
                                        onClick={handleAIAssist}
                                        disabled={!form.name.trim() || aiLoading}
                                        className="bg-mc-violet-700 hover:bg-mc-violet-800 text-white shrink-0"
                                    >
                                        {aiLoading ? (
                                            <Loader2 size={14} className="animate-spin" />
                                        ) : (
                                            <Sparkles size={14} />
                                        )}
                                        {aiLoading ? "Pensando..." : "Pedir pra IA"}
                                    </Button>
                                </div>
                                <p className="mt-1.5 text-[11px] text-mc-ink/60">
                                    {form.name.trim()
                                        ? "Gera descrição, meta descrição e texto da imagem, e sugere a categoria. Nada é salvo até você clicar em salvar."
                                        : "Preencha o nome do produto para usar a IA."}
                                </p>
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

                            {/* SEO e acessibilidade */}
                            <details
                                open={seoOpen}
                                onToggle={(e) => setSeoOpen((e.target as HTMLDetailsElement).open)}
                                className="rounded-lg border border-mc-violet-950/10 px-3 py-2"
                            >
                                <summary className="cursor-pointer text-sm font-medium text-mc-violet-950">
                                    SEO e acessibilidade (opcional)
                                </summary>
                                <div className="mt-3 space-y-3 pb-1">
                                    <div>
                                        <div className="flex items-center justify-between">
                                            <Label className="text-sm text-mc-ink/70">
                                                Meta descrição (resultado do Google)
                                            </Label>
                                            <span
                                                className={`text-[11px] tabular-nums ${
                                                    form.meta_description.trim().length > META_DESCRIPTION_MAX
                                                        ? "text-red-600 font-medium"
                                                        : "text-mc-ink/50"
                                                }`}
                                            >
                                                {form.meta_description.trim().length}/{META_DESCRIPTION_MAX}
                                            </span>
                                        </div>
                                        <textarea
                                            value={form.meta_description}
                                            onChange={(e) =>
                                                setForm((p) => ({ ...p, meta_description: e.target.value }))
                                            }
                                            rows={2}
                                            className="w-full rounded-lg border border-mc-violet-950/15 bg-white px-3 py-2 text-sm outline-none focus:border-mc-violet-950/30 resize-none"
                                        />
                                        {formErrors.meta_description && (
                                            <p className="text-xs text-red-600 mt-1">
                                                {formErrors.meta_description}
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        <Label className="text-sm text-mc-ink/70">
                                            Texto alternativo da imagem (descreva o que a foto mostra)
                                        </Label>
                                        <Input
                                            value={form.image_alt_text}
                                            onChange={(e) =>
                                                setForm((p) => ({ ...p, image_alt_text: e.target.value }))
                                            }
                                            maxLength={250}
                                            placeholder="Ex: Pedra de ametista bruta roxa sobre fundo claro"
                                            className="bg-white border-mc-violet-950/15"
                                        />
                                    </div>
                                </div>
                            </details>

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
                                    {aiSuggestedCategory && (
                                        <p className="mt-1 text-[11px] text-mc-ink/70">
                                            <Sparkles size={11} className="inline -mt-0.5 text-mc-violet-700" /> IA
                                            sugere: <strong>{aiSuggestedCategory.name}</strong> —{" "}
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setForm((p) => ({ ...p, category_id: aiSuggestedCategory.id }))
                                                }
                                                className="font-medium text-mc-violet-700 underline hover:text-mc-violet-950"
                                            >
                                                usar essa?
                                            </button>
                                        </p>
                                    )}
                                    {formErrors.category_id && (
                                        <p className="text-xs text-red-600 mt-1">
                                            {formErrors.category_id}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* destaque na home */}
                            <label className="flex items-start gap-2.5 rounded-lg border border-mc-violet-950/10 p-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={form.featured}
                                    onChange={(e) => setForm((p) => ({ ...p, featured: e.target.checked }))}
                                    className="mt-0.5 h-4 w-4 accent-mc-violet-700"
                                />
                                <span>
                                    <span className="flex items-center gap-1 text-sm font-medium text-mc-violet-950">
                                        <Star size={13} className="fill-mc-gold-400 text-mc-gold-400" />
                                        Destacar na home
                                    </span>
                                    <span className="block text-xs text-mc-ink/60">
                                        Aparece no carrossel logo no topo da loja. O ideal são poucos produtos
                                        por vez (até 6–8) — hoje há{" "}
                                        {products.filter((p) => p.featured && !p.disabled).length} em destaque.
                                    </span>
                                </span>
                            </label>

                            {/* frete */}
                            <fieldset className="rounded-lg border border-mc-violet-950/10 p-3">
                                <legend className="px-1 text-sm font-medium text-mc-violet-950">
                                    Frete — produto já embalado
                                </legend>
                                <p className="text-xs text-mc-ink/60 mb-3">
                                    Usado para calcular o frete. Sem esses dados, a cotação usa um
                                    pacote padrão (300 g, 11×11×11 cm), que pode cobrar errado.
                                </p>
                                <div className="grid grid-cols-2 gap-3">
                                    {SHIPPING_FIELDS.map((field) => (
                                        <div key={field.key}>
                                            <Label className="text-sm text-mc-ink/70">{field.label}</Label>
                                            <Input
                                                value={form[field.key]}
                                                onChange={(e) =>
                                                    setForm((p) => ({ ...p, [field.key]: e.target.value }))
                                                }
                                                inputMode="numeric"
                                                className="bg-white border-mc-violet-950/15"
                                                placeholder={field.placeholder}
                                            />
                                            {formErrors[field.key] && (
                                                <p className="text-xs text-red-600 mt-1">
                                                    {formErrors[field.key]}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </fieldset>
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

