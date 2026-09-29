import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Loading } from "../../components/Loading";
import { OrderStatusBadge } from "../../components/OrderStatusBadge";
import { formatDate, formatPrice } from "../../lib/utils-api";
import { PAYMENT_STATUS_LABELS } from "../../lib/admin-format";
import { api } from "../../services/api";
import type { AdminDashboard as DashboardData } from "../../types/admin";

const th = "py-2.5 px-4 font-medium";
const td = "py-2.5 px-4";

export function AdminDashboard() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        let mounted = true;
        api.get<DashboardData>("/admin/dashboard")
            .then(({ data }) => {
                if (mounted) setData(data);
            })
            .catch(() => {
                if (mounted) setError(true);
            })
            .finally(() => {
                if (mounted) setLoading(false);
            });
        return () => {
            mounted = false;
        };
    }, []);

    if (loading) {
        return (
            <div className="p-6">
                <Loading />
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="p-6">
                <div className="bg-destructive/10 border border-destructive/25 rounded-lg p-4 text-sm text-destructive">
                    Erro ao carregar dados do dashboard.
                </div>
            </div>
        );
    }

    const numbers = [
        { label: "Faturamento (pedidos pagos)", value: formatPrice(data.revenue.paidTotal) },
        { label: "Pedidos pendentes", value: data.ordersByStatus.PENDING, alert: data.ordersByStatus.PENDING > 0 },
        { label: "Pagamentos pendentes", value: data.pendingPayments.count, alert: data.pendingPayments.count > 0 },
        { label: "Estoque baixo (≤ 5)", value: data.lowStockProducts.length, alert: data.lowStockProducts.length > 0 },
        { label: "Novos usuários (30 dias)", value: data.newUsersLast30Days },
    ];

    return (
        <div className="p-4 sm:p-6 max-w-6xl">
            <h1 className="font-display text-2xl sm:text-3xl text-mc-violet-950 mb-1">Dashboard</h1>
            <p className="text-sm text-mc-ink/60 mb-6">Visão geral da loja</p>

            {/* Números */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-8">
                {numbers.map((n) => (
                    <div key={n.label} className="bg-white border border-mc-violet-950/10 rounded-lg p-4">
                        <p className="text-xs uppercase tracking-wide text-mc-ink/50 leading-tight">{n.label}</p>
                        <p className={`mt-1.5 text-2xl font-semibold tabular-nums ${n.alert ? "text-mc-gold-800" : "text-mc-violet-950"}`}>
                            {n.value}
                        </p>
                    </div>
                ))}
            </div>

            {/* Pedidos por status (resumo compacto) */}
            <div className="flex flex-wrap gap-2 mb-8 text-sm">
                {(Object.keys(data.ordersByStatus) as (keyof DashboardData["ordersByStatus"])[]).map((status) => (
                    <Link
                        key={status}
                        to="/admin/pedidos"
                        className="inline-flex items-center gap-2 rounded-full border border-mc-violet-950/10 bg-white pl-1 pr-3 py-1 hover:bg-mc-blush-100"
                    >
                        <OrderStatusBadge status={status} />
                        <span className="tabular-nums font-medium text-mc-violet-950">{data.ordersByStatus[status]}</span>
                    </Link>
                ))}
            </div>

            {/* Pedidos aguardando ação */}
            <section className="mb-8">
                <h2 className="font-display text-lg text-mc-violet-950 mb-1">Pedidos aguardando ação</h2>
                <p className="text-xs text-mc-ink/50 mb-3">
                    Pedido ou pagamento pendente — os mais antigos primeiro.
                </p>
                <div className="overflow-x-auto rounded-lg border border-mc-violet-950/10">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-mc-blush-100 text-mc-violet-950 text-left">
                                <th className={th}>Pedido</th>
                                <th className={th}>Cliente</th>
                                <th className={th}>Data</th>
                                <th className={th}>Status</th>
                                <th className={th}>Pagamento</th>
                                <th className={`${th} text-right`}>Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-mc-violet-950/10 bg-white">
                            {data.actionOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-8 text-center text-mc-ink/50">
                                        Nenhum pedido aguardando ação. 🎉
                                    </td>
                                </tr>
                            ) : (
                                data.actionOrders.map((order) => (
                                    <tr key={order.id} className="hover:bg-mc-sand-50/80">
                                        <td className={td}>
                                            <Link
                                                to={`/admin/pedidos/${order.id}`}
                                                className="font-mono text-mc-violet-700 underline underline-offset-2 hover:text-mc-violet-950"
                                            >
                                                #{order.id.slice(0, 8).toUpperCase()}
                                            </Link>
                                        </td>
                                        <td className={td}>
                                            <Link
                                                to={`/admin/usuarios/${order.user.id}`}
                                                className="text-mc-violet-950 hover:underline"
                                            >
                                                {order.user.name}
                                            </Link>
                                            <div className="text-xs text-mc-ink/50">{order.user.email}</div>
                                        </td>
                                        <td className={`${td} text-mc-ink/70 whitespace-nowrap`}>{formatDate(order.createdAt)}</td>
                                        <td className={td}>
                                            <OrderStatusBadge status={order.status} />
                                        </td>
                                        <td className={`${td} text-mc-ink/70`}>
                                            {order.payment ? PAYMENT_STATUS_LABELS[order.payment.status] : "—"}
                                        </td>
                                        <td className={`${td} text-right tabular-nums font-medium text-mc-violet-950 whitespace-nowrap`}>
                                            {formatPrice(order.total)}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Estoque baixo */}
            <section>
                <h2 className="font-display text-lg text-mc-violet-950 mb-1">Estoque baixo</h2>
                <p className="text-xs text-mc-ink/50 mb-3">Produtos ativos com 5 unidades ou menos.</p>
                <div className="overflow-x-auto rounded-lg border border-mc-violet-950/10">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-mc-blush-100 text-mc-violet-950 text-left">
                                <th className={th}>Produto</th>
                                <th className={`${th} text-right`}>Estoque</th>
                                <th className={`${th} text-right`}>Ação</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-mc-violet-950/10 bg-white">
                            {data.lowStockProducts.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="py-8 text-center text-mc-ink/50">
                                        Nenhum produto com estoque baixo.
                                    </td>
                                </tr>
                            ) : (
                                data.lowStockProducts.map((product) => (
                                    <tr key={product.id} className="hover:bg-mc-sand-50/80">
                                        <td className={`${td} text-mc-violet-950`}>{product.name}</td>
                                        <td className={`${td} text-right tabular-nums font-medium ${product.stock === 0 ? "text-destructive" : "text-mc-gold-800"}`}>
                                            {product.stock === 0 ? "Esgotado" : product.stock}
                                        </td>
                                        <td className={`${td} text-right`}>
                                            <Link
                                                to={`/admin/produtos?editar=${product.id}`}
                                                className="text-xs font-medium px-2.5 py-1 rounded-md border border-mc-violet-950/15 text-mc-violet-950 hover:bg-mc-blush-100"
                                            >
                                                Repor estoque
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}
