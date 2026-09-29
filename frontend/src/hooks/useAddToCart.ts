import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { getToken } from "../lib/auth";
import { showApiError } from "../lib/utils-api";
import { useCart } from "../contexts/CartContext";
import { useCartDrawer } from "../contexts/CartDrawerContext";

// Fluxo único de "adicionar ao carrinho": exige login, adiciona e abre o mini-carrinho.
export function useAddToCart() {
    const navigate = useNavigate();
    const { addItem } = useCart();
    const { openCart } = useCartDrawer();

    return async function addToCart(product_id: string, quantity = 1): Promise<boolean> {
        if (!getToken()) {
            toast.info("Entre na sua conta para adicionar ao carrinho", {
                position: "top-center",
            });
            navigate("/login");
            return false;
        }

        try {
            await addItem(product_id, quantity);
            openCart();
            return true;
        } catch (error) {
            showApiError(error, "Não foi possível adicionar ao carrinho");
            return false;
        }
    };
}
