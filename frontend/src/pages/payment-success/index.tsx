import { useSearchParams, useNavigate } from "react-router-dom";
import { CheckCircle2, PackageSearch, ArrowLeft } from "lucide-react";
import { AnnouncementBar } from "../../components/store/AnnouncementBar";
import { StoreHeader } from "../../components/store/StoreHeader";
import { StoreFooter } from "../../components/store/StoreFooter";
import { Button } from "../../components/ui/button";

export function PaymentSuccessPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const orderId = searchParams.get("external_reference");

    return (
        <div className="min-h-screen bg-mc-sand-50 flex flex-col">
            <AnnouncementBar />
            <StoreHeader />

            <main className="flex-1 flex items-center justify-center px-4">
                <div className="max-w-md w-full text-center py-12">
                    <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-5">
                        <CheckCircle2 size={32} className="text-emerald-600" />
                    </div>

                    <h1 className="font-display text-2xl sm:text-3xl text-mc-violet-950 mb-2">
                        Compra realizada{" "}
                        <span className="italic text-mc-gold-600">com sucesso!</span>
                    </h1>

                    <p className="text-sm text-mc-ink/60 mb-6">
                        Seu pagamento foi aprovado e seu pedido já está sendo processado.
                    </p>

                    {orderId && (
                        <div className="bg-mc-blush-100 border border-mc-violet-950/10 rounded-lg p-4 mb-6 inline-block">
                            <span className="text-xs text-mc-ink/50">Nº do pedido</span>
                            <p className="text-sm font-medium text-mc-violet-950 mt-0.5">
                                #{orderId.slice(0, 8).toUpperCase()}
                            </p>
                        </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Button
                            onClick={() => navigate("/pedidos")}
                            className="bg-mc-violet-950 hover:bg-mc-violet-800 text-mc-sand-50 rounded-full"
                        >
                            <PackageSearch size={16} />
                            Ver meus pedidos
                        </Button>

                        <Button
                            onClick={() => navigate("/")}
                            variant="ghost"
                            className="text-mc-violet-950 hover:bg-mc-blush-100 rounded-full"
                        >
                            <ArrowLeft size={16} />
                            Voltar para a loja
                        </Button>
                    </div>
                </div>
            </main>

            <StoreFooter />
        </div>
    );
}

