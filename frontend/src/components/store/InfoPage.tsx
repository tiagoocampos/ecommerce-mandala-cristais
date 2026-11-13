import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { AnnouncementBar } from "./AnnouncementBar";
import { StoreHeader } from "./StoreHeader";
import { StoreFooter } from "./StoreFooter";
import { usePageMeta } from "../../hooks/usePageMeta";

interface InfoPageProps {
    title: string;
    /** meta description */
    description: string;
    intro?: string;
    children: ReactNode;
}

// Layout comum das páginas institucionais (texto à esquerda, largura de leitura confortável)
export function InfoPage({ title, description, intro, children }: InfoPageProps) {
    const navigate = useNavigate();
    usePageMeta({ title: `${title} — Mandala Crystais`, description });

    return (
        <div className="min-h-screen bg-mc-sand-50 flex flex-col">
            <AnnouncementBar />
            <StoreHeader />

            <main className="flex-1">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="mb-6 inline-flex min-h-11 items-center gap-1.5 text-sm text-mc-ink/60 hover:text-mc-violet-950"
                    >
                        <ArrowLeft size={15} aria-hidden="true" /> Voltar
                    </button>

                    <h1 className="font-display text-3xl sm:text-4xl text-mc-violet-950">{title}</h1>
                    {intro && <p className="mt-3 text-base text-mc-ink/70 max-w-2xl">{intro}</p>}

                    <div className="mt-8 space-y-8 text-[15px] leading-relaxed text-mc-ink/80">{children}</div>
                </div>
            </main>

            <StoreFooter />
        </div>
    );
}

export function InfoSection({ title, children, id }: { title: string; children: ReactNode; id?: string }) {
    return (
        <section id={id} className="scroll-mt-24">
            <h2 className="font-display text-xl text-mc-violet-950 mb-2">{title}</h2>
            <div className="space-y-3">{children}</div>
        </section>
    );
}
