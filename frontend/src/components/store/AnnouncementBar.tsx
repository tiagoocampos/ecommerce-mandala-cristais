export function AnnouncementBar() {
    return (
        <div className="bg-mc-violet-950 text-mc-sand-50 text-xs sm:text-sm py-2 px-4 text-center tracking-wide">
            <span className="text-mc-gold-300 font-medium">10% OFF</span> na primeira compra
            com o cupom{" "}
            <span className="font-semibold underline underline-offset-2 decoration-mc-gold-500">
                BEMVINDA10
            </span>{" "}
            · Frete grátis acima de R$ 199
        </div>
    );
}
