import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import { api } from "../../services/api";

type Category = {
    id: string;
    name: string;
    slug: string;
};

function toSlugSafe(value: string) {
    return value
        .toLowerCase()
        .trim()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9\-]/g, "");
}

const FALLBACK_CATEGORIES: Category[] = [
    { id: "pedras", name: "Pedras", slug: "pedras" },
    { id: "incensos", name: "Incensos", slug: "incensos" },
    { id: "energia", name: "Energia", slug: "energia" },
    { id: "para-casa", name: "Para Casa", slug: "para-casa" },
    { id: "acessorios", name: "Acessórios", slug: "acessorios" },
    { id: "bem-estar", name: "Bem Estar", slug: "bem-estar" },
];

export function CategoryStrip() {
    const navigate = useNavigate();
    const [categories, setCategories] = useState<Category[] | null>(null);

    useEffect(() => {
        let mounted = true;

        async function fetchCategories() {
            try {
                const res = await api.get<Category[]>("/category");

                const formatted = (res.data ?? []).map((category) => ({
                    id: String(category.id),
                    name: String(category.name),
                    slug: category.slug || toSlugSafe(category.name),
                }));

                if (mounted) {
                    setCategories(
                        formatted.length ? formatted : FALLBACK_CATEGORIES
                    );
                }
            } catch (err) {
                if (!axios.isAxiosError(err)) return;

                if (mounted) {
                    setCategories(FALLBACK_CATEGORIES);
                }
            }
        }

        fetchCategories();

        return () => {
            mounted = false;
        };
    }, []);

    const resolved = categories ?? FALLBACK_CATEGORIES;

    return (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
            <h2 className="font-display text-2xl sm:text-3xl text-[#765075] mb-6">
                Encontre pela{" "}
                <span className="italic text-mc-gold-600">
                    categoria
                </span>
            </h2>

            <div className="flex flex-wrap gap-x-8 gap-y-5">
                {resolved.map((cat) => (
                    <button
                        key={cat.slug}
                        onClick={() => navigate(`/categoria/${cat.slug}`)}
                        className="group text-left"
                    >
                        <span className="font-display text-lg sm:text-xl text-[#765075] transition-colors group-hover:text-mc-gold-600">
                            {cat.name}
                        </span>

                        <div className="mt-2 h-px w-0 bg-mc-gold-600 transition-all duration-300 group-hover:w-full" />
                    </button>
                ))}
            </div>
        </section>
    );
}