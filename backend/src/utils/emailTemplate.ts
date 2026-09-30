// Template de e-mail com a identidade da loja (paleta oficial: Roxo Mandala #843679,
// Roxo escuro #5E2556, Dourado #FFCA00, Lavanda #E9D6E6). CSS inline: é o que os
// clientes de e-mail (Gmail, Outlook) respeitam.

export function escapeHtml(text: string): string {
    return text.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

/** Texto livre (ex.: mensagem do lojista) → HTML seguro, preservando parágrafos e quebras. */
export function textToHtml(text: string): string {
    return text
        .trim()
        .split(/\n{2,}/)
        .map((paragraph) => `<p style="margin:0 0 16px">${escapeHtml(paragraph).replace(/\n/g, "<br>")}</p>`)
        .join("");
}

export function frontendUrl(path = ""): string {
    return `${(process.env.FRONTEND_URL ?? "").replace(/\/+$/, "")}${path}`;
}

export function button(label: string, href: string): string {
    return `<a href="${escapeHtml(href)}" style="display:inline-block;background:#5e2556;color:#ffffff;text-decoration:none;font-weight:600;padding:12px 28px;border-radius:999px">${escapeHtml(label)}</a>`;
}

export function renderEmail({ title, bodyHtml, footerHtml = "" }: { title: string; bodyHtml: string; footerHtml?: string }): string {
    const logo = frontendUrl("/brand/logo-branca.png");
    return `<!doctype html>
<html lang="pt-BR">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(title)}</title></head>
<body style="margin:0;padding:0;background:#f5ecf3;font-family:Arial,Helvetica,sans-serif;color:#2a1427">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5ecf3;padding:24px 12px">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:12px;overflow:hidden">
        <tr><td align="center" style="background:#843679;padding:24px">
          <img src="${escapeHtml(logo)}" alt="Mandala Crystais" width="120" style="display:block;border:0;height:auto;max-width:120px">
        </td></tr>
        <tr><td style="height:4px;background:#ffca00;font-size:0;line-height:0">&nbsp;</td></tr>
        <tr><td style="padding:32px 28px;font-size:15px;line-height:1.6">
          <h1 style="margin:0 0 16px;font-size:22px;color:#5e2556;font-family:Georgia,serif">${escapeHtml(title)}</h1>
          ${bodyHtml}
        </td></tr>
        <tr><td style="padding:20px 28px;background:#e9d6e6;font-size:12px;line-height:1.5;color:#5e2556">
          Mandala Crystais · Cristais e itens de energia
          ${footerHtml ? `<br>${footerHtml}` : ""}
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
