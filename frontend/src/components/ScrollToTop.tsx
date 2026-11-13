import { useEffect } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

// Rola ao topo a cada troca de rota. Respeita âncoras (#id, rolagem suave) e deixa o
// navegador restaurar a posição em voltar/avançar (POP).
export function ScrollToTop() {
    const { pathname, hash } = useLocation();
    const navigationType = useNavigationType();

    useEffect(() => {
        if (hash) {
            const target = document.getElementById(decodeURIComponent(hash.slice(1)));
            if (target) {
                const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
                target.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
                return;
            }
        }
        if (navigationType !== "POP") window.scrollTo(0, 0);
    }, [pathname, hash, navigationType]);

    return null;
}
