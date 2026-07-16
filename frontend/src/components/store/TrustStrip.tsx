import { Gem, Truck, CreditCard, Tag } from "lucide-react";

const ITEMS = [
    { icon: Gem, label: "Pedras 100% naturais" },
    { icon: Truck, label: "Envio rápido para todo o Brasil" },
    { icon: CreditCard, label: "Até 3x sem juros" },
    { icon: Tag, label: "10% OFF na primeira compra" },
];

export function TrustStrip() {
    return (
        <div className="border-y border-mc-violet-950/10 bg-mc-blush-100/60">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 grid grid-cols-2 sm:grid-cols-4 gap-4">
                {ITEMS.map(({ icon: Icon, label }) => (
                    <div key={label} className="flex items-center gap-2.5">
                        <Icon size={18} className="text-mc-violet-700 shrink-0" />
                        <span className="text-xs sm:text-[13px] text-mc-ink/70 font-medium leading-tight">
                            {label}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
