import type { AdminUserListItem } from "../../types/admin";

// Papel é somente leitura no admin (não existe troca de papel pelo painel).
export function RoleBadge({ role }: { role: AdminUserListItem["role"] }) {
    return (
        <span
            className={`inline-block text-[11px] font-medium px-2 py-0.5 rounded-full border whitespace-nowrap ${
                role === "ADMIN"
                    ? "bg-mc-violet-950/10 text-mc-violet-950 border-mc-violet-950/20"
                    : "bg-mc-sand-100 text-mc-ink/60 border-mc-violet-950/10"
            }`}
        >
            {role === "ADMIN" ? "Administrador" : "Cliente"}
        </span>
    );
}
