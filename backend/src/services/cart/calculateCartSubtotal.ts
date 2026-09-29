type CartItemWithProduct = {
    quantity: number;
    product: { price: number; promo_price: number | null };
};

// Mesma regra usada na criação do pedido: promo_price quando existir.
export function calculateCartSubtotal(items: CartItemWithProduct[]): number {
    return items.reduce((total, item) => {
        const price = item.product.promo_price ?? item.product.price;
        return total + price * item.quantity;
    }, 0);
}
