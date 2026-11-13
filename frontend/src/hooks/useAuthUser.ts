import { useMemo, useSyncExternalStore } from "react";
import { getAuthSnapshot, getStoredUser, subscribeAuth } from "../lib/auth";
import type { User } from "../types";

/** Usuário logado, reativo a login/logout (nesta aba e em outras). */
export function useAuthUser(): User | null {
    const snapshot = useSyncExternalStore(subscribeAuth, getAuthSnapshot, () => "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
    return useMemo(() => getStoredUser(), [snapshot]);
}
