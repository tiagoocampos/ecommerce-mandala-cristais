import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { Plus, Edit3, Trash2, X } from "lucide-react";
import { Loading } from "../../components/Loading";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { ConfirmDelete } from "../../components/ui/confirm-delete";
import { showApiError } from "../../lib/utils-api";
import { api } from "../../services/api";
import type { Category, Product } from "../../types";

export function AdminCategories() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // modal
    const [modalOpen, setModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [name, setName] = useState("");
    const [nameError, setNameError] = useState("");

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [catsRes, prodsRes] = await Promise.all([
                api.get<Category[]>("/category"),
                api.get<Product[]>("/products"),
            ]);
            setCategories(catsRes.data);
            setProducts(prodsRes.data);
        } catch (error) {
            showApiError(error, "Erro ao carregar categorias");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    function openCreate() {
        setEditingId(null);
        setName("");
        setNameError("");
        setModalOpen(true);
    }

    function openEdit(cat: Category) {
        setEditingId(cat.id);
        setName(cat.name);
        setNameError("");
        setModalOpen(true);
    }

    function getProductCount(categoryId: string): number {
        return products.filter((p) => p.category_id === categoryId).length;
    }

    async function handleSave() {
        if (!name.trim()) {
            setNameError("O nome é obrigatório");
            return;
        }
        setSubmitting(true);
        setNameError("");

        try {
            if (editingId) {
                await api.put(`/category/${editingId}`, { name: name.trim() });
                toast.success("Categoria atualizada!");
            } else {
                await api.post("/category", { name: name.trim() });
                toast.success("Categoria criada!");
            }
            setModalOpen(false);
            await fetchData();
        } catch (error) {
            showApiError(error, `Erro ao ${editingId ? "atualizar" : "criar"} categoria`);
        } finally {
            setSubmitting(false);
        }
    }

    async function handleDelete(cat: Category) {
        try {
            await api.delete(`/category/${cat.id}`);
            toast.success(`Categoria "${cat.name}" removida`);
            await fetchData();
        } catch (error: unknown) {
            // Tratar erro de integridade referencial
            const msg = error instanceof Object && typeof error === "object" && "response" in error
                ? String((error as any).response?.data?.error || "")
                : "";
            if (
                msg.toLowerCase().includes("produto") ||
                msg.toLowerCase().includes("foreign key") ||
                msg.toLowerCase().includes("integrity")
            ) {
                toast.error(
                    `Não é possível excluir: existem produtos na categoria "${cat.name}"`,
                    { position: "top-center" }
                );
            } else {
                showApiError(error, "Erro ao excluir categoria");
            }
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
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="font-display text-2xl sm:text-3xl text-mc-violet-950">
                        Categorias
                    </h1>
                    <p className="text-sm text-mc-ink/60">
                        {categories.length} categorias cadastradas
                    </p>
                </div>
                <Button
                    onClick={openCreate}
                    className="bg-mc-violet-950 hover:bg-mc-violet-800 text-mc-sand-50 rounded-full self-start"
                >
                    <Plus size={16} /> Nova categoria
                </Button>
            </div>

            <div className="overflow-x-auto rounded-lg border border-mc-violet-950/10">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-mc-blush-100 text-mc-violet-950 text-left">
                            <th className="py-3 px-4 font-medium">Nome</th>
                            <th className="py-3 px-4 font-medium">Slug</th>
                            <th className="py-3 px-4 font-medium">Produtos</th>
                            <th className="py-3 px-4 font-medium text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-mc-violet-950/10">
                        {categories.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="py-10 text-center text-mc-ink/50">
                                    Nenhuma categoria encontrada.
                                </td>
                            </tr>
                        ) : (
                            categories.map((cat) => {
                                const prodCount = getProductCount(cat.id);
                                return (
                                    <tr key={cat.id} className="bg-white hover:bg-mc-sand-50/80">
                                        <td className="py-3 px-4 font-medium text-mc-violet-950">
                                            {cat.name}
                                        </td>
                                        <td className="py-3 px-4 text-mc-ink/70">
                                            {cat.slug}
                                        </td>
                                        <td className="py-3 px-4">
                                            <span
                                                className={`text-sm ${
                                                    prodCount > 0
                                                        ? "text-mc-ink/70"
                                                        : "text-mc-ink/40"
                                                }`}
                                            >
                                                {prodCount}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    type="button"
                                                    onClick={() => openEdit(cat)}
                                                    className="p-1.5 hover:bg-mc-blush-100 rounded-md text-mc-violet-950"
                                                    title="Editar"
                                                >
                                                    <Edit3 size={15} />
                                                </button>
                                                <ConfirmDelete
                                                    trigger={
                                                        <button
                                                            type="button"
                                                            className="p-1.5 hover:bg-red-50 rounded-md text-red-600"
                                                            title="Excluir"
                                                        >
                                                            <Trash2 size={15} />
                                                        </button>
                                                    }
                                                    title={`Excluir "${cat.name}"?`}
                                                    description={
                                                        prodCount > 0
                                                            ? `Esta categoria possui ${prodCount} produto(s). A exclusão pode ser rejeitada pelo sistema.`
                                                            : "Tem certeza que deseja excluir esta categoria? Esta ação não pode ser desfeita."
                                                    }
                                                    confirmText="Excluir"
                                                    onConfirm={() => handleDelete(cat)}
                                                />
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
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                    <div
                        className="fixed inset-0 bg-black/40"
                        onClick={() => !submitting && setModalOpen(false)}
                    />
                    <div className="relative bg-white rounded-xl border border-mc-violet-950/10 shadow-xl w-full max-w-md p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="font-display text-xl text-mc-violet-950">
                                {editingId ? "Editar categoria" : "Nova categoria"}
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
                            <div>
                                <Label className="text-sm text-mc-ink/70">Nome</Label>
                                <Input
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="bg-white border-mc-violet-950/15"
                                    placeholder="Ex: Pedras Preciosas"
                                />
                                {nameError && (
                                    <p className="text-xs text-red-600 mt-1">{nameError}</p>
                                )}
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
                                    : "Criar"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

