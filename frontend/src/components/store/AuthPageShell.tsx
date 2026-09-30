import type { ReactNode } from "react";
import { AnnouncementBar } from "./AnnouncementBar";
import { StoreHeader } from "./StoreHeader";
import { StoreFooter } from "./StoreFooter";

// Moldura das páginas de conta (mesma da tela de login)
export function AuthPageShell({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
    return (
        <div className="min-h-screen bg-mc-sand-50 flex flex-col">
            <AnnouncementBar />
            <StoreHeader />
            <main className="flex-1">
                <div className="max-w-md mx-auto px-4 sm:px-6 py-10 sm:py-14">
                    <div className="text-center mb-8">
                        <h1 className="font-display text-3xl sm:text-4xl text-mc-violet-950">{title}</h1>
                        {subtitle && <p className="text-sm text-mc-ink/70 mt-2">{subtitle}</p>}
                    </div>
                    <div className="bg-mc-blush-100 border border-mc-violet-950/10 rounded-md p-6 sm:p-7">{children}</div>
                </div>
            </main>
            <StoreFooter />
        </div>
    );
}
