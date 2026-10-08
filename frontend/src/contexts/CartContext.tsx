import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import axios from "axios";
import { api } from "../services/api";
import { getToken } from "../lib/auth";
import type { Cart } from "../types";

interface CartContextData {
    cart: Cart | null;
    itemCount: number;
    loading: boolean;
    refreshCart: () => Promise<void>;
    addItem: (product_id: string, quantity?: number) => Promise<void>;
    updateItem: (item_id: string, quantity: number) => Promise<void>;
    removeItem: (item_id: string) => Promise<void>;
}

const CartContext = createContext<CartContextData | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const [cart, setCart] = useState<Cart | null>(null);
    const [loading, setLoading] = useState(false);

    const refreshCart = useCallback(async () => {
        if (!getToken()) {
            setCart(null);
            return;
        }
        setLoading(true);
        try {
            const { data } = await api.get<Cart>("/cart");
            setCart(data);
        } catch {
            setCart(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        refreshCart();
    }, [refreshCart]);

    const addItem = useCallback(
        async (product_id: string, quantity = 1) => {
            await api.post("/cart/items", { product_id, quantity });
            await refreshCart();
        },
        [refreshCart]
    );

    // Se a chamada falhar (ex.: o carrinho do servidor já foi esvaziado ao criar o pedido),
    // ressincroniza ANTES de relançar o erro, para a tela mostrar o estado real.
    const updateItem = useCallback(
        async (item_id: string, quantity: number) => {
            try {
                await api.patch(`/cart/items/${item_id}`, { quantity });
            } catch (error) {
                await refreshCart();
                throw error;
            }
            await refreshCart();
        },
        [refreshCart]
    );

    const removeItem = useCallback(
        async (item_id: string) => {
            try {
                await api.delete(`/cart/items/${item_id}`);
            } catch (error) {
                await refreshCart();
                // "Item não encontrado": o objetivo (item fora do carrinho) já está cumprido
                if (axios.isAxiosError(error) && error.response?.status === 404) return;
                throw error;
            }
            await refreshCart();
        },
        [refreshCart]
    );

    const itemCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

    return (
        <CartContext.Provider
            value={{ cart, itemCount, loading, refreshCart, addItem, updateItem, removeItem }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error("useCart deve ser usado dentro de um CartProvider");
    }
    return context;
}
