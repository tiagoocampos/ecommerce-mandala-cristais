export interface User {
    id: string;
    name: string;
    email: string;
    role: "STAFF" | "ADMIN";
    createdAt?: string;
}

export interface Category {
    id: string;
    name: string;
    createdAt: string;
}

export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    banner: string;
    disabled?: boolean;
    category_id?: string;
    createdAt?: string;
    category?: {
        name: string;
    };
}

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
