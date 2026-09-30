export interface User {
    id: string;
    name: string;
    email: string;
    phone?: string;
    role: "CUSTOMER" | "ADMIN";
    createdAt?: string;
}

export interface Category {
    id: string;
    name: string;
    slug: string;
    createdAt: string;
}

export interface Product {
    id: string;
    name: string;
    slug: string;
    description: string;
    price: number;
    promo_price?: number | null;
    stock: number;
    banner: string;
    disabled?: boolean;
    category_id?: string;
    createdAt?: string;
    // pacote para frete (null = não cadastrado; cotação usa pacote padrão)
    weight_grams?: number | null;
    height_cm?: number | null;
    width_cm?: number | null;
    length_cm?: number | null;
    // SEO/acessibilidade (opcionais; podem ser gerados pelo "Pedir pra IA")
    meta_description?: string | null;
    image_alt_text?: string | null;
    featured?: boolean; // aparece no carrossel de destaques da home
    category?: {
        id?: string;
        name: string;
        slug?: string;
    };
}

export interface Address {
    id: string;
    street: string;
    number: string;
    complement?: string | null;
    neighborhood: string;
    city: string;
    state: string;
    zip_code: string;
    user_id?: string;
    createdAt?: string;
}

export interface CartItem {
    id: string;
    quantity: number;
    product: Product;
}

export interface Cart {
    id: string;
    items: CartItem[];
}

export type OrderStatus = "PENDING" | "PAID" | "SHIPPED" | "DELIVERED" | "CANCELED";

export interface OrderItemProduct {
    id: string;
    name: string;
    price: number;
    promo_price: number | null;
    banner: string;
}

export interface OrderItem {
    id: string;
    quantity: number;
    unit_price: number;
    product: OrderItemProduct;
}

export interface Order {
    id: string;
    status: OrderStatus;
    subtotal: number;
    discount: number;
    shipping_cost: number;
    total: number;
    user_id: string;
    address_id: string;
    createdAt: string;
    updatedAt: string;
    items: OrderItem[];
}
