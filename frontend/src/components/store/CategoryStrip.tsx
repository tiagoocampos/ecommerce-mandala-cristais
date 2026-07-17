import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import { api } from "../../services/api";

type Category = {
  id: string;
  name: string;
  slug: string;
};

type CategoryWithEmoji = Category & { emoji: string };

const EMOJI_BY_SLUG: Record<string, string> = {
  pedras: "💎",
  incensos: "🕯️",
  energia: "🔮",
  "para-casa": "🏡",
  acessorios: "📿",
  "bem-estar": "🌿",
};

const FALLBACK_CATEGORIES: CategoryWithEmoji[] = [
  { id: "pedras", name: "Pedras", slug: "pedras", emoji: "💎" },
  { id: "incensos", name: "Incensos", slug: "incensos", emoji: "🕯️" },
  { id: "energia", name: "Energia", slug: "energia", emoji: "🔮" },
  { id: "para-casa", name: "Para Casa", slug: "para-casa", emoji: "🏡" },
  { id: "acessorios", name: "Acessórios", slug: "acessorios", emoji: "📿" },
  { id: "bem-estar", name: "Bem Estar", slug: "bem-estar", emoji: "🌿" },
];

function toSlugSafe(value: string) {
  return value
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\-]/g, "");
}

export function CategoryStrip() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<CategoryWithEmoji[] | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchCategories() {
      try {
        const res = await api.get<Category[]>("/category");
        const withEmoji: CategoryWithEmoji[] = (res.data ?? []).map((c) => {
          const maybe = c as Partial<Category> & {
            id?: unknown;
            slug?: unknown;
            name?: unknown;
          };

          const rawSlug = (maybe.slug as unknown) ?? "";
          const rawName = (maybe.name as unknown) ?? "";

          const slug =
            typeof rawSlug === "string" && rawSlug
              ? rawSlug
              : toSlugSafe(String(rawName));

          return {
            id: String(maybe.id ?? slug),
            name: String(maybe.name ?? slug),
            slug,
            emoji: EMOJI_BY_SLUG[slug] ?? "💎",
          };
        });

        if (mounted) setCategories(withEmoji.length ? withEmoji : FALLBACK_CATEGORIES);
      } catch (err) {
        if (!axios.isAxiosError(err)) return;
        if (mounted) setCategories(FALLBACK_CATEGORIES);
      }
    }

    fetchCategories();

    return () => {
      mounted = false;
    };
  }, []);

  const resolved = useMemo(() => categories ?? FALLBACK_CATEGORIES, [categories]);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      <h2 className="font-display text-2xl sm:text-3xl text-mc-violet-950 mb-6">
        Encontre pela <span className="italic text-mc-gold-600">categoria</span>
      </h2>

      <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-2 -mx-1 px-1">
        {resolved.map((cat) => (
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

