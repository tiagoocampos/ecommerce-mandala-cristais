import { useNavigate } from "react-router-dom";
import { PackageSearch, ArrowLeft } from "lucide-react";
import { AnnouncementBar } from "../../components/store/AnnouncementBar";
import { StoreHeader } from "../../components/store/StoreHeader";
import { StoreFooter } from "../../components/store/StoreFooter";
import { Button } from "../../components/ui/button";
import { ProtectedRoute } from "../../components/ProtectedRoute";

// Nota: o modelo de pedido no backend ainda segue o padrão original de
// comanda de restaurante (mesa + rascunho), sem vínculo com endereço ou
// pagamento. Por isso esta página, por enquanto, não lista pedidos reais —
// assim que o fluxo de checkout e-commerce estiver pronto no backend, esta
// tela passa a consumir GET /orders normalmente.
export function Orders() {
    const navigate = useNavigate();

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-mc-sand-50 flex flex-col">
                <AnnouncementBar />
                <StoreHeader />

                <main className="flex-1">
                    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
                        <button
                            onClick={() => navigate("/")}
                            className="flex items-center gap-1.5 text-sm text-mc-ink/60 hover:text-mc-violet-950 mb-8"
                        >
                            <ArrowLeft size={15} /> Voltar para a loja
                        </button>

                        <div className="text-center py-14 flex flex-col items-center gap-4">
                            <PackageSearch size={44} className="text-mc-violet-950/20" />
                            <h1 className="font-display text-2xl sm:text-3xl text-mc-violet-950">
                                Meus pedidos
                            </h1>
                            <p className="text-sm text-mc-ink/60 max-w-sm">
                                Estamos finalizando o fluxo de checkout e pagamento. Em
                                breve você vai poder acompanhar seus pedidos por aqui.
                            </p>
                            <Button
                                onClick={() => navigate("/produtos")}
                                className="bg-mc-violet-950 hover:bg-mc-violet-800 text-mc-sand-50 rounded-full mt-2"
                            >
                                Explorar produtos
                            </Button>
                        </div>
                    </div>
                </main>

                <StoreFooter />
            </div>
        </ProtectedRoute>
    );
}
