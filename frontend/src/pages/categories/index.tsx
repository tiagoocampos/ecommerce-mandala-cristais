import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnnouncementBar } from "../../components/store/AnnouncementBar";
import { StoreHeader } from "../../components/store/StoreHeader";
import { StoreFooter } from "../../components/store/StoreFooter";
import { Loading } from "../../components/Loading";
import { api } from "../../services/api";
import { showApiError } from "../../lib/utils-api";
import type { Category } from "../../types";

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
                    <h1 className="font-display text-3xl sm:text-4xl text-[#765075] mb-2">
                        Todas as{" "}
                        <span className="italic text-mc-gold-600">
                            categorias
                        </span>
                    </h1>

                    <p className="text-sm text-mc-ink/60 mb-10">
                        Encontre cristais e itens selecionados para cada momento.
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
                        <div className="flex flex-wrap gap-x-10 gap-y-6">
                            {categories.map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() =>
                                        navigate(`/categoria/${cat.slug}`)
                                    }
                                    className="group text-left"
                                >
                                    <span className="font-display text-xl sm:text-2xl text-[#765075] transition-colors group-hover:text-[#B08B3E]">
                                        {cat.name}
                                    </span>

                                    <div className="mt-2 h-px w-0 bg-[#B08B3E] transition-all duration-300 group-hover:w-full" />
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