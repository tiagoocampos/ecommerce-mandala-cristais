import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { api } from "../../services/api";
import { Header } from "../../components/Header";
import { Loading } from "../../components/Loading";
import { ProtectedRoute } from "../../components/ProtectedRoute";
import { Button } from "../../components/ui/button";
import { getAuthHeaders } from "../../lib/auth";
import {
    formatDate,
    formatPrice,
    inputClassName,
    buttonClassName,
    showApiError,
} from "../../lib/utils-api";
import type { Order, Product } from "../../types";

export function Orders() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

    const [table, setTable] = useState("");
    const [name, setName] = useState("");

    const [addItemOrderId, setAddItemOrderId] = useState<string | null>(null);
    const [selectedProductId, setSelectedProductId] = useState("");
    const [amount, setAmount] = useState("1");

    useEffect(() => {
        fetchData();
    }, []);

    async function fetchData() {
        const headers = getAuthHeaders();
        if (!headers) return;

        try {
            const [sentRes, draftRes, productsRes] = await Promise.all([
                api.get("/orders", { headers }),
                api.get("/orders?draft=true", { headers }),
                api.get("/products?disabled=false", { headers }),
            ]);

            const allOrders = [...draftRes.data, ...sentRes.data]
                .filter((order: Order) => !order.status) // remove pedidos já finalizados
                .sort(
                    (a: Order, b: Order) =>
                        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                );

            setOrders(allOrders);
            setProducts(productsRes.data);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                showApiError(error, "Erro ao carregar pedidos");
            }
        } finally {
            setLoading(false);
        }
    }

    async function handleCreateOrder() {
        const headers = getAuthHeaders();
        if (!headers) return;

        try {
            if (!table) {
                toast.error("Informe o número da mesa", { position: "top-center" });
                return;
            }

            setSubmitting(true);

            const response = await api.post(
                "/order",
                {
                    table: Number(table),
                    name: name.trim() || `Mesa ${table}`,
                },
                { headers }
            );

            toast.success("Pedido criado com sucesso!", { position: "top-center" });
            setTable("");
            setName("");
            setShowCreateForm(false);
            await fetchData();

            // Abre automaticamente o formulário de "Adicionar item" pro pedido recém-criado
            const newOrderId = response.data.id;
            if (newOrderId) {
                setAddItemOrderId(newOrderId);
            }

        } catch (error) {
            if (axios.isAxiosError(error)) {
                showApiError(error, "Erro ao criar pedido");
            }
        } finally {
            setSubmitting(false);
        }
    }

    async function handleAddItem(orderId: string) {
        const headers = getAuthHeaders();
        if (!headers) return;

        try {
            if (!selectedProductId || !amount) {
                toast.error("Selecione o produto e a quantidade", { position: "top-center" });
                return;
            }

            setSubmitting(true);

            await api.post(
                "/order/add",
                {
                    order_id: orderId,
                    product_id: selectedProductId,
                    amount: Number(amount),
                },
                { headers }
            );

            toast.success("Item adicionado!", { position: "top-center" });
            setAddItemOrderId(null);
            setSelectedProductId("");
            setAmount("1");
            await fetchData();

        } catch (error) {
            if (axios.isAxiosError(error)) {
                showApiError(error, "Erro ao adicionar item");
            }
        } finally {
            setSubmitting(false);
        }
    }

    async function handleSendOrder(order: Order) {
        const headers = getAuthHeaders();
        if (!headers) return;

        try {
            setSubmitting(true);

            await api.put(
                "/order/send",
                {
                    order_id: order.id,
                    name: order.name || `Mesa ${order.table}`,
                },
                { headers }
            );

            toast.success("Pedido enviado para a cozinha!", { position: "top-center" });
            await fetchData();
        } catch (error) {
            if (axios.isAxiosError(error)) {
                showApiError(error, "Erro ao enviar pedido");
            }
        } finally {
            setSubmitting(false);
        }
    }

    async function handleFinishOrder(orderId: string) {
        const headers = getAuthHeaders();
        if (!headers) return;

        try {
            setSubmitting(true);

            await api.put("/order/finish", { order_id: orderId }, { headers });

            toast.success("Pedido finalizado!", { position: "top-center" });
            // Remove o pedido da tela imediatamente, sem esperar novo fetch
            setOrders((prev) => prev.filter((order) => order.id !== orderId));
        } catch (error) {
            if (axios.isAxiosError(error)) {
                showApiError(error, "Erro ao finalizar pedido");
            }
        } finally {
            setSubmitting(false);
        }
    }

    async function handleRemoveItem(itemId: string) {
        const headers = getAuthHeaders();
        if (!headers) return;

        try {
            setSubmitting(true);

            await api.delete(`/order/remove?item_id=${itemId}`, { headers });

            toast.success("Item removido!", { position: "top-center" });
            await fetchData();
        } catch (error) {
            if (axios.isAxiosError(error)) {
                showApiError(error, "Erro ao remover item");
            }
        } finally {
            setSubmitting(false);
        }
    }

    async function handleDeleteOrder(orderId: string) {
        const headers = getAuthHeaders();
        if (!headers) return;

        try {
            setSubmitting(true);

            await api.delete(`/order?order_id=${orderId}`, { headers });

            toast.success("Pedido removido!", { position: "top-center" });
            await fetchData();
        } catch (error) {
            if (axios.isAxiosError(error)) {
                showApiError(error, "Erro ao remover pedido");
            }
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-[#baa88d]">
                <Header />

                <main className="px-4 sm:px-6 lg:px-8 py-6 max-w-5xl mx-auto">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                        <h1 className="text-gray-100 text-xl font-semibold">Pedidos</h1>
                        <button
                            onClick={() => setShowCreateForm(!showCreateForm)}
                            className="bg-amber-950 text-gray-100 text-sm px-4 py-3 rounded-sm hover:bg-amber-950/80 w-full sm:w-auto"
                        >
                            {showCreateForm ? "Cancelar" : "Novo pedido"}
                        </button>
                    </div>

                    {showCreateForm && (
                        <div className="bg-gray-200 rounded-md p-4 mb-6 flex flex-col gap-3">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="flex flex-col gap-1">
                                    <label className="text-sm text-gray-700">Mesa</label>
                                    <input
                                        value={table}
                                        onChange={(e) => setTable(e.target.value)}
                                        type="number"
                                        min="1"
                                        placeholder="Número da mesa"
                                        className={inputClassName}
                                    />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className="text-sm text-gray-700">
                                        Nome do cliente (opcional)
                                    </label>
                                    <input
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        type="text"
                                        placeholder="Nome do cliente"
                                        className={inputClassName}
                                    />
                                </div>
                            </div>
                            <Button
                                onClick={handleCreateOrder}
                                disabled={submitting}
                                className={`${buttonClassName} sm:w-auto sm:px-6 cursor-pointer text-sm font-medium`}
                            >
                                {submitting ? <Loading /> : "Criar pedido"}
                            </Button>
                        </div>
                    )}

                    {loading ? (
                        <Loading />
                    ) : orders.length === 0 ? (
                        <p className="text-gray-200 text-sm">Nenhum pedido encontrado.</p>
                    ) : (
                        <div className="flex flex-col gap-4">
                            {orders.map((order) => (
                                <div key={order.id} className="bg-gray-200 rounded-md p-4 flex flex-col gap-3">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-sm font-medium text-gray-700">
                                                Mesa {order.table}
                                                {order.name && ` — ${order.name}`}
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                {formatDate(order.createdAt)}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            <span
                                                className={`text-xs px-2 py-1 rounded-sm ${
                                                    order.status
                                                        ? "bg-green-100 text-green-800"
                                                        : "bg-yellow-100 text-yellow-800"
                                                }`}
                                            >
                                                {order.status ? "Fechado" : "Aberto"}
                                            </span>
                                            <span
                                                className={`text-xs px-2 py-1 rounded-sm ${
                                                    order.draft
                                                        ? "bg-orange-100 text-orange-800"
                                                        : "bg-blue-100 text-blue-800"
                                                }`}
                                            >
                                                {order.draft ? "Rascunho" : "Enviado"}
                                            </span>
                                        </div>
                                    </div>

                                    {order.items && order.items.length > 0 && (
                                        <div className="flex flex-col gap-2">
                                            <button
                                                onClick={() =>
                                                    setExpandedOrderId(
                                                        expandedOrderId === order.id ? null : order.id
                                                    )
                                                }
                                                className="text-xs text-amber-950 underline text-left"
                                            >
                                                {expandedOrderId === order.id
                                                    ? "Ocultar itens"
                                                    : `Ver itens (${order.items.length})`}
                                            </button>

                                            {expandedOrderId === order.id && (
                                                <div className="flex flex-col gap-2">
                                                    {order.items.map((item) => (
                                                        <div
                                                            key={item.id}
                                                            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 bg-gray-100 rounded-sm p-2"
                                                        >
                                                            <span className="text-xs text-gray-700">
                                                                {item.amount}x {item.product.name} —{" "}
                                                                {formatPrice(
                                                                    item.product.price * item.amount
                                                                )}
                                                            </span>
                                                            {order.draft && (
                                                                <button
                                                                    onClick={() =>
                                                                        handleRemoveItem(item.id)
                                                                    }
                                                                    disabled={submitting}
                                                                    className="text-xs text-red-800 hover:underline"
                                                                >
                                                                    Remover
                                                                </button>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {addItemOrderId === order.id ? (
                                        <div className="flex flex-col gap-3 border-t border-gray-300 pt-3">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                <select
                                                    value={selectedProductId}
                                                    onChange={(e) =>
                                                        setSelectedProductId(e.target.value)
                                                    }
                                                    className={inputClassName}
                                                >
                                                    <option value="">Selecione o produto</option>
                                                    {products.map((product) => (
                                                        <option key={product.id} value={product.id}>
                                                            {product.name} —{" "}
                                                            {formatPrice(product.price)}
                                                        </option>
                                                    ))}
                                                </select>
                                                <input
                                                    value={amount}
                                                    onChange={(e) => setAmount(e.target.value)}
                                                    type="number"
                                                    min="1"
                                                    placeholder="Quantidade"
                                                    className={inputClassName}
                                                />
                                            </div>
                                            <div className="flex flex-col sm:flex-row gap-2">
                                                <Button
                                                    onClick={() => handleAddItem(order.id)}
                                                    disabled={submitting}
                                                    className={`${buttonClassName} sm:w-auto sm:px-6 cursor-pointer text-sm font-medium`}
                                                >
                                                    {submitting ? <Loading /> : "Confirmar"}
                                                </Button>
                                                <button
                                                    onClick={() => {
                                                        setAddItemOrderId(null);
                                                        setSelectedProductId("");
                                                        setAmount("1");
                                                    }}
                                                    className="text-sm text-gray-600 hover:underline py-3"
                                                >
                                                    Cancelar
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col sm:flex-row gap-2">
                                            {order.draft && !order.status && (
                                                <>
                                                    <button
                                                        onClick={() => setAddItemOrderId(order.id)}
                                                        className="bg-amber-950 text-gray-100 text-sm px-4 py-3 rounded-sm hover:bg-amber-950/80 w-full sm:w-auto"
                                                    >
                                                        Adicionar item
                                                    </button>
                                                    <button
                                                        onClick={() => handleSendOrder(order)}
                                                        disabled={submitting}
                                                        className="bg-gray-300 text-amber-950 text-sm px-4 py-3 rounded-sm hover:bg-gray-400 w-full sm:w-auto"
                                                    >
                                                        Enviar para cozinha
                                                    </button>
                                                </>
                                            )}
                                            {!order.status && !order.draft && (
                                                <button
                                                    onClick={() => handleFinishOrder(order.id)}
                                                    disabled={submitting}
                                                    className="bg-green-800 text-gray-100 text-sm px-4 py-3 rounded-sm hover:bg-green-800/80 w-full sm:w-auto"
                                                >
                                                    Finalizar pedido
                                                </button>
                                            )}
                                            {order.draft && (
                                                <button
                                                    onClick={() => handleDeleteOrder(order.id)}
                                                    disabled={submitting}
                                                    className="text-sm text-red-800 hover:underline py-3 w-full sm:w-auto"
                                                >
                                                    Remover pedido
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </main>
            </div>
        </ProtectedRoute>
    );
}
