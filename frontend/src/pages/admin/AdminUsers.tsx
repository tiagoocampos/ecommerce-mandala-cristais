import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { Loading } from "../../components/Loading";
import { ConfirmDelete } from "../../components/ui/confirm-delete";
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
import { formatDate, showApiError } from "../../lib/utils-api";
import { getStoredUser } from "../../lib/auth";
import { api } from "../../services/api";

interface AdminUser {
    id: string;
    name: string;
    email: string;
    role: "STAFF" | "ADMIN";
    createdAt: string;
}

export function AdminUsers() {
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [roleChangeTarget, setRoleChangeTarget] = useState<AdminUser | null>(null);
    const [roleChangeValue, setRoleChangeValue] = useState<"STAFF" | "ADMIN">("STAFF");
    const [confirmRoleOpen, setConfirmRoleOpen] = useState(false);

    const currentUser = getStoredUser();

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await api.get<AdminUser[]>("/admin/users");
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

    function openRoleChange(user: AdminUser) {
        setRoleChangeTarget(user);
        setRoleChangeValue(user.role);
        setConfirmRoleOpen(true);
    }

    async function handleRoleChange() {
        if (!roleChangeTarget) return;
        setSubmitting(true);
        try {
            await api.put(`/admin/users/${roleChangeTarget.id}`, {
                role: roleChangeValue,
            });
            toast.success(
                `${roleChangeTarget.name} agora é ${
                    roleChangeValue === "ADMIN" ? "Administrador" : "Staff"
                }`
            );
            setConfirmRoleOpen(false);
            await fetchUsers();
        } catch (error) {
            showApiError(error, "Erro ao alterar função");
        } finally {
            setSubmitting(false);
        }
    }

    async function handleDelete(user: AdminUser) {
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

    const isSelf = (user: AdminUser) => user.id === currentUser?.id;

    if (loading) {
        return (
            <div className="p-6">
                <Loading />
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6">
            <h1 className="font-display text-2xl sm:text-3xl text-mc-violet-950 mb-1">
                Usuários
            </h1>
            <p className="text-sm text-mc-ink/60 mb-6">
                {users.length} usuário(s) cadastrado(s)
            </p>

            <div className="overflow-x-auto rounded-lg border border-mc-violet-950/10">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-mc-blush-100 text-mc-violet-950 text-left">
                            <th className="py-3 px-4 font-medium">Nome</th>
                            <th className="py-3 px-4 font-medium">Email</th>
                            <th className="py-3 px-4 font-medium">Função</th>
                            <th className="py-3 px-4 font-medium">Cadastro</th>
                            <th className="py-3 px-4 font-medium text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-mc-violet-950/10">
                        {users.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="py-10 text-center text-mc-ink/50">
                                    Nenhum usuário encontrado.
                                </td>
                            </tr>
                        ) : (
                            users.map((user) => {
                                const self = isSelf(user);
                                return (
                                    <tr
                                        key={user.id}
                                        className={`bg-white hover:bg-mc-sand-50/80 ${
                                            self ? "ring-2 ring-inset ring-mc-gold-600/30" : ""
                                        }`}
                                    >
                                        <td className="py-3 px-4">
                                            <span className="font-medium text-mc-violet-950">
                                                {user.name}
                                            </span>
                                            {self && (
                                                <span className="ml-2 text-[10px] bg-mc-gold-600/20 text-mc-gold-800 px-1.5 py-0.5 rounded-full">
                                                    você
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-3 px-4 text-mc-ink/70">
                                            {user.email}
                                        </td>
                                        <td className="py-3 px-4">
                                            <span
                                                className={`inline-block text-[11px] font-medium px-2 py-0.5 rounded-full border ${
                                                    user.role === "ADMIN"
                                                        ? "bg-mc-violet-950/10 text-mc-violet-950 border-mc-violet-950/20"
                                                        : "bg-gray-100 text-gray-600 border-gray-200"
                                                }`}
                                            >
                                                {user.role === "ADMIN"
                                                    ? "Administrador"
                                                    : "Staff"}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-mc-ink/70 whitespace-nowrap">
                                            {formatDate(user.createdAt)}
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {/* role change */}
                                                <AlertDialog
                                                    open={
                                                        confirmRoleOpen &&
                                                        roleChangeTarget?.id === user.id
                                                    }
                                                    onOpenChange={(open) => {
                                                        if (!open) setConfirmRoleOpen(false);
                                                    }}
                                                >
                                                    <AlertDialogTrigger asChild>
                                                        <button
                                                            type="button"
                                                            onClick={() => openRoleChange(user)}
                                                            className="text-xs font-medium px-2.5 py-1 rounded-md bg-mc-blush-100 hover:bg-mc-blush-200 text-mc-violet-950 disabled:opacity-40"
                                                            disabled={submitting}
                                                        >
                                                            Alterar função
                                                        </button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>
                                                                Alterar função de {user.name}?
                                                            </AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                <select
                                                                    value={roleChangeValue}
                                                                    onChange={(e) =>
                                                                        setRoleChangeValue(
                                                                            e.target
                                                                                .value as "STAFF" | "ADMIN"
                                                                        )
                                                                    }
                                                                    className="w-full rounded-lg border border-mc-violet-950/15 bg-white px-3 py-2 text-sm outline-none focus:border-mc-violet-950/30 mb-3"
                                                                >
                                                                    <option value="STAFF">
                                                                        Staff
                                                                    </option>
                                                                    <option value="ADMIN">
                                                                        Administrador
                                                                    </option>
                                                                </select>
                                                                {self &&
                                                                    roleChangeValue !== "ADMIN" && (
                                                                        <p className="text-xs text-red-600 font-medium">
                                                                            ⚠ Você está prestes a
                                                                            remover seu próprio
                                                                            acesso de administrador.
                                                                            Você perderá acesso ao
                                                                            painel!
                                                                        </p>
                                                                    )}
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel
                                                                disabled={submitting}
                                                            >
                                                                Cancelar
                                                            </AlertDialogCancel>
                                                            <AlertDialogAction
                                                                disabled={submitting}
                                                                onClick={handleRoleChange}
                                                                className="bg-mc-violet-950 hover:bg-mc-violet-800 text-mc-sand-50"
                                                            >
                                                                {submitting
                                                                    ? "Alterando..."
                                                                    : "Confirmar"}
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>

                                                {/* delete */}
                                                <ConfirmDelete
                                                    trigger={
                                                        <button
                                                            type="button"
                                                            className="p-1.5 hover:bg-red-50 rounded-md text-red-600 disabled:opacity-40"
                                                            title="Remover usuário"
                                                            disabled={submitting || self}
                                                        >
                                                            <Trash2 size={15} />
                                                        </button>
                                                    }
                                                    title={`Remover "${user.name}"?`}
                                                    description={
                                                        self
                                                            ? "Você não pode remover sua própria conta."
                                                            : "Todos os dados relacionados a este usuário serão removidos permanentemente. Esta ação não pode ser desfeita."
                                                    }
                                                    confirmText="Remover"
                                                    onConfirm={() => handleDelete(user)}
                                                    disabled={submitting || self}
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
        </div>
    );
}

