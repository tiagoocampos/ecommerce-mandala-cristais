import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

// Estado puramente visual do mini-carrinho (Sheet lateral).
// Os dados do carrinho continuam vindo do CartContext.
interface CartDrawerContextData {
    open: boolean;
    setOpen: (open: boolean) => void;
    openCart: () => void;
}

const CartDrawerContext = createContext<CartDrawerContextData | undefined>(undefined);

export function CartDrawerProvider({ children }: { children: ReactNode }) {
    const [open, setOpen] = useState(false);

    return (
        <CartDrawerContext.Provider value={{ open, setOpen, openCart: () => setOpen(true) }}>
            {children}
        </CartDrawerContext.Provider>
    );
}

export function useCartDrawer() {
    const context = useContext(CartDrawerContext);
    if (!context) {
        throw new Error("useCartDrawer deve ser usado dentro de um CartDrawerProvider");
    }
    return context;
}
