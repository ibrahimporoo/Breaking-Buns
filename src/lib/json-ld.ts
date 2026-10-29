/** Escapes "<" so the JSON can never close the surrounding script tag. */
export function toJsonLdString(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
