export const EMAIL_COLORS = {
  canvas: "#0c0c0e",
  surface: "#171719",
  accent: "#ff6e01",
  ink: "#ffffff",
  muted: "#a1a1aa",
  line: "#2a2a2d",
} as const;

const ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => ESCAPES[char]);
}

export type EmailRow = { label: string; value: string };

export function renderEmail(options: {
  heading: string;
  intro: string;
  rows?: EmailRow[];
  action?: { label: string; href: string };
  footer?: string;
}): string {
  const { heading, intro, rows = [], action, footer } = options;
  const c = EMAIL_COLORS;

  const rowsHtml = rows
    .map(
      (row) =>
        `<tr><td style="padding:8px 0;color:${c.muted};font-size:13px;">${escapeHtml(row.label)}</td><td style="padding:8px 0;color:${c.ink};font-size:14px;text-align:right;">${escapeHtml(row.value)}</td></tr>`,
    )
    .join("");

  const actionHtml = action
    ? `<p style="margin:28px 0 0;"><a href="${escapeHtml(action.href)}" style="display:inline-block;background:${c.accent};color:${c.ink};text-decoration:none;padding:12px 28px;border-radius:999px;font-weight:600;font-size:14px;">${escapeHtml(action.label)}</a></p>`
    : "";

  const footerHtml = footer
    ? `<p style="margin:28px 0 0;color:${c.muted};font-size:12px;line-height:1.6;">${escapeHtml(footer)}</p>`
    : "";

  return `<!doctype html><html><body style="margin:0;padding:24px;background:${c.canvas};font-family:Arial,Helvetica,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:${c.surface};border:1px solid ${c.line};border-radius:16px;">
<tr><td style="padding:32px;">
<p style="margin:0 0 20px;color:${c.accent};font-family:Georgia,serif;font-size:22px;">Breaking Buns</p>
<h1 style="margin:0 0 12px;color:${c.ink};font-family:Georgia,serif;font-size:24px;font-weight:600;">${escapeHtml(heading)}</h1>
<p style="margin:0 0 20px;color:${c.muted};font-size:14px;line-height:1.6;">${escapeHtml(intro)}</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid ${c.line};">${rowsHtml}</table>
${actionHtml}${footerHtml}
</td></tr></table></td></tr></table></body></html>`;
}

export function renderText(options: {
  heading: string;
  intro: string;
  rows?: EmailRow[];
  action?: { label: string; href: string };
}): string {
  const lines = [options.heading, "", options.intro, ""];
  for (const row of options.rows ?? []) lines.push(`${row.label}: ${row.value}`);
  if (options.action) lines.push("", `${options.action.label}: ${options.action.href}`);
  return lines.join("\n");
}
