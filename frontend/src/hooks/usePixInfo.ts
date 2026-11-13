import { useEffect, useState } from "react";
import { api } from "../services/api";

/** % de desconto do Pix vindo do backend (null enquanto carrega, se falhar ou se for 0). */
export function usePixDiscountPercent(): number | null {
    const [percent, setPercent] = useState<number | null>(null);
    useEffect(() => {
        let mounted = true;
        api.get<{ discount_percent: number }>("/payment/pix-info")
            .then(({ data }) => mounted && setPercent(data.discount_percent > 0 ? data.discount_percent : null))
            .catch(() => mounted && setPercent(null));
        return () => {
            mounted = false;
        };
    }, []);
    return percent;
}
