import { useNavigate } from "react-router-dom";
import { ArrowRight, Leaf, Truck, ShieldCheck } from "lucide-react";
import { Button } from "../ui/button";

export function Hero() {
    const navigate = useNavigate();

    return (
        <section className="relative overflow-hidden bg-mc-sand-50">
            <div className="max-w-7xl mx-auto px-2 sm:px-6 py-10 sm:py-14 grid lg:grid-cols-2 gap-6 lg:gap-10 items-start">
                <div className="relative z-10 pt-8 lg:pt-12">
                    <span className="inline-block text-xs font-semibold tracking-[0.2em] uppercase text-[#765075] mb-4">
                        Pedras 100% naturais
                    </span>

                    <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl leading-[1.05] text-[#765075]">
                        Cada pedra carrega
                        <br />
                        <span className="italic text-[#B08B3E]">
                            uma intenção.
                        </span>
                    </h1>

                    <p className="mt-5 text-mc-ink/70 text-base sm:text-lg max-w-md">
                        Cristais, incensos e itens de energia selecionados um a um para
                        transformar o seu espaço — e o seu ritual diário.
                    </p>

                    <div className="mt-6 flex flex-wrap items-center gap-4">
                        <Button
                            onClick={() => navigate("/produtos")}
                            className="facet-cut-sm bg-[#765075] hover:bg-[#694668] text-mc-sand-50 rounded-none px-7 py-6 text-sm font-medium tracking-wide"
                        >
                            Explorar coleção
                            <ArrowRight size={16} className="ml-1" />
                        </Button>

                        <button
                            onClick={() => navigate("/categoria/iniciante")}
                            className="text-sm font-medium text-[#765075] underline underline-offset-4 decoration-[#B08B3E] hover:decoration-2"
                        >
                            Sou iniciante, por onde começo?
                        </button>
                    </div>

                    <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3 text-xs text-mc-ink/60">
                        <span className="flex flex-col gap-1.5">
                            <Leaf size={14} className="text-[#765075]" />
                            Origem certificada
                        </span>

                        <span className="flex flex-col gap-1.5">
                            <Truck size={14} className="text-[#765075]" />
                            Envio em 24h
                        </span>

                        <span className="flex flex-col gap-1.5">
                            <ShieldCheck size={14} className="text-[#765075]" />
                            Compra protegida
                        </span>
                    </div>
                </div>

                <div className="relative ">
                    {/* <div className="absolute inset-0 rounded-full blur-2xl bg-[#765075]/25" /> */}

                    <div className="relative h-80 sm:h-96 lg:h-97.5 w-full bg-linear-to-br from-[#8A5E89] via-[#765075] to-[#583857] flex items-center justify-center">
                        <div className="text-center px-8">
                            <span className="font-display italic text-mc-sand-50/90 text-2xl">
                                “A energia certa
                            </span>

                            <br />

                            <span className="font-display italic text-[#E4C77D] text-2xl">
                                começa pela pedra certa.”
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}