import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { Loading } from "../../components/Loading";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { CouponForm, type CouponFormPayload } from "../../components/admin/CouponForm";
import { CouponsTable } from "../../components/admin/CouponsTable";
import { AnnouncementBar } from "../../components/store/AnnouncementBar";
import { TrustStrip } from "../../components/store/TrustStrip";
import { setStoreSettingsCache } from "../../hooks/useStoreSettings";
import { centsToReais, formatCouponValue, reaisToCents } from "../../lib/admin-format";
import { resolveTrustIcon, TRUST_ICON_NAMES } from "../../lib/trust-icons";
import { showApiError } from "../../lib/utils-api";
import { api } from "../../services/api";
import type { Coupon, StoreSettings, TrustStripItemData } from "../../types/admin";

const MAX_TRUST_ITEMS = 8;

const selectClass =
    "h-9 rounded-md border border-input bg-white px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20";

function Block({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
    return (
        <section className="mb-10 rounded-lg border border-mc-violet-950/10 bg-white p-4 sm:p-5">
            <h2 className="font-display text-lg text-mc-violet-950">{title}</h2>
            <p className="text-xs text-mc-ink/60 mb-4">{description}</p>
            {children}
        </section>
    );
}

export function AdminStorefront() {
    const [loading, setLoading] = useState(true);
    const [coupons, setCoupons] = useState<Coupon[]>([]);

    // faixa de anúncio
    const [announcementText, setAnnouncementText] = useState("");
    const [announcementCoupon, setAnnouncementCoupon] = useState("");
    const [freeShipping, setFreeShipping] = useState("");
    const [savingAnnouncement, setSavingAnnouncement] = useState(false);

    // faixa de confiança
    const [trustItems, setTrustItems] = useState<TrustStripItemData[]>([]);
    const [savingTrust, setSavingTrust] = useState(false);

    // cupons
    const [couponFormOpen, setCouponFormOpen] = useState(false);
    const [busyCouponId, setBusyCouponId] = useState<string | null>(null);

    const applySettings = useCallback((settings: StoreSettings) => {
        setAnnouncementText(settings.announcement_text);
        setAnnouncementCoupon(settings.announcement_coupon_code ?? "");
        setFreeShipping(centsToReais(settings.free_shipping_threshold));
        setTrustItems(settings.trust_strip_items);
    }, []);

    const fetchCoupons = useCallback(async () => {
        const { data } = await api.get<Coupon[]>("/admin/coupons");
        setCoupons(data);
    }, []);

    useEffect(() => {
        Promise.all([api.get<StoreSettings>("/store-settings"), fetchCoupons()])
            .then(([{ data }]) => applySettings(data))
            .catch((error) => showApiError(error, "Erro ao carregar configurações da vitrine"))
            .finally(() => setLoading(false));
    }, [applySettings, fetchCoupons]);

    async function save(data: Partial<StoreSettings>, successMessage: string) {
        const { data: saved } = await api.put<StoreSettings>("/admin/store-settings", data);
        setStoreSettingsCache(saved);
        applySettings(saved);
        toast.success(successMessage);
    }

    async function handleSaveAnnouncement(e: React.FormEvent) {
        e.preventDefault();
        const threshold = freeShipping.trim() ? reaisToCents(freeShipping) : null;
        if (freeShipping.trim() && threshold === null) {
            toast.error("Valor de frete grátis inválido. Use o formato 299,00");
            return;
        }
        setSavingAnnouncement(true);
        try {
            await save(
                {
                    announcement_text: announcementText,
                    announcement_coupon_code: announcementCoupon || null,
                    free_shipping_threshold: threshold,
                },
                "Faixa de anúncio salva"
            );
        } catch (error) {
            showApiError(error, "Erro ao salvar faixa de anúncio");
        } finally {
            setSavingAnnouncement(false);
        }
    }

    function updateItem(index: number, patch: Partial<TrustStripItemData>) {
        setTrustItems((items) => items.map((item, i) => (i === index ? { ...item, ...patch } : item)));
    }

    function moveItem(index: number, direction: -1 | 1) {
        setTrustItems((items) => {
            const target = index + direction;
            if (target < 0 || target >= items.length) return items;
            const next = [...items];
            [next[index], next[target]] = [next[target], next[index]];
            return next;
        });
    }

    async function handleSaveTrust() {
        if (trustItems.some((item) => !item.label.trim())) {
            toast.error("Preencha o texto de todos os itens (ou remova os vazios).");
            return;
        }
        setSavingTrust(true);
        try {
            await save({ trust_strip_items: trustItems }, "Faixa de confiança salva");
        } catch (error) {
            showApiError(error, "Erro ao salvar faixa de confiança");
        } finally {
            setSavingTrust(false);
        }
    }

    async function handleCreateCoupon(payload: CouponFormPayload) {
        const { data } = await api.post<Coupon>("/admin/coupons", payload);
        toast.success(`Cupom ${data.code} criado`);
        setCouponFormOpen(false);
        await fetchCoupons();
    }

    async function handleToggleCoupon(coupon: Coupon, active: boolean) {
        setBusyCouponId(coupon.id);
        try {
            await api.patch(`/admin/coupons/${coupon.id}`, { active });
            toast.success(active ? "Cupom reativado" : "Cupom desativado");
            await fetchCoupons();
        } catch (error) {
            showApiError(error, "Erro ao atualizar cupom");
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

    const selectedCoupon = coupons.find((c) => c.code === announcementCoupon);
    const couponMissing = !!announcementCoupon && !selectedCoupon;

    return (
        <div className="p-4 sm:p-6 max-w-5xl">
            <h1 className="font-display text-2xl sm:text-3xl text-mc-violet-950 mb-1">Vitrine</h1>
            <p className="text-sm text-mc-ink/60 mb-6">
                Textos do topo da loja, faixa de confiança e cupons de desconto.
            </p>

            {/* 1. Faixa de anúncio */}
            <Block
                title="Faixa de anúncio"
                description="Barra roxa no topo de todas as páginas da loja."
            >
                <form onSubmit={handleSaveAnnouncement} className="space-y-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="announcement-text">Texto</Label>
                        <Input
                            id="announcement-text"
                            value={announcementText}
                            onChange={(e) => setAnnouncementText(e.target.value)}
                            maxLength={200}
                            placeholder="Ex.: Dia do Cliente: 20% OFF em tudo com o cupom DIACLIENTE20"
                            className="bg-white"
                        />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-1.5">
                            <Label htmlFor="announcement-coupon">Cupom em destaque (opcional)</Label>
                            <select
                                id="announcement-coupon"
                                value={announcementCoupon}
                                onChange={(e) => setAnnouncementCoupon(e.target.value)}
                                className={`w-full ${selectClass}`}
                            >
                                <option value="">Nenhum</option>
                                {couponMissing && (
                                    <option value={announcementCoupon}>{announcementCoupon} (não cadastrado)</option>
                                )}
                                {coupons.map((c) => (
                                    <option key={c.id} value={c.code}>
                                        {c.code} — {formatCouponValue(c)}
                                        {c.active ? "" : " (inativo)"}
                                    </option>
                                ))}
                            </select>
                            {couponMissing && (
                                <p className="text-xs text-destructive">
                                    O cupom {announcementCoupon} está sendo divulgado, mas não existe. Crie-o abaixo
                                    ou escolha outro, senão o cliente não consegue usar.
                                </p>
                            )}
                            {selectedCoupon && !selectedCoupon.active && (
                                <p className="text-xs text-mc-gold-800">
                                    Este cupom está inativo — o cliente não vai conseguir usá-lo.
                                </p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="free-shipping">Frete grátis acima de (R$, opcional)</Label>
                            <Input
                                id="free-shipping"
                                value={freeShipping}
                                onChange={(e) => setFreeShipping(e.target.value)}
                                inputMode="decimal"
                                placeholder="299,00"
                                className="bg-white"
                            />
                        </div>
                    </div>

                    <Button
                        type="submit"
                        disabled={savingAnnouncement}
                        className="bg-mc-violet-950 hover:bg-mc-violet-800 text-mc-sand-50"
                    >
                        {savingAnnouncement ? "Salvando..." : "Salvar faixa de anúncio"}
                    </Button>
                </form>

                <p className="mt-5 mb-1.5 text-xs uppercase tracking-wide text-mc-ink/50">Como está no site agora</p>
                <div className="overflow-hidden rounded-md">
                    <AnnouncementBar />
                </div>
            </Block>

            {/* 2. Faixa de confiança */}
            <Block
                title="Faixa de confiança"
                description={`Itens exibidos logo abaixo do banner da home (até ${MAX_TRUST_ITEMS}).`}
            >
                <div className="overflow-x-auto rounded-lg border border-mc-violet-950/10 mb-3">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-mc-blush-100 text-mc-violet-950 text-left">
                                <th className="py-2.5 px-3 font-medium w-12">#</th>
                                <th className="py-2.5 px-3 font-medium w-48">Ícone</th>
                                <th className="py-2.5 px-3 font-medium">Texto</th>
                                <th className="py-2.5 px-3 font-medium text-right w-32">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-mc-violet-950/10">
                            {trustItems.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="py-6 text-center text-mc-ink/50">
                                        Nenhum item — a faixa fica oculta na home.
                                    </td>
                                </tr>
                            ) : (
                                trustItems.map((item, index) => {
                                    const Icon = resolveTrustIcon(item.icon);
                                    return (
                                        <tr key={index}>
                                            <td className="py-2 px-3 text-mc-ink/50 tabular-nums">{index + 1}</td>
                                            <td className="py-2 px-3">
                                                <div className="flex items-center gap-2">
                                                    <Icon size={18} className="text-mc-violet-700 shrink-0" aria-hidden="true" />
                                                    <select
                                                        value={item.icon}
                                                        onChange={(e) => updateItem(index, { icon: e.target.value })}
                                                        aria-label={`Ícone do item ${index + 1}`}
                                                        className={`w-full ${selectClass}`}
                                                    >
                                                        {TRUST_ICON_NAMES.map((name) => (
                                                            <option key={name} value={name}>
                                                                {name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </td>
                                            <td className="py-2 px-3">
                                                <Input
                                                    value={item.label}
                                                    onChange={(e) => updateItem(index, { label: e.target.value })}
                                                    maxLength={60}
                                                    aria-label={`Texto do item ${index + 1}`}
                                                    className="h-9 bg-white"
                                                />
                                            </td>
                                            <td className="py-2 px-3">
                                                <div className="flex justify-end gap-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => moveItem(index, -1)}
                                                        disabled={index === 0}
                                                        aria-label="Subir"
                                                        className="p-1.5 rounded-md text-mc-ink/60 hover:bg-mc-blush-100 disabled:opacity-30"
                                                    >
                                                        <ArrowUp size={15} />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => moveItem(index, 1)}
                                                        disabled={index === trustItems.length - 1}
                                                        aria-label="Descer"
                                                        className="p-1.5 rounded-md text-mc-ink/60 hover:bg-mc-blush-100 disabled:opacity-30"
                                                    >
                                                        <ArrowDown size={15} />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setTrustItems((items) => items.filter((_, i) => i !== index))}
                                                        aria-label="Remover item"
                                                        className="p-1.5 rounded-md text-red-600 hover:bg-red-50"
                                                    >
                                                        <Trash2 size={15} />
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

                <div className="flex flex-wrap gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        disabled={trustItems.length >= MAX_TRUST_ITEMS}
                        onClick={() => setTrustItems((items) => [...items, { icon: "Sparkles", label: "" }])}
                    >
                        <Plus size={14} /> Adicionar item
                    </Button>
                    <Button
                        type="button"
                        onClick={handleSaveTrust}
                        disabled={savingTrust}
                        className="bg-mc-violet-950 hover:bg-mc-violet-800 text-mc-sand-50"
                    >
                        {savingTrust ? "Salvando..." : "Salvar faixa de confiança"}
                    </Button>
                </div>

                <p className="mt-5 mb-1.5 text-xs uppercase tracking-wide text-mc-ink/50">Como está no site agora</p>
                <div className="overflow-hidden rounded-md border border-mc-violet-950/10">
                    <TrustStrip />
                </div>
            </Block>

            {/* 3. Cupons */}
            <Block
                title={`Cupons (${coupons.length})`}
                description="Cupons que qualquer cliente pode usar no checkout. Descontos exclusivos de um cliente ficam na página do usuário."
            >
                {couponFormOpen ? (
                    <CouponForm mode="generic" onSubmit={handleCreateCoupon} onCancel={() => setCouponFormOpen(false)} />
                ) : (
                    <Button
                        size="sm"
                        onClick={() => setCouponFormOpen(true)}
                        className="mb-4 bg-mc-violet-950 hover:bg-mc-violet-800 text-mc-sand-50"
                    >
                        <Plus size={14} /> Criar cupom
                    </Button>
                )}
                <CouponsTable
                    coupons={coupons}
                    showFirstPurchase
                    busyId={busyCouponId}
                    onToggle={handleToggleCoupon}
                    emptyText="Nenhum cupom criado ainda."
                />
            </Block>
        </div>
    );
}
