import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Mail, Send } from "lucide-react";
import { Loading } from "../../components/Loading";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "../../components/ui/alert-dialog";
import { getApiErrorMessage, showApiError } from "../../lib/utils-api";
import { api } from "../../services/api";
import type { AdminUserListItem, MarketingSendResult } from "../../types/admin";

export function AdminMarketing() {
    const [users, setUsers] = useState<AdminUserListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [search, setSearch] = useState("");
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [sending, setSending] = useState(false);
    const [result, setResult] = useState<MarketingSendResult | null>(null);

    useEffect(() => {
        api.get<AdminUserListItem[]>("/admin/users")
            .then(({ data }) => setUsers(data))
            .catch((error) => showApiError(error, "Erro ao carregar clientes"))
            .finally(() => setLoading(false));
    }, []);

    const eligible = useMemo(() => users.filter((u) => !u.marketing_opt_out), [users]);
    const optedOutCount = users.length - eligible.length;

    const q = search.trim().toLowerCase();
    const visible = q
        ? users.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
        : users;
    const visibleEligible = visible.filter((u) => !u.marketing_opt_out);
    const allVisibleSelected = visibleEligible.length > 0 && visibleEligible.every((u) => selected.has(u.id));

    function toggle(id: string) {
        setSelected((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }

    function toggleAllVisible() {
        setSelected((prev) => {
            const next = new Set(prev);
            if (allVisibleSelected) visibleEligible.forEach((u) => next.delete(u.id));
            else visibleEligible.forEach((u) => next.add(u.id));
            return next;
        });
    }

    const canSend = subject.trim().length > 0 && message.trim().length > 0 && selected.size > 0;

    async function handleSend() {
        setSending(true);
        try {
            const { data } = await api.post<MarketingSendResult>("/admin/marketing/send", {
                subject: subject.trim(),
                message,
                user_ids: [...selected],
            });
            setResult(data);
            if (data.failed === 0) {
                toast.success(`Oferta enviada para ${data.sent} cliente(s)`);
            } else {
                toast.warning(`${data.sent} enviado(s), ${data.failed} falharam`);
            }
            setConfirmOpen(false);
        } catch (error) {
            toast.error(getApiErrorMessage(error, "Não foi possível enviar a oferta"));
        } finally {
            setSending(false);
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
        <div className="p-4 sm:p-6 max-w-5xl">
            <h1 className="font-display text-2xl sm:text-3xl text-mc-violet-950 mb-1">E-mail de ofertas</h1>
            <p className="text-sm text-mc-ink/60 mb-6">
                Escreva a mensagem e escolha os clientes. Todo e-mail vai com o visual da loja e um link para o
                cliente parar de receber ofertas.
            </p>

            <section className="mb-6 rounded-lg border border-mc-violet-950/10 bg-white p-4 sm:p-5 space-y-4">
                <div className="space-y-1.5">
                    <Label htmlFor="mk-subject">Assunto</Label>
                    <Input
                        id="mk-subject"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        maxLength={150}
                        placeholder="Nova coleção chegou! ✨"
                        className="bg-white"
                    />
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="mk-message">Mensagem</Label>
                    <textarea
                        id="mk-message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={7}
                        maxLength={10000}
                        placeholder={"Olá!\n\nAs ametistas que você pediu chegaram... Use o cupom DIACLIENTE20 até domingo."}
                        className="w-full rounded-lg border border-input bg-white px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20 resize-y"
                    />
                    <p className="text-xs text-mc-ink/50">Texto simples. Deixe uma linha em branco para separar parágrafos.</p>
                </div>
            </section>

            <section className="mb-6">
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-3">
                    <div>
                        <h2 className="font-display text-lg text-mc-violet-950">Destinatários</h2>
                        <p className="text-xs text-mc-ink/60">
                            {selected.size} selecionado(s) de {eligible.length} cliente(s) que aceitam ofertas
                            {optedOutCount > 0 && ` · ${optedOutCount} pediram para não receber`}
                        </p>
                    </div>
                    <input
                        type="search"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Buscar por nome ou e-mail"
                        aria-label="Buscar clientes"
                        className="w-full sm:w-64 rounded-lg border border-input bg-white px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20"
                    />
                </div>

                <div className="overflow-x-auto rounded-lg border border-mc-violet-950/10 max-h-[28rem] overflow-y-auto">
                    <table className="w-full text-sm">
                        <thead className="sticky top-0">
                            <tr className="bg-mc-blush-100 text-mc-violet-950 text-left">
                                <th className="py-2.5 px-4 w-10">
                                    <input
                                        type="checkbox"
                                        checked={allVisibleSelected}
                                        onChange={toggleAllVisible}
                                        disabled={visibleEligible.length === 0}
                                        aria-label="Selecionar todos"
                                        className="h-4 w-4 accent-mc-violet-700"
                                    />
                                </th>
                                <th className="py-2.5 px-4 font-medium">Nome</th>
                                <th className="py-2.5 px-4 font-medium">E-mail</th>
                                <th className="py-2.5 px-4 font-medium">Situação</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-mc-violet-950/10 bg-white">
                            {visible.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="py-8 text-center text-mc-ink/50">
                                        Nenhum cliente encontrado.
                                    </td>
                                </tr>
                            ) : (
                                visible.map((user) => {
                                    const optedOut = !!user.marketing_opt_out;
                                    return (
                                        <tr
                                            key={user.id}
                                            onClick={() => !optedOut && toggle(user.id)}
                                            className={optedOut ? "text-mc-ink/40" : "cursor-pointer hover:bg-mc-sand-50/80"}
                                        >
                                            <td className="py-2.5 px-4">
                                                <input
                                                    type="checkbox"
                                                    checked={selected.has(user.id)}
                                                    disabled={optedOut}
                                                    onChange={() => toggle(user.id)}
                                                    onClick={(e) => e.stopPropagation()}
                                                    aria-label={`Selecionar ${user.name}`}
                                                    className="h-4 w-4 accent-mc-violet-700"
                                                />
                                            </td>
                                            <td className={`py-2.5 px-4 ${optedOut ? "line-through" : "text-mc-violet-950"}`}>{user.name}</td>
                                            <td className={`py-2.5 px-4 ${optedOut ? "line-through" : "text-mc-ink/70"}`}>{user.email}</td>
                                            <td className="py-2.5 px-4 text-xs">
                                                {optedOut ? "Não aceita ofertas" : <span className="text-mc-success-700">Aceita ofertas</span>}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

            <div className="flex flex-wrap items-center gap-3">
                <Button
                    onClick={() => setConfirmOpen(true)}
                    disabled={!canSend || sending}
                    className="bg-mc-violet-950 hover:bg-mc-violet-800 text-mc-sand-50"
                >
                    <Send size={15} /> Enviar oferta
                </Button>
                {!canSend && (
                    <span className="text-xs text-mc-ink/50">Preencha assunto e mensagem e selecione ao menos um cliente.</span>
                )}
            </div>

            {result && (
                <div className="mt-6 rounded-lg border border-mc-violet-950/10 bg-white p-4 text-sm">
                    <p className="flex items-center gap-2 font-medium text-mc-violet-950">
                        <Mail size={16} /> Resultado do último envio
                    </p>
                    <ul className="mt-2 space-y-0.5 text-mc-ink/80">
                        <li>Enviados: <strong className="text-mc-success-700">{result.sent}</strong></li>
                        {result.failed > 0 && <li>Falharam: <strong className="text-destructive">{result.failed}</strong></li>}
                        {result.skipped_opted_out_or_missing > 0 && (
                            <li>Ignorados (descadastrados ou removidos): {result.skipped_opted_out_or_missing}</li>
                        )}
                    </ul>
                </div>
            )}

            <AlertDialog open={confirmOpen} onOpenChange={(open) => !sending && setConfirmOpen(open)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Enviar para {selected.size} cliente(s)?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Assunto: “{subject.trim()}”. Depois de enviado, não dá para desfazer.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={sending}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            disabled={sending}
                            onClick={(e) => {
                                e.preventDefault();
                                handleSend();
                            }}
                            className="bg-mc-violet-950 hover:bg-mc-violet-800 text-mc-sand-50"
                        >
                            {sending ? "Enviando..." : "Enviar agora"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
