import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "../ui/button";
import { SectionEyebrow } from "./Section";
import { HERO_IMAGES } from "../../config/home-images";
import { cn } from "../../lib/utils";

const AUTOPLAY_MS = 7000;

export function Hero() {
    const images = HERO_IMAGES;
    const multiple = images.length > 1;
    const [current, setCurrent] = useState(0);
    const [paused, setPaused] = useState(false);

    // Troca automática lenta: pausa com mouse/foco e não roda com prefers-reduced-motion
    useEffect(() => {
        if (!multiple || paused) return;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        const timer = setInterval(() => setCurrent((i) => (i + 1) % images.length), AUTOPLAY_MS);
        return () => clearInterval(timer);
    }, [multiple, paused, images.length]);

    return (
        <section
            aria-label="Destaque da loja"
            className="relative isolate overflow-hidden bg-mc-blush-100"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocus={() => setPaused(true)}
            onBlur={() => setPaused(false)}
        >
            {/* fundo: fotos reais (config/home-images.ts) ou fundo neutro da marca */}
            <div className="absolute inset-0 -z-10" aria-hidden={images.length === 0 ? true : undefined}>
                {images.length > 0 ? (
                    images.map((image, i) => (
                        <img
                            key={image.src}
                            src={image.src}
                            alt={i === current ? image.alt : ""}
                            width={image.width}
                            height={image.height}
                            // a primeira é o LCP da página
                            fetchPriority={i === 0 ? "high" : "low"}
                            loading={i === 0 ? "eager" : "lazy"}
                            className={cn(
                                "absolute inset-0 h-full w-full object-cover object-right transition-opacity duration-700 motion-reduce:transition-none",
                                i === current ? "opacity-100" : "opacity-0"
                            )}
                        />
                    ))
                ) : (
                    <div className="absolute inset-0 bg-linear-to-br from-mc-blush-100 via-mc-blush-200/70 to-mc-violet-300/50">
                        <div className="absolute -right-24 top-1/2 h-[120%] aspect-square -translate-y-1/2 rounded-full bg-mc-violet-700/15" />
                    </div>
                )}
                {/* degradê do creme para transparente: dá leitura ao texto (de baixo para cima no mobile) */}
                <div className="absolute inset-0 bg-linear-to-t from-mc-sand-50 via-mc-sand-50/70 to-transparent md:bg-linear-to-r md:from-mc-sand-50 md:via-mc-sand-50/75 md:to-transparent md:w-[70%]" />
            </div>

            <div className="mx-auto flex min-h-[26rem] max-w-7xl items-end px-4 pb-12 pt-16 sm:px-6 md:min-h-[30rem] md:items-center lg:min-h-[34rem] lg:px-8">
                <div className="max-w-xl">
                    <SectionEyebrow>Mandala Crystais</SectionEyebrow>

                    <h1 className="mt-5 font-display font-normal leading-[1.06] text-mc-violet-950 text-[clamp(2.1rem,1.2rem+3.6vw,3.75rem)]">
                        Energia, equilíbrio e bem-estar em cada{" "}
                        <em className="block font-normal italic text-mc-violet-700">detalhe.</em>
                    </h1>

                    <p className="mt-5 max-w-md text-base leading-relaxed text-mc-ink/75 sm:text-lg">
                        Cristais, incensos e itens de energia selecionados para transformar seu espaço e sua vida.
                    </p>

                    <Button asChild variant="pill" size="pill" className="mt-8">
                        <Link to="/produtos">
                            Explorar coleção
                            <ArrowRight aria-hidden="true" />
                        </Link>
                    </Button>
                </div>
            </div>

            {multiple && (
                <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2 md:left-8 md:translate-x-0 lg:left-[max(2rem,calc((100%-80rem)/2+2rem))]">
                    {images.map((image, i) => (
                        <button
                            key={image.src}
                            type="button"
                            onClick={() => setCurrent(i)}
                            aria-label={`Mostrar imagem ${i + 1} de ${images.length}`}
                            aria-current={i === current}
                            className={cn(
                                "h-2 rounded-full transition-all motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mc-violet-700/50",
                                i === current ? "w-6 bg-mc-violet-950" : "w-2 bg-mc-violet-950/25 hover:bg-mc-violet-950/50"
                            )}
                        />
                    ))}
                </div>
            )}
        </section>
    );
}
