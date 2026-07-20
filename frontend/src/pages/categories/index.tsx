import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnnouncementBar } from "../../components/store/AnnouncementBar";
import { StoreHeader } from "../../components/store/StoreHeader";
import { StoreFooter } from "../../components/store/StoreFooter";
import { Loading } from "../../components/Loading";
import { api } from "../../services/api";
import { showApiError } from "../../lib/utils-api";
import type { Category } from "../../types";

const EMOJI_BY_SLUG: Record<string, string> = {
    pedras: "💎",
    incensos: "🕯️",
    energia: "🔮",
    "para-casa": "🏡",
    acessorios: "📿",
    "bem-estar": "🌿",
    iniciante: "🌱",
    kits: "🎁",
};

export function Categories() {
    const navigate = useNavigate();
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;
        api
            .get<Category[]>("/category")
            .then(({ data }) => {
                if (mounted) setCategories(data);
            })
            .catch((error) => {
                if (mounted) showApiError(error, "Erro ao carregar categorias");
            })
            .finally(() => {
                if (mounted) setLoading(false);
            });
        return () => {
            mounted = false;
        };
    }, []);

    return (
        <div className="min-h-screen bg-mc-sand-50 flex flex-col">
            <AnnouncementBar />
            <StoreHeader />

            <main className="flex-1">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-14">
                    <h1 className="font-display text-3xl sm:text-4xl text-mc-violet-950 mb-2">
                        Todas as <span className="italic text-mc-gold-600">categorias</span>
                    </h1>
                    <p className="text-sm text-mc-ink/60 mb-8">
                        Encontre exatamente o que você está buscando.
                    </p>

                    {loading ? (
                        <div className="py-16 flex justify-center">
                            <Loading />
                        </div>
                    ) : categories.length === 0 ? (
                        <p className="text-sm text-mc-ink/60">
                            Nenhuma categoria disponível no momento.
                        </p>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
                            {categories.map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => navigate(`/categoria/${cat.slug}`)}
                                    className="group facet-cut-sm bg-mc-blush-100 hover:bg-mc-blush-200 border border-mc-violet-950/10 p-6 sm:p-8 flex flex-col items-center gap-3 transition-colors"
                                >
                                    <span className="text-4xl sm:text-5xl">
                                        {EMOJI_BY_SLUG[cat.slug] ?? "💎"}
                                    </span>
                                    <span className="text-sm font-medium text-mc-violet-950 group-hover:text-mc-violet-800 text-center">
                                        {cat.name}
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            <StoreFooter />
        </div>
    );
}
