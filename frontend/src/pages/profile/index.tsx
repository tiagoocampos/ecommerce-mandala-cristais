import { useCallback, useEffect, useState } from "react";
import axios, { type AxiosError } from "axios";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Trash2 } from "lucide-react";

import { api } from "../../services/api";
import { StoreHeader } from "../../components/store/StoreHeader";
import { StoreFooter } from "../../components/store/StoreFooter";
import { Loading } from "../../components/Loading";
import { ProtectedRoute } from "../../components/ProtectedRoute";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { ConfirmDelete } from "../../components/ui/confirm-delete";

import {
  clearAuth,
  getAuthHeaders,
} from "../../lib/auth";

import type { User } from "../../types";

type Address = {
  id: string;
  street: string;
  number: string;
  complement?: string | null;
  neighborhood: string;
  city: string;
  state: string;
  zip_code: string;
};

type FieldErrors = Partial<Record<string, string>>;

function isAxiosErrorWithData(error: unknown): error is AxiosError<any> {
  return axios.isAxiosError(error);
}

function getErrorToastMessages(error: unknown, fallback = "Ocorreu um erro") {
  if (!isAxiosErrorWithData(error)) return [fallback];
  const data = error.response?.data;

  if (data?.error && data?.details) {
    const details = Array.isArray(data.details) ? data.details : [];
    const msgs = details
      .filter((d: { message?: unknown }) => typeof d?.message === "string")
      .map((d: { message: string }) => d.message);
    return msgs.length ? msgs : [data.error];
  }

  if (typeof data?.error === "string") return [data.error];
  if (typeof data?.message === "string") return [data.message];

  return [fallback];
}

function applyFieldErrors(error: unknown, setErrors: (e: FieldErrors) => void) {
  if (!isAxiosErrorWithData(error)) return false;
  const details = error.response?.data?.details;
  if (!Array.isArray(details)) return false;

  const next: FieldErrors = {};
  for (const d of details) {
    if (typeof d?.path === "string" && typeof d?.message === "string") {
      next[d.path] = d.message;
    }
  }
  setErrors(next);
  return true;
}

export function Profile() {
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);

  const [creating, setCreating] = useState(false);

  const [form, setForm] = useState({
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
    zip_code: "",
  });

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const fetchData = useCallback(async () => {
    setLoading(true);
    setFieldErrors({});

    const auth = getAuthHeaders();
    if (!auth) {
      setLoading(false);
      navigate("/login");
      return;
    }

    try {
      const [meRes, addressesRes] = await Promise.all([
        api.get("/me", { headers: auth }),
        api.get("/address", { headers: auth }),
      ]);
      setUser(meRes.data);
      setAddresses(addressesRes.data);
    } catch (error) {
      const msgs = getErrorToastMessages(error, "Erro ao carregar sua conta");
      msgs.forEach((m: string) => toast.error(m, { position: "top-center" }));
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  function handleLogout() {
    clearAuth();
    toast.success("Você saiu da sua conta", { position: "top-center" });
    navigate("/login");
  }

  async function handleCreateAddress() {
    setCreating(true);
    setFieldErrors({});

    const auth = getAuthHeaders();
    if (!auth) {
      setCreating(false);
      navigate("/login");
      return;
    }

    try {
      const payload = {
        street: form.street,
        number: form.number,
        complement: form.complement ? form.complement : undefined,
        neighborhood: form.neighborhood,
        city: form.city,
        state: form.state,
        zip_code: form.zip_code,
      };

      await api.post("/address", payload, { headers: auth });

      toast.success("Endereço adicionado com sucesso!", { position: "top-center" });
      setForm({
        street: "",
        number: "",
        complement: "",
        neighborhood: "",
        city: "",
        state: "",
        zip_code: "",
      });

      await fetchData();
    } catch (error) {
      const ok = applyFieldErrors(error, setFieldErrors);
      if (!ok) {
        const msgs = getErrorToastMessages(error, "Erro ao adicionar endereço");
        msgs.forEach((m: string) => toast.error(m, { position: "top-center" }));
      }
    } finally {
      setCreating(false);
    }
  }

  async function handleDeleteAddress(id: string) {
    const auth = getAuthHeaders();
    if (!auth) return;

    try {
      await api.delete(`/address?address_id=${id}`, { headers: auth });
      toast.success("Endereço removido", { position: "top-center" });
      setAddresses((prev) => prev.filter((a) => a.id !== id));
    } catch (error) {
      const msgs = getErrorToastMessages(error, "Erro ao remover endereço");
      msgs.forEach((m: string) => toast.error(m, { position: "top-center" }));
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-mc-sand-50 flex flex-col">
        <StoreHeader />

        <main className="flex-1">
          <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
            <div className="flex flex-col lg:flex-row lg:items-start gap-8">
              <div className="w-full lg:w-[360px] shrink-0">
                <h1 className="font-display text-3xl sm:text-4xl text-mc-violet-950">
                  Minha conta
                </h1>
                <p className="text-sm text-mc-ink/70 mt-2">
                  Seus dados e endereços salvos.
                </p>

                <div className="mt-6 bg-mc-blush-100 border border-mc-violet-950/10 rounded-md p-5">
                  <div className="flex flex-col gap-2">
                    <div>
                      <div className="text-xs uppercase tracking-wide text-mc-ink/50">
                        Nome
                      </div>
                      <div className="text-sm font-medium text-mc-violet-950">
                        {user?.name ?? "—"}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-wide text-mc-ink/50">
                        Email
                      </div>
                      <div className="text-sm font-medium text-mc-violet-950">
                        {user?.email ?? "—"}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-wide text-mc-ink/50">
                        Função
                      </div>
                      <div className="text-sm font-medium text-mc-violet-950">
                        {user?.role === "ADMIN" ? "Administrador" : "Customer"}
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    className="mt-5 text-mc-violet-950 hover:bg-mc-blush-200 w-full"
                    onClick={handleLogout}
                  >
                    Sair
                  </Button>
                </div>
              </div>

              <div className="flex-1">
                <div className="mb-6">
                  <h2 className="font-display text-2xl text-mc-violet-950">
                    Endereços
                  </h2>
                  <p className="text-sm text-mc-ink/70 mt-2">
                    Adicione um novo endereço para facilitar suas compras.
                  </p>
                </div>

                {loading ? (
                  <div className="py-10">
                    <Loading />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-mc-blush-100 border border-mc-violet-950/10 rounded-md p-5">
                      <h3 className="font-display text-xl text-mc-violet-950">
                        Criar endereço
                      </h3>

                      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2">
                          <Label className="text-sm text-mc-ink/70">Rua</Label>
                          <Input
                            value={form.street}
                            onChange={(e) => setForm((p) => ({ ...p, street: e.target.value }))}
                            className="bg-white/70 border-mc-violet-950/15"
                            placeholder="Ex: Rua das Flores"
                          />
                          {fieldErrors.street && (
                            <p className="text-xs text-red-800 mt-1">{fieldErrors.street}</p>
                          )}
                        </div>

                        <div>
                          <Label className="text-sm text-mc-ink/70">Número</Label>
                          <Input
                            value={form.number}
                            onChange={(e) => setForm((p) => ({ ...p, number: e.target.value }))}
                            className="bg-white/70 border-mc-violet-950/15"
                            placeholder="Ex: 120"
                          />
                          {fieldErrors.number && (
                            <p className="text-xs text-red-800 mt-1">{fieldErrors.number}</p>
                          )}
                        </div>

                        <div>
                          <Label className="text-sm text-mc-ink/70">Complemento (opcional)</Label>
                          <Input
                            value={form.complement}
                            onChange={(e) => setForm((p) => ({ ...p, complement: e.target.value }))}
                            className="bg-white/70 border-mc-violet-950/15"
                            placeholder="Apto, bloco..."
                          />
                          {fieldErrors.complement && (
                            <p className="text-xs text-red-800 mt-1">{fieldErrors.complement}</p>
                          )}
                        </div>

                        <div className="sm:col-span-2">
                          <Label className="text-sm text-mc-ink/70">Bairro</Label>
                          <Input
                            value={form.neighborhood}
                            onChange={(e) =>
                              setForm((p) => ({ ...p, neighborhood: e.target.value }))
                            }
                            className="bg-white/70 border-mc-violet-950/15"
                            placeholder="Ex: Centro"
                          />
                          {fieldErrors.neighborhood && (
                            <p className="text-xs text-red-800 mt-1">{fieldErrors.neighborhood}</p>
                          )}
                        </div>

                        <div>
                          <Label className="text-sm text-mc-ink/70">Cidade</Label>
                          <Input
                            value={form.city}
                            onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))}
                            className="bg-white/70 border-mc-violet-950/15"
                            placeholder="Ex: São Paulo"
                          />
                          {fieldErrors.city && (
                            <p className="text-xs text-red-800 mt-1">{fieldErrors.city}</p>
                          )}
                        </div>

                        <div>
                          <Label className="text-sm text-mc-ink/70">Estado (UF)</Label>
                          <Input
                            value={form.state}
                            onChange={(e) => setForm((p) => ({ ...p, state: e.target.value.toUpperCase().slice(0, 2) }))}
                            className="bg-white/70 border-mc-violet-950/15"
                            placeholder="RS"
                          />
                          {fieldErrors.state && (
                            <p className="text-xs text-red-800 mt-1">{fieldErrors.state}</p>
                          )}
                        </div>

                        <div className="sm:col-span-2">
                          <Label className="text-sm text-mc-ink/70">CEP</Label>
                          <Input
                            value={form.zip_code}
                            onChange={(e) =>
                              setForm((p) => ({ ...p, zip_code: e.target.value }))
                            }
                            className="bg-white/70 border-mc-violet-950/15"
                            placeholder="Ex: 90000-000"
                          />
                          {fieldErrors.zip_code && (
                            <p className="text-xs text-red-800 mt-1">{fieldErrors.zip_code}</p>
                          )}
                        </div>
                      </div>

                      <Button
                        onClick={handleCreateAddress}
                        disabled={creating}
                        className="mt-5 facet-cut-sm bg-mc-violet-950 hover:bg-mc-violet-800 text-mc-sand-50 rounded-none w-full"
                      >
                        {creating ? "Salvando..." : "Adicionar endereço"}
                      </Button>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-display text-xl text-mc-violet-950">
                          Seus endereços
                        </h3>
                        <span className="text-xs text-mc-ink/60">
                          {addresses.length} cadastrado(s)
                        </span>
                      </div>

                      {addresses.length === 0 ? (
                        <p className="text-sm text-mc-ink/70">Nenhum endereço salvo ainda.</p>
                      ) : (
                        <div className="space-y-3">
                          {addresses.map((a) => (
                            <div
                              key={a.id}
                              className="bg-mc-blush-100 border border-mc-violet-950/10 rounded-md p-4 flex items-start justify-between gap-3"
                            >
                              <div className="min-w-0">
                                <div className="text-xs uppercase tracking-wide text-mc-ink/50">
                                  {a.street}, {a.number}
                                </div>
                                <div className="text-sm font-medium text-mc-violet-950 mt-1">
                                  {a.city} - {a.state}
                                </div>
                                <div className="text-sm text-mc-ink/70 mt-1">
                                  {a.neighborhood} · {a.zip_code}
                                </div>
                                {a.complement ? (
                                  <div className="text-sm text-mc-ink/70 mt-1">
                                    Compl.: {a.complement}
                                  </div>
                                ) : null}
                              </div>
                              <ConfirmDelete
                                trigger={
                                  <button className="shrink-0 text-red-600 hover:bg-red-100 p-1.5 rounded-full">
                                    <Trash2 size={15} />
                                  </button>
                                }
                                title="Remover endereço"
                                description="Tem certeza que deseja remover este endereço? Essa ação não pode ser desfeita."
                                confirmText="Remover"
                                onConfirm={() => handleDeleteAddress(a.id)}
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        </main>

        <StoreFooter />
      </div>
    </ProtectedRoute>
  );
}

