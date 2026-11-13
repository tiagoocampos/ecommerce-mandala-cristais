import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { InfoPage } from "../../components/store/InfoPage";
import { useStoreSettings } from "../../hooks/useStoreSettings";

const linkClass = "text-mc-violet-700 underline underline-offset-4 decoration-mc-gold-500 hover:decoration-2";

// Sanfona com <details>/<summary>: abre/fecha por clique, Enter e Espaço, com leitura correta por leitores de tela
function Item({ question, children }: { question: string; children: React.ReactNode }) {
    return (
        <details className="group border-b border-mc-violet-950/10 py-1">
            <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 py-2 text-left font-medium text-mc-violet-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mc-violet-700/40 [&::-webkit-details-marker]:hidden">
                {question}
                <ChevronDown
                    size={18}
                    aria-hidden="true"
                    className="shrink-0 text-mc-violet-700 transition-transform duration-200 group-open:rotate-180 motion-reduce:transition-none"
                />
            </summary>
            <div className="pb-4 pr-6 text-[15px] leading-relaxed text-mc-ink/75 space-y-2">{children}</div>
        </details>
    );
}

export function FaqPage() {
    const { pickup_enabled } = useStoreSettings();
    return (
        <InfoPage
            title="Perguntas frequentes"
            description="Respostas sobre compra, pagamento, reserva do pedido, entrega e contato na Mandala Crystais."
        >
            <div>
                <Item question="Como faço uma compra?">
                    <p>
                        Escolha os produtos, adicione ao carrinho e finalize. É preciso estar logado: se ainda não tem conta,
                        o cadastro é rápido. No checkout você escolhe o endereço, o frete e depois paga.
                    </p>
                </Item>
                <Item question="Quais são as formas de pagamento?">
                    <p>
                        Veja os detalhes em <Link to="/formas-de-pagamento" className={linkClass}>Formas de pagamento</Link>.
                    </p>
                </Item>
                <Item question="Por quanto tempo meu pedido fica reservado?">
                    <p>
                        O pedido fica reservado por tempo limitado. Se o pagamento não for feito, ele é cancelado e os itens
                        voltam para a loja. O horário limite aparece no pedido.
                    </p>
                </Item>
                <Item question="Paguei e o pedido não foi confirmado. E agora?">
                    <p>
                        Abra o pedido em <Link to="/pedidos" className={linkClass}>Meus pedidos</Link> e clique em{" "}
                        <strong>“Já paguei — verificar pagamento”</strong>. Se não resolver, fale com a gente em{" "}
                        <Link to="/contato" className={linkClass}>Contato</Link>.
                    </p>
                </Item>
                <Item question="Como acompanho meu pedido?">
                    <p>
                        Em <Link to="/pedidos" className={linkClass}>Meus pedidos</Link> você vê o status de cada compra.
                    </p>
                </Item>
                <Item question="Posso cancelar um pedido?">
                    <p>
                        Pedidos aguardando pagamento podem ser cancelados por você em “Meus pedidos”. Depois de pago, fale com a
                        loja pelo <Link to="/contato" className={linkClass}>Contato</Link>.
                    </p>
                </Item>
                <Item question="Como funciona o frete?">
                    <p>
                        O valor e o prazo aparecem no checkout depois que você escolhe o endereço. Veja mais em{" "}
                        <Link to="/prazos-de-entrega" className={linkClass}>Prazos de entrega</Link>.
                    </p>
                </Item>
                {pickup_enabled && (
                    <Item question="Posso retirar na loja?">
                        <p>
                            Sim. No checkout, escolha “Retirar na loja”. O endereço e as instruções aparecem na mesma tela e no
                            seu pedido.
                        </p>
                    </Item>
                )}
                <Item question="Posso trocar ou devolver?">
                    <p>
                        Veja <Link to="/trocas-e-devolucoes" className={linkClass}>Trocas e devoluções</Link>.
                    </p>
                </Item>
                <Item question="Como cuidar dos meus cristais?">
                    <p>
                        De forma geral, evite quedas e impactos, e proteja as peças de água, sol forte e produtos de limpeza,
                        pois algumas pedras podem manchar ou desbotar. Limpe com um pano macio e seco.
                    </p>
                </Item>
                <Item question="Como falo com a loja?">
                    <p>
                        Pela página de <Link to="/contato" className={linkClass}>Contato</Link>.
                    </p>
                </Item>
            </div>
        </InfoPage>
    );
}
