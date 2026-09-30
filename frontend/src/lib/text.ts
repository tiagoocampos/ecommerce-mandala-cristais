/** Corta o texto em até `max` caracteres sem quebrar palavra no meio, com reticências. */
export function truncateText(text: string, max: number): { text: string; truncated: boolean } {
    const clean = text.replace(/\s+/g, " ").trim();
    if (clean.length <= max) return { text: clean, truncated: false };
    const cut = clean.slice(0, max);
    const lastSpace = cut.lastIndexOf(" ");
    const base = lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut;
    return { text: `${base.replace(/[\s.,;:!?—-]+$/, "")}…`, truncated: true };
}
