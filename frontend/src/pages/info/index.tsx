import { Link } from "react-router-dom";
import { InfoPage, InfoSection } from "../../components/store/InfoPage";
import { ACCEPTED_PAYMENT_METHODS, STORE, WHATSAPP_URL } from "../../config/store";
import { useStoreSettings } from "../../hooks/useStoreSettings";
import { usePixDiscountPercent } from "../../hooks/usePixInfo";
import { formatPrice } from "../../lib/utils-api";

const linkClass = "text-mc-violet-700 underline underline-offset-4 decoration-mc-gold-500 hover:decoration-2";

function ContactHint() {
    return (
        <>
            Se precisar de ajuda, <Link to="/contato" className={linkClass}>fale com a gente</Link>.
        </>
    );
}

/* ---------- Formas de pagamento ---------- */
export function PaymentMethodsPage() {
    const pixPercent = usePixDiscountPercent();
    return (
        <InfoPage
            title="Formas de pagamento"
            description="Pague com Pix ou cartão de crédito, em ambiente seguro do Mercado Pago."
            intro="O pagamento é feito depois de você finalizar o pedido, em ambiente seguro do Mercado Pago."
        >
            <InfoSection title="Meios aceitos">
                <ul className="list-disc pl-5 space-y-1.5">
                    {ACCEPTED_PAYMENT_METHODS.map((method) => (
                        <li key={method}>
                            {method}
                            {method === "Pix" && pixPercent ? ` — ${pixPercent}% de desconto sobre os produtos` : ""}
                        </li>
                    ))}
                </ul>
                <p>Os meios disponíveis na hora do pagamento seguem o que o Mercado Pago oferecer para o seu pedido.</p>
            </InfoSection>

            <InfoSection title="Como funciona">
                <p>
                    Ao finalizar a compra, você escolhe a forma de pagamento. Os dados do cartão são digitados no
                    ambiente do Mercado Pago, não passam pela nossa loja.
                </p>
            </InfoSection>

            <InfoSection title="Reserva do pedido">
                <p>
                    Depois de criado, o pedido fica reservado por tempo limitado. Se o pagamento não for feito nesse
                    prazo, o pedido é cancelado e os itens voltam para a loja. O horário limite aparece em “Meus pedidos”.
                </p>
            </InfoSection>

            <InfoSection title="Paguei e não foi confirmado">
                <p>
                    Em “Meus pedidos”, abra o pedido e use <strong>“Já paguei — verificar pagamento”</strong>. Se ainda
                    assim não aparecer, <ContactHint />
                </p>
            </InfoSection>
        </InfoPage>
    );
}

/* ---------- Prazos de entrega ---------- */
export function DeliveryTimesPage() {
    const { free_shipping_threshold, pickup_enabled, pickup_address, pickup_instructions } = useStoreSettings();
    return (
        <InfoPage
            title="Prazos de entrega"
            description="Entrega pelos Correios (PAC e SEDEX) para todo o Brasil e, quando disponível, retirada na loja."
            intro="O prazo e o valor do frete aparecem no checkout, depois de você escolher o endereço de entrega."
        >
            <InfoSection title="Envio pelos Correios">
                <p>
                    Enviamos pelos Correios, com PAC ou SEDEX. O prazo depende da transportadora e do seu CEP; o prazo
                    mostrado no checkout é uma estimativa. Se uma das modalidades não atender o seu endereço, ela aparece
                    como indisponível.
                </p>
                {free_shipping_threshold ? (
                    <p>Frete grátis acima de {formatPrice(free_shipping_threshold)}, conforme as regras exibidas no checkout.</p>
                ) : null}
            </InfoSection>

            {pickup_enabled && (
                <InfoSection title="Retirada na loja">
                    <p>Você pode escolher retirar o pedido na loja, sem frete.</p>
                    {pickup_address && <p className="font-medium text-mc-violet-950 whitespace-pre-line">{pickup_address}</p>}
                    {pickup_instructions && <p className="whitespace-pre-line">{pickup_instructions}</p>}
                    <p>Avisamos no seu pedido quando ele estiver pronto para retirada.</p>
                </InfoSection>
            )}

            <InfoSection title="Acompanhe seu pedido">
                <p>
                    O andamento fica em <Link to="/pedidos" className={linkClass}>Meus pedidos</Link>. <ContactHint />
                </p>
            </InfoSection>
        </InfoPage>
    );
}

/* ---------- Trocas e devoluções ---------- */
export function ReturnsPage() {
    return (
        <InfoPage
            title="Trocas e devoluções"
            description="Direito de arrependimento em compras online e como solicitar troca ou devolução."
        >
            <InfoSection title="Direito de arrependimento">
                <p>
                    Em compras feitas pela internet, você pode desistir da compra em até <strong>7 dias</strong> após o
                    recebimento do produto, conforme o artigo 49 do Código de Defesa do Consumidor.
                </p>
            </InfoSection>

            <InfoSection title="Como solicitar">
                <p>
                    Entre em contato informando o número do pedido e o motivo. <ContactHint />
                </p>
            </InfoSection>

            <InfoSection title="Produto com defeito ou diferente do pedido">
                <p>Fale com a gente o quanto antes, com o número do pedido e, se possível, fotos do produto.</p>
            </InfoSection>
        </InfoPage>
    );
}

/* ---------- Contato ---------- */
export function ContactPage() {
    return (
        <InfoPage
            title="Fale conosco"
            description="Contato da Mandala Crystais: WhatsApp e Instagram."
            intro="Tire dúvidas sobre produtos, pedidos e entregas."
        >
            <InfoSection title="Canais">
                <ul className="space-y-3">
                    {WHATSAPP_URL && (
                        <li>
                            <span className="block text-xs uppercase tracking-wide text-mc-ink/50">WhatsApp</span>
                            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className={linkClass}>
                                Conversar pelo WhatsApp
                            </a>
                        </li>
                    )}
                    {STORE.instagramUrl && (
                        <li>
                            <span className="block text-xs uppercase tracking-wide text-mc-ink/50">Instagram</span>
                            <a href={STORE.instagramUrl} target="_blank" rel="noopener noreferrer" className={linkClass}>
                                @mandalacrystais
                            </a>
                        </li>
                    )}
                    {STORE.email && (
                        <li>
                            <span className="block text-xs uppercase tracking-wide text-mc-ink/50">E-mail</span>
                            <a href={`mailto:${STORE.email}`} className={linkClass}>
                                {STORE.email}
                            </a>
                        </li>
                    )}
                    {STORE.hours && (
                        <li>
                            <span className="block text-xs uppercase tracking-wide text-mc-ink/50">Atendimento</span>
                            {STORE.hours}
                        </li>
                    )}
                </ul>
            </InfoSection>
        </InfoPage>
    );
}

/* ---------- Sobre ---------- */
export function AboutPage() {
    return (
        <InfoPage
            title="Sobre nós"
            description="Conheça a Mandala Crystais: cristais, incensos e itens de energia selecionados com cuidado."
            intro="Cristais e itens de energia selecionados com cuidado para o seu ritual diário."
        >
            <InfoSection title="Quem somos">
                <p>
                    A Mandala Crystais é uma loja online de cristais, incensos e itens de energia, selecionados um a um
                    para transformar o seu espaço e o seu ritual diário.
                </p>
            </InfoSection>
            <InfoSection id="curadoria" title="Nossa curadoria">
                <p>
                    Cada item do catálogo é escolhido com cuidado. Veja a seleção completa em{" "}
                    <Link to="/produtos" className={linkClass}>produtos</Link> ou por{" "}
                    <Link to="/categorias" className={linkClass}>categoria</Link>.
                </p>
            </InfoSection>
        </InfoPage>
    );
}
