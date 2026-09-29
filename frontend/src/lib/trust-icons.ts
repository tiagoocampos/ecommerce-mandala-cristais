import {
    Gem,
    Truck,
    CreditCard,
    Tag,
    Sparkles,
    ShieldCheck,
    Leaf,
    Heart,
    Gift,
    Star,
    Package,
    RefreshCw,
    Clock,
    Moon,
    Percent,
    type LucideIcon,
} from "lucide-react";

// Manter em sincronia com TRUST_ICON_NAMES em backend/src/schemas/storeSettingsSchema.ts
export const TRUST_ICONS: Record<string, LucideIcon> = {
    Gem,
    Truck,
    CreditCard,
    Tag,
    Sparkles,
    ShieldCheck,
    Leaf,
    Heart,
    Gift,
    Star,
    Package,
    RefreshCw,
    Clock,
    Moon,
    Percent,
};

export const TRUST_ICON_NAMES = Object.keys(TRUST_ICONS);

export function resolveTrustIcon(name: string): LucideIcon {
    return TRUST_ICONS[name] ?? Sparkles;
}
