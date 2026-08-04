import { useNavigate } from "react-router-dom";
import { ArrowRight, Moon } from "lucide-react";
import { Button } from "../ui/button";

export function PromoBanner() {
    const navigate = useNavigate();

    return (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
            <div className="relative facet-cut overflow-hidden bg-linear-to-br from-[#8B668A] via-[#765075] to-[#5E3E5D] px-8 sm:px-14 py-12 sm:py-16 text-center">
                <div className="absolute inset-0 rounded-full blur-3xl bg-[#A57AA4]/20" />

                <div className="relative">
                    <Moon
                        className="mx-auto text-[#E4C77D] mb-4"
                        size={28}
                    />

                    <span className="text-xs font-semibold tracking-[0.25em] uppercase text-[#E4C77D]">
                        Por tempo limitado
                    </span>

                    <h2 className="font-display text-3xl sm:text-4xl text-mc-sand-50 mt-3 mb-2">
                        Kit de proteção energética
                    </h2>

                    <p className="text-mc-sand-50/80 text-sm max-w-md mx-auto mb-7">
                        Uma seleção de pedras e incensos pensada para os dias em que você
                        precisa se blindar e recomeçar.
                    </p>

                    <Button
                        onClick={() => navigate("/categoria/kits")}
                        className="bg-[#E4C77D] hover:bg-[#D6B765] text-[#5E3E5D] rounded-full px-7 py-6 text-sm font-semibold"
                    >
                        Ver kits
                        <ArrowRight
                            size={16}
                            className="ml-1"
                        />
                    </Button>
                </div>
            </div>
        </section>
    );
}