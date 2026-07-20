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

// O modelo de Order atual do backend ainda segue o padrão original de
// comanda de restaurante (mesa + rascunho), não um checkout de e-commerce
// de verdade (sem endereço, sem pagamento). Mantido aqui só para não
// quebrar a página de pedidos existente.
export interface Item {
    id: string;
    amount: number;
    product: {
        id: string;
        name: string;
        price: number;
        description: string;
        banner: string;
    };
}

export interface Order {
    id: string;
    table: number;
    status: boolean;
    draft: boolean;
    name: string | null;
    createdAt: string;
    items?: Item[];
}
