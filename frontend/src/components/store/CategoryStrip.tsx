import { useNavigate } from "react-router-dom";

interface CategoryItem {
    name: string;
    slug: string;
    emoji: string;
}

const CATEGORIES: CategoryItem[] = [
    { name: "Pedras", slug: "pedras", emoji: "💎" },
    { name: "Incensos", slug: "incensos", emoji: "🕯️" },
    { name: "Energia", slug: "energia", emoji: "🔮" },
    { name: "Para Casa", slug: "para-casa", emoji: "🏡" },
    { name: "Acessórios", slug: "acessorios", emoji: "📿" },
    { name: "Bem Estar", slug: "bem-estar", emoji: "🌿" },
];

export function CategoryStrip() {
    const navigate = useNavigate();

    return (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
            <h2 className="font-display text-2xl sm:text-3xl text-mc-violet-950 mb-6">
                Encontre pela <span className="italic text-mc-gold-600">categoria</span>
            </h2>
            <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-2 -mx-1 px-1">
                {CATEGORIES.map((cat) => (
                    <button
                        key={cat.slug}
                        onClick={() => navigate(`/categoria/${cat.slug}`)}
                        className="shrink-0 flex flex-col items-center gap-2 group"
                    >
                        <span className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-mc-blush-100 flex items-center justify-center text-2xl sm:text-3xl border border-mc-violet-950/10 group-hover:border-mc-gold-500 group-hover:bg-mc-blush-200 transition-colors">
                            {cat.emoji}
                        </span>
                        <span className="text-xs font-medium text-mc-ink/70 group-hover:text-mc-violet-950">
                            {cat.name}
                        </span>
                    </button>
                ))}
            </div>
        </section>
    );
}
