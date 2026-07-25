import { useNavigate } from "react-router-dom";
import { Clock, PackageSearch, ArrowLeft } from "lucide-react";
import { AnnouncementBar } from "../../components/store/AnnouncementBar";
import { StoreHeader } from "../../components/store/StoreHeader";
import { StoreFooter } from "../../components/store/StoreFooter";
import { Button } from "../../components/ui/button";

export function PaymentPendingPage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-mc-sand-50 flex flex-col">
            <AnnouncementBar />
            <StoreHeader />

            <main className="flex-1 flex items-center justify-center px-4">
                <div className="max-w-md w-full text-center py-12">
                    <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-5">
                        <Clock size={32} className="text-mc-gold-600" />
                    </div>

                    <h1 className="font-display text-2xl sm:text-3xl text-mc-violet-950 mb-2">
                        Pagamento{" "}
                        <span className="italic text-mc-gold-600">pendente</span>
                    </h1>

                    <p className="text-sm text-mc-ink/60 mb-6 max-w-sm mx-auto">
                        Seu pedido foi recebido, mas o pagamento ainda está sendo
                        processado. Isso pode levar alguns minutos.
                    </p>

                    <div className="bg-mc-blush-100 border border-mc-violet-950/10 rounded-lg p-4 mb-6 text-left">
                        <h3 className="text-xs font-semibold uppercase tracking-wide text-mc-ink/50 mb-2">
                            O que fazer agora?
                        </h3>
                        <ul className="space-y-2 text-sm text-mc-ink/70">
                            <li className="flex items-start gap-2">
                                <span className="text-mc-gold-600 mt-0.5">•</span>
                                <span>
                                    Se você pagou com <strong>Pix</strong>, o pagamento é
                                    confirmado em instantes.
                                </span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-mc-gold-600 mt-0.5">•</span>
                                <span>
                                    Se pagou com <strong>cartão ou boleto</strong>, a
                                    confirmação pode levar até 3 dias úteis.
                                </span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-mc-gold-600 mt-0.5">•</span>
                                <span>
                                    Acompanhe o status na página de{" "}
                                    <strong>Meus pedidos</strong>.
                                </span>
                            </li>
                        </ul>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Button
                            onClick={() => navigate("/pedidos")}
                            className="bg-mc-violet-950 hover:bg-mc-violet-800 text-mc-sand-50 rounded-full"
                        >
                            <PackageSearch size={16} />
                            Meus pedidos
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

