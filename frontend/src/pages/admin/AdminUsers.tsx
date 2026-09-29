import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Trash2, ChevronRight } from "lucide-react";
import { Loading } from "../../components/Loading";
import { ConfirmDelete } from "../../components/ui/confirm-delete";
import { formatDate, showApiError } from "../../lib/utils-api";
import { getStoredUser } from "../../lib/auth";
import { api } from "../../services/api";
import { RoleBadge } from "../../components/admin/RoleBadge";
import type { AdminUserListItem } from "../../types/admin";

export function AdminUsers() {
    const navigate = useNavigate();
    const [users, setUsers] = useState<AdminUserListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [search, setSearch] = useState("");

    const currentUser = getStoredUser();

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await api.get<AdminUserListItem[]>("/admin/users");
            setUsers(data);
        } catch (error) {
            showApiError(error, "Erro ao carregar usuários");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    async function handleDelete(user: AdminUserListItem) {
        setSubmitting(true);
        try {
            await api.delete(`/admin/users/${user.id}`);
            toast.success(`Usuário "${user.name}" removido`);
            await fetchUsers();
        } catch (error) {
            showApiError(error, "Erro ao remover usuário");
        } finally {
            setSubmitting(false);
        }
    }

    const isSelf = (user: AdminUserListItem) => user.id === currentUser?.id;

    const q = search.trim().toLowerCase();
    const filtered = q
        ? users.filter(
              (u) =>
                  u.name.toLowerCase().includes(q) ||
                  u.email.toLowerCase().includes(q) ||
                  (u.phone ?? "").includes(q)
          )
        : users;

    if (loading) {
        return (
            <div className="p-6">
                <Loading />
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
                <div>
                    <h1 className="font-display text-2xl sm:text-3xl text-mc-violet-950 mb-1">
                        Usuários
                    </h1>
                    <p className="text-sm text-mc-ink/60">
                        {users.length} usuário(s) cadastrado(s)
                    </p>
                </div>
                <input
                    type="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar por nome, e-mail ou telefone"
                    aria-label="Buscar usuários"
                    className="w-full sm:w-72 rounded-lg border border-input bg-white px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20"
                />
            </div>

            <div className="overflow-x-auto rounded-lg border border-mc-violet-950/10">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-mc-blush-100 text-mc-violet-950 text-left">
                            <th className="py-3 px-4 font-medium">Nome</th>
                            <th className="py-3 px-4 font-medium">E-mail</th>
                            <th className="py-3 px-4 font-medium">Telefone</th>
                            <th className="py-3 px-4 font-medium">Papel</th>
                            <th className="py-3 px-4 font-medium text-right">Pedidos</th>
                            <th className="py-3 px-4 font-medium">Cadastro</th>
                            <th className="py-3 px-4 font-medium text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-mc-violet-950/10">
                        {filtered.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="py-10 text-center text-mc-ink/50">
                                    Nenhum usuário encontrado.
                                </td>
                            </tr>
                        ) : (
                            filtered.map((user) => {
                                const self = isSelf(user);
                                return (
                                    <tr
                                        key={user.id}
                                        onClick={() => navigate(`/admin/usuarios/${user.id}`)}
                                        className={`bg-white hover:bg-mc-sand-50/80 cursor-pointer ${
                                            self ? "ring-2 ring-inset ring-mc-gold-500/40" : ""
                                        }`}
                                    >
                                        <td className="py-3 px-4">
                                            <span className="font-medium text-mc-violet-950">
                                                {user.name}
                                            </span>
                                            {self && (
                                                <span className="ml-2 text-[10px] bg-mc-gold-500/20 text-mc-gold-800 px-1.5 py-0.5 rounded-full">
                                                    você
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-3 px-4 text-mc-ink/70">{user.email}</td>
                                        <td className="py-3 px-4 text-mc-ink/70 whitespace-nowrap">
                                            {user.phone || "—"}
                                        </td>
                                        <td className="py-3 px-4">
                                            <RoleBadge role={user.role} />
                                        </td>
                                        <td className="py-3 px-4 text-right tabular-nums text-mc-violet-950">
                                            {user._count.orders}
                                        </td>
                                        <td className="py-3 px-4 text-mc-ink/70 whitespace-nowrap">
                                            {formatDate(user.createdAt)}
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            <div
                                                className="flex items-center justify-end gap-1"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <ConfirmDelete
                                                    trigger={
                                                        <button
                                                            type="button"
                                                            className="p-1.5 hover:bg-red-50 rounded-md text-red-600 disabled:opacity-40"
                                                            title={self ? "Você não pode remover sua própria conta" : "Remover usuário"}
                                                            disabled={submitting || self}
                                                        >
                                                            <Trash2 size={15} />
                                                        </button>
                                                    }
                                                    title={`Remover "${user.name}"?`}
                                                    description="Todos os dados relacionados a este usuário serão removidos permanentemente. Esta ação não pode ser desfeita."
                                                    confirmText="Remover"
                                                    onConfirm={() => handleDelete(user)}
                                                    disabled={submitting || self}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => navigate(`/admin/usuarios/${user.id}`)}
                                                    className="p-1.5 rounded-md text-mc-ink/50 hover:bg-mc-blush-100 hover:text-mc-violet-950"
                                                    title="Ver detalhes"
                                                >
                                                    <ChevronRight size={16} />
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
        </div>
    );
}
