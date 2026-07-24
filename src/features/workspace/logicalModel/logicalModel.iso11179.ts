export type Iso11179Decomposition = {
  objectClass: string;
  qualifier: string;
  property: string;
  classWord: string;
};

const CLASS_WORDS = new Set([
  'Amount', 'Date', 'Rate', 'Identifier', 'Type', 'Indicator', 'Number', 'Name', 'Code',
  'Timestamp', 'Adjustment', 'Margin', 'Position', 'Price', 'Quantity', 'Spread',
  'Sensitivity', 'Account', 'Reference', 'Entity', 'Unit', 'Currency', 'Broker', 'Fee',
  'Commission', 'Value', 'Explained', 'Interest', 'Hash', 'Delta', 'Gamma', 'Vega',
  'Theta', 'Rho',
]);

/**
 * Heuristic ISO 11179 name decomposition (Object class + Qualifier + Property + Class
 * word) derived from the element name's own words — this is NOT a canonical registry
 * lookup (the HTML source-of-truth doesn't expose one), just a readable, honest
 * best-effort split for the governance detail card.
 */
export function decomposeIso11179(name: string): Iso11179Decomposition {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) {
    return { objectClass: '', qualifier: '', property: '', classWord: '' };
  }

  const lastWord = words[words.length - 1];
  const hasClassWord = CLASS_WORDS.has(lastWord) && words.length > 1;
  const classWord = hasClassWord ? lastWord : '';
  const remaining = hasClassWord ? words.slice(0, -1) : words;

  if (remaining.length === 0) {
    return { objectClass: lastWord, qualifier: '', property: '', classWord };
  }
  if (remaining.length === 1) {
    return { objectClass: remaining[0], qualifier: '', property: '', classWord };
  }
  if (remaining.length === 2) {
    return { objectClass: remaining[0], qualifier: '', property: remaining[1], classWord };
  }
  return {
    objectClass: remaining[0],
    qualifier: remaining.slice(1, -1).join(' '),
    property: remaining[remaining.length - 1],
    classWord,
  };
}
