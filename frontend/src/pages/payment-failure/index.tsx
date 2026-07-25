import { useNavigate } from "react-router-dom";
import { XCircle, RefreshCw, ShoppingBag } from "lucide-react";
import { AnnouncementBar } from "../../components/store/AnnouncementBar";
import { StoreHeader } from "../../components/store/StoreHeader";
import { StoreFooter } from "../../components/store/StoreFooter";
import { Button } from "../../components/ui/button";

export function PaymentFailurePage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-mc-sand-50 flex flex-col">
            <AnnouncementBar />
            <StoreHeader />

            <main className="flex-1 flex items-center justify-center px-4">
                <div className="max-w-md w-full text-center py-12">
                    <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-5">
                        <XCircle size={32} className="text-red-600" />
                    </div>

                    <h1 className="font-display text-2xl sm:text-3xl text-mc-violet-950 mb-2">
                        Pagamento{" "}
                        <span className="italic text-mc-gold-600">recusado</span>
                    </h1>

                    <p className="text-sm text-mc-ink/60 mb-8 max-w-sm mx-auto">
                        Não foi possível processar seu pagamento. Verifique os dados
                        do cartão, saldo disponível ou tente outra forma de pagamento.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Button
                            onClick={() => navigate("/carrinho")}
                            className="bg-mc-violet-950 hover:bg-mc-violet-800 text-mc-sand-50 rounded-full"
                        >
                            <RefreshCw size={16} />
                            Tentar novamente
                        </Button>

                        <Button
                            onClick={() => navigate("/produtos")}
                            variant="ghost"
                            className="text-mc-violet-950 hover:bg-mc-blush-100 rounded-full"
                        >
                            <ShoppingBag size={16} />
                            Continuar comprando
                        </Button>
                    </div>
                </div>
            </main>

            <StoreFooter />
        </div>
    );
}

