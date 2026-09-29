import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { AnnouncementBar } from "../../components/store/AnnouncementBar";
import { StoreHeader } from "../../components/store/StoreHeader";
import { StoreFooter } from "../../components/store/StoreFooter";
import { Button } from "../../components/ui/button";

export function NotFound() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-mc-sand-50 flex flex-col">
            <AnnouncementBar />
            <StoreHeader />

            <main className="flex-1 flex items-center justify-center px-4 py-16 sm:py-24">
                <div className="text-center max-w-md">
                    <span className="font-display text-7xl sm:text-8xl text-mc-blush-200 leading-none select-none">
                        404
                    </span>
                    <h1 className="font-display text-3xl sm:text-4xl text-mc-violet-950 mt-4">
                        Essa pedra não está <span className="italic text-mc-gold-700">aqui</span>
                    </h1>
                    <p className="text-sm sm:text-base text-mc-ink/60 mt-3">
                        A página que você procura mudou de lugar ou nunca existiu. Que tal voltar
                        para a vitrine e recomeçar a busca?
                    </p>
                    <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                        <Button
                            onClick={() => navigate("/")}
                            className="facet-cut-sm bg-mc-violet-950 hover:bg-mc-violet-800 text-mc-sand-50 rounded-none px-7 h-11"
                        >
                            <ArrowLeft size={16} className="mr-1" />
                            Voltar para a Home
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => navigate("/produtos")}
                            className="rounded-full border-mc-violet-950/20 text-mc-violet-950 hover:bg-mc-blush-100 px-6 h-11"
                        >
                            Ver produtos
                        </Button>
                    </div>
                </div>
            </main>

            <StoreFooter />
        </div>
    );
}
