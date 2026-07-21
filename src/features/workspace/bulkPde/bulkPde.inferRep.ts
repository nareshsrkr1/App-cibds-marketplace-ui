/** Infer representation class from a technical type (HTML SoT `inferRep`). */
export function inferRepresentation(type: string | undefined): string {
  const t = (type || '').toLowerCase();
  if (/decimal|numeric|money|float/.test(t)) return 'Amount';
  if (/date|timestamp/.test(t)) return 'Date';
  if (/char|varchar|text|string/.test(t)) {
    return /id|ref|code/.test(t) ? 'Identifier' : 'Name';
  }
  if (/int|bigint/.test(t)) return 'Quantity';
  return 'Attribute';
}
