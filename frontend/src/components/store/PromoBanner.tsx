import { useNavigate } from "react-router-dom";
import { ArrowRight, Moon } from "lucide-react";
import { Button } from "../ui/button";

export function PromoBanner() {
    const navigate = useNavigate();

    return (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
            <div className="relative facet-cut overflow-hidden bg-gradient-to-br from-mc-violet-950 via-mc-violet-800 to-mc-violet-950 px-8 sm:px-14 py-12 sm:py-16 text-center">
                <div className="absolute inset-0 mc-glow" />
                <div className="relative">
                    <Moon className="mx-auto text-mc-gold-400 mb-4" size={28} />
                    <span className="text-xs font-semibold tracking-[0.25em] uppercase text-mc-gold-300">
                        Por tempo limitado
                    </span>
                    <h2 className="font-display text-3xl sm:text-4xl text-mc-sand-50 mt-3 mb-2">
                        Kit de proteção energética
                    </h2>
                    <p className="text-mc-sand-50/70 text-sm max-w-md mx-auto mb-7">
                        Uma seleção de pedras e incensos pensada para os dias em que você
                        precisa se blindar e recomeçar.
                    </p>
                    <Button
                        onClick={() => navigate("/categoria/energia")}
                        className="bg-mc-gold-500 hover:bg-mc-gold-600 text-mc-violet-950 rounded-full px-7 py-6 text-sm font-semibold"
                    >
                        Ver kits
                        <ArrowRight size={16} className="ml-1" />
                    </Button>
                </div>
            </div>
        </section>
    );
}
