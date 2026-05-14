/**
 * Serializa parâmetros omitindo `undefined` e strings vazias.
 */
export function toSearchParams(record: Record<string, string | number | undefined>): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(record)) {
    if (value === undefined) {
      continue;
    }
    if (typeof value === 'string' && value.trim() === '') {
      continue;
    }
    params.set(key, String(value));
  }
  const s = params.toString();
  return s.length > 0 ? `?${s}` : '';
}
