import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, Plus } from "lucide-react";
import { Loading } from "../../components/Loading";
import { Button } from "../../components/ui/button";
import { OrderStatusBadge } from "../../components/OrderStatusBadge";
import { CouponForm, type CouponFormPayload } from "../../components/admin/CouponForm";
import { CouponsTable } from "../../components/admin/CouponsTable";
import { formatDate, formatPrice, getApiErrorMessage, showApiError } from "../../lib/utils-api";
import { PAYMENT_STATUS_LABELS } from "../../lib/admin-format";
import { api } from "../../services/api";
import type { AdminUserDetail as AdminUserDetailData, Coupon } from "../../types/admin";
import { RoleBadge } from "../../components/admin/RoleBadge";

function Section({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
    return (
        <section className="mb-8">
            <div className="flex items-center justify-between gap-3 mb-3">
                <h2 className="font-display text-lg text-mc-violet-950">{title}</h2>
                {action}
            </div>
            {children}
        </section>
    );
}

const th = "py-2.5 px-4 font-medium";
const td = "py-2.5 px-4";

export function AdminUserDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [user, setUser] = useState<AdminUserDetailData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [formOpen, setFormOpen] = useState(false);
    const [busyCouponId, setBusyCouponId] = useState<string | null>(null);

    const fetchUser = useCallback(async () => {
        try {
            const { data } = await api.get<AdminUserDetailData>(`/admin/users/${id}`);
            setUser(data);
            setError(null);
        } catch (err) {
            setError(getApiErrorMessage(err, "Erro ao carregar usuário"));
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    async function handleCreateDiscount(payload: CouponFormPayload) {
        const { data } = await api.post<Coupon>(`/admin/users/${id}/discount`, payload);
        toast.success(`Desconto criado: ${data.code}`);
        setFormOpen(false);
        await fetchUser();
    }

    async function handleToggle(coupon: Coupon, active: boolean) {
        setBusyCouponId(coupon.id);
        try {
            await api.patch(`/admin/coupons/${coupon.id}`, { active });
            toast.success(active ? "Cupom reativado" : "Cupom desativado");
            await fetchUser();
        } catch (err) {
            showApiError(err, "Erro ao atualizar cupom");
        } finally {
            setBusyCouponId(null);
        }
    }

    if (loading) {
        return (
            <div className="p-6">
                <Loading />
            </div>
        );
    }

    if (error || !user) {
        return (
            <div className="p-4 sm:p-6">
                <button
                    onClick={() => navigate("/admin/usuarios")}
                    className="flex items-center gap-1.5 text-sm text-mc-ink/60 hover:text-mc-violet-950 mb-5"
                >
                    <ArrowLeft size={15} /> Voltar para usuários
                </button>
                <p className="text-sm text-destructive">{error ?? "Usuário não encontrado"}</p>
            </div>
        );
    }

    const stats = [
        { label: "Total gasto (pedidos pagos)", value: formatPrice(user.stats.totalSpent) },
        { label: "Pedidos", value: String(user.stats.ordersCount) },
        { label: "Pagamentos pendentes", value: String(user.stats.pendingPaymentsCount), alert: user.stats.pendingPaymentsCount > 0 },
    ];

    return (
        <div className="p-4 sm:p-6 max-w-6xl">
            <button
                onClick={() => navigate("/admin/usuarios")}
                className="flex items-center gap-1.5 text-sm text-mc-ink/60 hover:text-mc-violet-950 mb-5"
            >
                <ArrowLeft size={15} /> Voltar para usuários
            </button>

            <h1 className="font-display text-2xl sm:text-3xl text-mc-violet-950 mb-6">{user.name}</h1>

            {/* Resumo */}
            <div className="grid gap-3 sm:grid-cols-3 mb-8">
                {stats.map((s) => (
                    <div key={s.label} className="rounded-lg border border-mc-violet-950/10 bg-white p-4">
                        <p className="text-xs uppercase tracking-wide text-mc-ink/50">{s.label}</p>
                        <p className={`mt-1 text-2xl font-semibold tabular-nums ${s.alert ? "text-mc-gold-800" : "text-mc-violet-950"}`}>
                            {s.value}
                        </p>
                    </div>
                ))}
            </div>

            {/* Dados cadastrais */}
            <Section title="Dados cadastrais">
                <div className="overflow-x-auto rounded-lg border border-mc-violet-950/10">
                    <table className="w-full text-sm bg-white">
                        <tbody className="divide-y divide-mc-violet-950/10">
                            {[
                                ["Nome", user.name],
                                ["E-mail", user.email],
                                ["Telefone", user.phone || "—"],
                                ["Papel", <RoleBadge key="role" role={user.role} />],
                                ["Cadastro", formatDate(user.createdAt)],
                            ].map(([label, value]) => (
                                <tr key={String(label)}>
                                    <th className={`${td} w-40 text-left font-medium text-mc-ink/60 bg-mc-sand-50`}>{label}</th>
                                    <td className={`${td} text-mc-violet-950`}>{value}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Section>

            {/* Endereços */}
            <Section title={`Endereços (${user.addresses.length})`}>
                <div className="overflow-x-auto rounded-lg border border-mc-violet-950/10">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-mc-blush-100 text-mc-violet-950 text-left">
                                <th className={th}>Rua</th>
                                <th className={th}>Número</th>
                                <th className={th}>Complemento</th>
                                <th className={th}>Bairro</th>
                                <th className={th}>Cidade</th>
                                <th className={th}>UF</th>
                                <th className={th}>CEP</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-mc-violet-950/10 bg-white text-mc-ink/80">
                            {user.addresses.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="py-8 text-center text-mc-ink/50">
                                        Nenhum endereço cadastrado.
                                    </td>
                                </tr>
                            ) : (
                                user.addresses.map((a) => (
                                    <tr key={a.id}>
                                        <td className={td}>{a.street}</td>
                                        <td className={td}>{a.number}</td>
                                        <td className={td}>{a.complement || "—"}</td>
                                        <td className={td}>{a.neighborhood}</td>
                                        <td className={td}>{a.city}</td>
                                        <td className={td}>{a.state}</td>
                                        <td className={`${td} whitespace-nowrap`}>{a.zip_code}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Section>

            {/* Pedidos */}
            <Section title={`Histórico de pedidos (${user.orders.length})`}>
                <div className="overflow-x-auto rounded-lg border border-mc-violet-950/10">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-mc-blush-100 text-mc-violet-950 text-left">
                                <th className={th}>Pedido</th>
                                <th className={th}>Data</th>
                                <th className={th}>Status</th>
                                <th className={th}>Pagamento</th>
                                <th className={`${th} text-right`}>Itens</th>
                                <th className={`${th} text-right`}>Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-mc-violet-950/10 bg-white">
                            {user.orders.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-8 text-center text-mc-ink/50">
                                        Nenhum pedido ainda.
                                    </td>
                                </tr>
                            ) : (
                                user.orders.map((order) => (
                                    <tr key={order.id} className="hover:bg-mc-sand-50/80">
                                        <td className={td}>
                                            <Link
                                                to={`/admin/pedidos/${order.id}`}
                                                className="font-mono text-mc-violet-700 underline underline-offset-2 hover:text-mc-violet-950"
                                            >
                                                #{order.id.slice(0, 8).toUpperCase()}
                                            </Link>
                                        </td>
                                        <td className={`${td} text-mc-ink/70 whitespace-nowrap`}>{formatDate(order.createdAt)}</td>
                                        <td className={td}>
                                            <OrderStatusBadge status={order.status} />
                                        </td>
                                        <td className={`${td} text-mc-ink/70`}>
                                            {order.payment ? PAYMENT_STATUS_LABELS[order.payment.status] : "—"}
                                            {order.payment?.method && (
                                                <span className="text-mc-ink/40"> · {order.payment.method}</span>
                                            )}
                                        </td>
                                        <td className={`${td} text-right tabular-nums`}>{order.itemsCount}</td>
                                        <td className={`${td} text-right tabular-nums font-medium text-mc-violet-950 whitespace-nowrap`}>
                                            {formatPrice(order.total)}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Section>

            {/* Descontos */}
            <Section
                title={`Descontos (${user.coupons.length})`}
                action={
                    !formOpen && (
                        <Button
                            size="sm"
                            onClick={() => setFormOpen(true)}
                            className="bg-mc-violet-950 hover:bg-mc-violet-800 text-mc-sand-50"
                        >
                            <Plus size={14} /> Criar desconto
                        </Button>
                    )
                }
            >
                {formOpen && (
                    <CouponForm mode="personal" onSubmit={handleCreateDiscount} onCancel={() => setFormOpen(false)} />
                )}
                <CouponsTable
                    coupons={user.coupons}
                    busyId={busyCouponId}
                    onToggle={handleToggle}
                    emptyText="Nenhum desconto criado para este cliente."
                />
            </Section>
        </div>
    );
}
