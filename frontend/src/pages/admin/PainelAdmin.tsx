import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { api } from "../../services/api";
import { Header } from "../../components/Header";
import { Loading } from "../../components/Loading";
import { ProtectedRoute } from "../../components/ProtectedRoute";
import { Button } from "../../components/ui/button";
import { getAuthHeaders, getStoredUser } from "../../lib/auth";
import { formatDate, showApiError } from "../../lib/utils-api";
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


type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: "STAFF" | "ADMIN";
  createdAt: string;
};

export function PainelAdmin() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    const headers = getAuthHeaders();
    if (!headers) return;

    try {
      setLoading(true);
      const res = await api.get("/admin/users", { headers });
      setUsers(res.data);
    } catch (error) {
      showApiError(error, "Erro ao carregar usuários");
    } finally {
      setLoading(false);
    }
  }

  async function handleChangeRole(
    userId: string,
    role: AdminUser["role"]
  ) {
    const headers = getAuthHeaders();
    if (!headers) return;

    try {
      setSubmitting(true);

      await api.put(
        `/admin/users/${userId}`,
        { role },
        { headers }
      );

      await fetchUsers();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        showApiError(error, "Erro ao atualizar função");
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(userId: string) {
    const headers = getAuthHeaders();
    if (!headers) return;

    try {
      setSubmitting(true);

      await api.delete(`/admin/users/${userId}`, {
        headers,
      });

      await fetchUsers();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        showApiError(error, "Erro ao deletar usuário");
      }
    } finally {
      setSubmitting(false);
    }
  }

  const roleLabel = useMemo(() => {
    return (role: AdminUser["role"]) =>
      role === "ADMIN" ? "Admin" : "Staff";
  }, []);

  const currentUser = getStoredUser();
  const currentAdminId = currentUser?.id;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#baa88d]">
        <Header />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-100">
              Painel Admin
            </h1>
          </div>

          {loading ? (
            <Loading />
          ) : users.length === 0 ? (
            <p className="text-gray-100">
              Nenhum usuário encontrado.
            </p>
          ) : (
            <div className="grid  gap-5 sm:grid-cols-2 lg:grid-cols-5 xl:grid-cols-3">
              {users.map((u) => (
                
                <div
                  key={u.id}
                  className="rounded-xl bg-gray-200 p-5  shadow-md"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 ">
                      <h2 className="text-md font-semibold text-gray-900 break-words">
                        {u.name}
                      </h2>

                      <p className="mt-1 text-sm text-gray-600 break-all">
                        Email: {u.email}
                      </p>
                    </div>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          disabled={submitting || u.id === currentAdminId}
                          className="shrink-0 bg-red-800 hover:bg-red-700 text-white"
                        >
                          Deletar
                        </Button>
                      </AlertDialogTrigger>

                      <AlertDialogContent className="bg-gray-200">
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Tem certeza de que deseja excluir {u.name}?
                          </AlertDialogTitle>

                          <AlertDialogDescription>
                            Todos os dados relacionados a este usuário serão removidos permanentemente.
                            Esta ação não poderá ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>

                        <AlertDialogFooter>
                          <AlertDialogCancel disabled={submitting}
                                            className="bg-gray-800 hover:bg-gray-800 text-white"
                          >
                            Cancelar
                          </AlertDialogCancel>

                          <AlertDialogAction
                            disabled={submitting}
                            onClick={() => handleDelete(u.id)}
                            className="bg-red-800 hover:bg-red-700 text-white"
                          >
                            Confirmar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>

                  <div className="mt-6 space-y-5">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Função
                      </label>

                      <select
                        disabled={submitting || u.id === currentAdminId}
                        value={u.role}
                        onChange={(e) =>
                          handleChangeRole(
                            u.id,
                            e.target.value as AdminUser["role"]
                          )
                        }
                        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 outline-none focus:border-gray-500"
                      >
                        <option value="STAFF">
                          {roleLabel("STAFF")}
                        </option>

                        <option value="ADMIN">
                          {roleLabel("ADMIN")}
                        </option>
                      </select>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        Criado em
                      </p>

                      <p className="mt-1 text-sm text-gray-600">
                        {formatDate(u.createdAt)}
                      </p>
                    </div>
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