import { useEffect } from "react";

// Título e <meta name="description"> por página, sem biblioteca extra.
// Ao sair da página, volta ao título/descrição padrão do index.html.
export function usePageMeta({ title, description }: { title?: string | null; description?: string | null }) {
    useEffect(() => {
        const previousTitle = document.title;
        let meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
        const created = !meta;
        if (!meta) {
            meta = document.createElement("meta");
            meta.name = "description";
            document.head.appendChild(meta);
        }
        const previousDescription = meta.content;

        if (title) document.title = title;
        if (description) meta.content = description;

        return () => {
            document.title = previousTitle;
            if (created) meta!.remove();
            else meta!.content = previousDescription;
        };
    }, [title, description]);
}
