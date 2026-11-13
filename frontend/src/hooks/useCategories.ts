import { useEffect, useState } from "react";
import { api } from "../services/api";
import type { Category } from "../types";

// Cache simples: rodapé e home compartilham uma única requisição por carregamento do site
let cached: Category[] | null = null;
let inflight: Promise<Category[]> | null = null;

function load(): Promise<Category[]> {
    if (!inflight) {
        inflight = api
            .get<Category[]>("/category")
            .then(({ data }) => (cached = data))
            .catch(() => {
                inflight = null;
                return [] as Category[];
            });
    }
    return inflight;
}

/** Categorias reais do backend (lista vazia enquanto carrega ou se a API falhar). */
export function useCategories(): Category[] {
    const [categories, setCategories] = useState<Category[]>(cached ?? []);
    useEffect(() => {
        let mounted = true;
        if (!cached) load().then((data) => mounted && setCategories(data));
        return () => {
            mounted = false;
        };
    }, []);
    return categories;
}
