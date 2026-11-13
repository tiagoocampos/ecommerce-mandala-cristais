import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import axios from "axios";
import { api } from "../services/api";
import { getToken, subscribeAuth } from "../lib/auth";
import type { Cart } from "../types";

interface CartContextData {
    cart: Cart | null;
    itemCount: number;
    loading: boolean;
    /** a última tentativa de carregar o carrinho falhou (rede/500) */
    error: boolean;
    refreshCart: () => Promise<void>;
    addItem: (product_id: string, quantity?: number) => Promise<void>;
    updateItem: (item_id: string, quantity: number) => Promise<void>;
    removeItem: (item_id: string) => Promise<void>;
}

const CartContext = createContext<CartContextData | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const [cart, setCart] = useState<Cart | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    // Cada mudança de sessão invalida respostas em voo: o carrinho de quem saiu nunca "volta"
    const sessionVersion = useRef(0);

    const refreshCart = useCallback(async () => {
        if (!getToken()) {
            setCart(null);
            return;
        }
        const version = sessionVersion.current;
        setLoading(true);
        try {
            const { data } = await api.get<Cart>("/cart");
            if (version !== sessionVersion.current) return; // sessão mudou durante a requisição
            setCart(data);
            setError(false);
        } catch (err) {
            // Sessão vencida/inválida: o interceptor da api encerra a sessão (limpa tudo e vai
            // para o login); aqui não engolimos o erro como se fosse "carrinho vazio".
            // Outros erros (rede, 500): mantém o carrinho anterior em vez de zerar a tela.
            if (version === sessionVersion.current) {
                if (axios.isAxiosError(err) && err.response?.status === 401) setCart(null);
                else setError(true);
            }
        } finally {
            if (version === sessionVersion.current) setLoading(false);
        }
    }, []);

    // Login/logout/expiração (nesta aba ou em outra): sem token zera na hora; com token busca o carrinho DESSA conta
    useEffect(() => {
        return subscribeAuth(() => {
            sessionVersion.current += 1;
            setError(false);
            if (!getToken()) {
                setCart(null);
                setLoading(false);
            } else {
                setCart(null); // não mostra o carrinho da conta anterior enquanto carrega
                refreshCart();
            }
        });
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
            value={{ cart, itemCount, loading, error, refreshCart, addItem, updateItem, removeItem }}
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
