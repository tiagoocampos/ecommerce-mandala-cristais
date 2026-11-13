import { useEffect } from "react";

/** Quando aparece algum erro de campo, rola até o primeiro campo inválido (aria-invalid) e o foca. */
export function useFocusFirstError(errors: Record<string, string>) {
    const signature = Object.values(errors).join("|");
    useEffect(() => {
        if (!Object.values(errors).some(Boolean)) return;
        const field = document.querySelector<HTMLElement>('[aria-invalid="true"]');
        if (field) {
            field.scrollIntoView({ block: "center", behavior: "smooth" });
            field.focus({ preventScroll: true });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [signature]);
}
