import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "../ui/button";
import { SectionEyebrow, SectionTitle } from "./Section";
import { ABOUT_IMAGE } from "../../config/home-images";

// "Sobre a Mandala Crystais": foto à esquerda (esmaece para o creme) e texto à direita.
// Sem foto configurada, usa um painel neutro da marca.
export function AboutSection() {
    return (
        <section aria-labelledby="sobre-titulo" className="bg-mc-sand-50">
            <div className="grid items-center md:grid-cols-2">
                <div className="relative aspect-4/3 md:aspect-auto md:min-h-[26rem] lg:min-h-[30rem]">
                    {ABOUT_IMAGE ? (
                        <img
                            src={ABOUT_IMAGE.src}
                            alt={ABOUT_IMAGE.alt}
                            width={ABOUT_IMAGE.width}
                            height={ABOUT_IMAGE.height}
                            loading="lazy"
                            className="absolute inset-0 h-full w-full object-cover"
                        />
                    ) : (
                        <div aria-hidden="true" className="absolute inset-0 bg-linear-to-br from-mc-violet-500 via-mc-violet-700 to-mc-violet-950" />
                    )}
                    <div className="absolute inset-0 bg-linear-to-t from-mc-sand-50 via-transparent to-transparent md:bg-linear-to-l md:from-mc-sand-50 md:via-transparent md:to-transparent" />
                </div>

                <div className="px-4 py-12 sm:px-8 md:py-16 lg:px-16 xl:max-w-2xl">
                    <SectionEyebrow>Sobre a Mandala Crystais</SectionEyebrow>
                    <SectionTitle className="mt-5" accent="uma intenção.">
                        Cada pedra carrega
                    </SectionTitle>
                    <p className="mt-5 max-w-md text-base leading-relaxed text-mc-ink/75">
                        Cristais, incensos e itens de energia selecionados para transformar seu espaço e o seu ritual diário.
                    </p>
                    <Button asChild variant="pill" size="pill" className="mt-8">
                        <Link to="/produtos">
                            Conheça nossa coleção
                            <ArrowRight aria-hidden="true" />
                        </Link>
                    </Button>
                </div>
            </div>
        </section>
    );
}
