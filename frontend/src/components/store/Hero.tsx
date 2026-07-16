import { useNavigate } from "react-router-dom";
import { ArrowRight, Leaf, Truck, ShieldCheck } from "lucide-react";
import { Button } from "../ui/button";

export function Hero() {
    const navigate = useNavigate();

    return (
        <section className="relative overflow-hidden bg-mc-sand-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-20 grid lg:grid-cols-2 gap-10 items-center">
                {/* texto */}
                <div className="relative z-10">
                    <span className="inline-block text-xs font-semibold tracking-[0.2em] uppercase text-mc-gold-600 mb-4">
                        Pedras 100% naturais
                    </span>
                    <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl leading-[1.05] text-mc-violet-950">
                        Cada pedra carrega
                        <br />
                        <span className="italic text-mc-gold-600">uma intenção.</span>
                    </h1>
                    <p className="mt-5 text-mc-ink/70 text-base sm:text-lg max-w-md">
                        Cristais, incensos e itens de energia selecionados um a um para
                        transformar o seu espaço — e o seu ritual diário.
                    </p>

                    <div className="mt-8 flex flex-wrap items-center gap-4">
                        <Button
                            onClick={() => navigate("/produtos")}
                            className="facet-cut-sm bg-mc-violet-950 hover:bg-mc-violet-800 text-mc-sand-50 rounded-none px-7 py-6 text-sm font-medium tracking-wide"
                        >
                            Explorar coleção
                            <ArrowRight size={16} className="ml-1" />
                        </Button>
                        <button
                            onClick={() => navigate("/categoria/iniciante")}
                            className="text-sm font-medium text-mc-violet-950 underline underline-offset-4 decoration-mc-gold-500 hover:decoration-2"
                        >
                            Sou iniciante, por onde começo?
                        </button>
                    </div>

                    <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-xs text-mc-ink/60">
                        <span className="flex items-center gap-1.5">
                            <Leaf size={14} className="text-mc-violet-700" /> Origem certificada
                        </span>
                        <span className="flex items-center gap-1.5">
                            <Truck size={14} className="text-mc-violet-700" /> Envio em 24h
                        </span>
                        <span className="flex items-center gap-1.5">
                            <ShieldCheck size={14} className="text-mc-violet-700" /> Compra
                            protegida
                        </span>
                    </div>
                </div>

                {/* moldura visual com corte de faceta */}
                <div className="relative aspect-[4/5] sm:aspect-[5/4] lg:aspect-[4/5]">
                    <div className="absolute inset-0 mc-glow rounded-full blur-2xl" />
                    <div className="facet-cut relative h-full w-full bg-gradient-to-br from-mc-violet-700 via-mc-violet-800 to-mc-violet-950 flex items-center justify-center">
                        <div className="text-center px-8">
                            <span className="font-display italic text-mc-sand-50/90 text-2xl">
                                “A energia certa
                            </span>
                            <br />
                            <span className="font-display italic text-mc-gold-300 text-2xl">
                                começa pela pedra certa.”
                            </span>
                        </div>
                    </div>
                    <div className="facet-cut-sm absolute -bottom-5 -left-5 w-28 h-28 bg-mc-gold-500 hidden sm:block" />
                </div>
            </div>
        </section>
    );
}
