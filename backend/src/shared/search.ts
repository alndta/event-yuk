/** Lowercase, strip accents, collapse spaces, so "Jakarta  " matches "jakarta". */
export const normalize = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();

/** True when every word of the query appears somewhere in the haystack fields. */
export function matchesQuery(query: string | undefined, fields: (string | null | undefined)[]): boolean {
  const words = normalize(query ?? '').split(' ').filter(Boolean);
  if (words.length === 0) return true;
  const hay = normalize(fields.filter(Boolean).join(' '));
  return words.every((w) => hay.includes(w));
}
