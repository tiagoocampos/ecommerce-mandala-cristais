import { ConfirmDelete } from "../ui/confirm-delete";
import { formatCouponValue, formatDay, isCouponExpired } from "../../lib/admin-format";
import type { Coupon } from "../../types/admin";

interface CouponsTableProps {
    coupons: Coupon[];
    /** mostra a coluna "Só 1ª compra" (cupons genéricos) */
    showFirstPurchase?: boolean;
    busyId: string | null;
    onToggle: (coupon: Coupon, active: boolean) => void;
    emptyText: string;
}

function StatusBadge({ coupon }: { coupon: Coupon }) {
    const expired = isCouponExpired(coupon);
    const [label, className] = !coupon.active
        ? ["Inativo", "bg-mc-sand-100 text-mc-ink/60 border-mc-violet-950/10"]
        : expired
          ? ["Expirado", "bg-mc-gold-500/20 text-mc-gold-800 border-mc-gold-500/50"]
          : ["Ativo", "bg-mc-success-100 text-mc-success-700 border-mc-success-700/25"];
    return (
        <span className={`inline-block text-[11px] font-medium px-2 py-0.5 rounded-full border ${className}`}>
            {label}
        </span>
    );
}

export function CouponsTable({ coupons, showFirstPurchase, busyId, onToggle, emptyText }: CouponsTableProps) {
    const colCount = showFirstPurchase ? 8 : 7;

    return (
        <div className="overflow-x-auto rounded-lg border border-mc-violet-950/10">
            <table className="w-full text-sm">
                <thead>
                    <tr className="bg-mc-blush-100 text-mc-violet-950 text-left">
                        <th className="py-2.5 px-4 font-medium">Código</th>
                        <th className="py-2.5 px-4 font-medium">Tipo</th>
                        <th className="py-2.5 px-4 font-medium text-right">Valor</th>
                        {showFirstPurchase && <th className="py-2.5 px-4 font-medium">Só 1ª compra</th>}
                        <th className="py-2.5 px-4 font-medium">Validade</th>
                        <th className="py-2.5 px-4 font-medium text-right">Usos</th>
                        <th className="py-2.5 px-4 font-medium">Status</th>
                        <th className="py-2.5 px-4 font-medium text-right">Ação</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-mc-violet-950/10 bg-white">
                    {coupons.length === 0 ? (
                        <tr>
                            <td colSpan={colCount}className="py-8 text-center text-mc-ink/50">
                                {emptyText}
                            </td>
                        </tr>
                    ) : (
                        coupons.map((coupon) => {
                            const busy = busyId === coupon.id;
                            return (
                                <tr key={coupon.id}>
                                    <td className="py-2.5 px-4 font-mono text-mc-violet-950">{coupon.code}</td>
                                    <td className="py-2.5 px-4 text-mc-ink/70">
                                        {coupon.type === "PERCENTAGE" ? "Percentual" : "Valor fixo"}
                                    </td>
                                    <td className="py-2.5 px-4 text-right tabular-nums text-mc-violet-950">
                                        {formatCouponValue(coupon)}
                                    </td>
                                    {showFirstPurchase && (
                                        <td className="py-2.5 px-4 text-mc-ink/70">
                                            {coupon.first_purchase_only ? "Sim" : "Não"}
                                        </td>
                                    )}
                                    <td className="py-2.5 px-4 text-mc-ink/70 whitespace-nowrap">
                                        {coupon.expires_at ? formatDay(coupon.expires_at) : "Sem validade"}
                                    </td>
                                    <td className="py-2.5 px-4 text-right tabular-nums text-mc-ink/70">
                                        {coupon._count?.orders ?? 0}
                                    </td>
                                    <td className="py-2.5 px-4">
                                        <StatusBadge coupon={coupon} />
                                    </td>
                                    <td className="py-2.5 px-4 text-right">
                                        {coupon.active ? (
                                            <ConfirmDelete
                                                trigger={
                                                    <button
                                                        type="button"
                                                        disabled={busy}
                                                        className="text-xs font-medium px-2.5 py-1 rounded-md border border-mc-violet-950/15 text-mc-violet-950 hover:bg-mc-blush-100 disabled:opacity-40"
                                                    >
                                                        Desativar
                                                    </button>
                                                }
                                                title={`Desativar o cupom ${coupon.code}?`}
                                                description="O cupom deixa de funcionar em novas compras. Se ele já foi enviado ao cliente (ex.: pelo WhatsApp), o cliente não vai conseguir usá-lo. Pedidos já feitos com ele não mudam."
                                                confirmText="Desativar"
                                                onConfirm={() => onToggle(coupon, false)}
                                                disabled={busy}
                                            />
                                        ) : (
                                            <button
                                                type="button"
                                                disabled={busy}
                                                onClick={() => onToggle(coupon, true)}
                                                className="text-xs font-medium px-2.5 py-1 rounded-md bg-mc-violet-950 text-mc-sand-50 hover:bg-mc-violet-800 disabled:opacity-40"
                                            >
                                                Reativar
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            );
                        })
                    )}
                </tbody>
            </table>
        </div>
    );
}
