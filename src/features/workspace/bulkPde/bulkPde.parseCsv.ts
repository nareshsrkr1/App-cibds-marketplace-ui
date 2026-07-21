import type { BulkPdeRow } from './bulkPde.types';

export const BULK_PDE_COLUMNS: (keyof BulkPdeRow)[] = [
  'dataset',
  'column',
  'type',
  'length',
  'nullable',
  'pii',
  'sourceMapping',
  'validValues',
  'description',
];

const EMPTY_ROW: BulkPdeRow = {
  dataset: '',
  column: '',
  type: '',
  length: '',
  nullable: '',
  pii: '',
  sourceMapping: '',
  validValues: '',
  description: '',
};

/** Split a CSV line respecting double-quoted fields. */
export function splitCsvLine(line: string): string[] {
  const cells: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          current += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        current += ch;
      }
      continue;
    }
    if (ch === '"') {
      inQuotes = true;
      continue;
    }
    if (ch === ',') {
      cells.push(current.trim());
      current = '';
      continue;
    }
    current += ch;
  }
  cells.push(current.trim());
  return cells;
}

function normalizeHeader(h: string): string {
  return h.trim().replace(/^\uFEFF/, '').toLowerCase();
}

/**
 * Parse a PDE template CSV into rows. Header names must match template columns
 * (case-insensitive). Unknown columns are ignored.
 */
export function parseBulkPdeCsv(text: string): BulkPdeRow[] {
  const lines = text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n')
    .map((l) => l.trimEnd())
    .filter((l) => l.trim().length > 0);

  if (lines.length < 2) {
    throw new Error('CSV must include a header row and at least one data row.');
  }

  const headers = splitCsvLine(lines[0]).map(normalizeHeader);
  const indexByKey = new Map<keyof BulkPdeRow, number>();
  for (const key of BULK_PDE_COLUMNS) {
    const idx = headers.indexOf(key.toLowerCase());
    if (idx >= 0) indexByKey.set(key, idx);
  }

  if (!indexByKey.has('dataset') || !indexByKey.has('column') || !indexByKey.has('type')) {
    throw new Error(
      'CSV header must include at least dataset, column, and type columns.',
    );
  }

  return lines.slice(1).map((line) => {
    const cells = splitCsvLine(line);
    const row: BulkPdeRow = { ...EMPTY_ROW };
    for (const key of BULK_PDE_COLUMNS) {
      const idx = indexByKey.get(key);
      if (idx === undefined) continue;
      row[key] = cells[idx] ?? '';
    }
    // Allow "VARCHAR(30)" in type cell → split length if length column empty
    const typeMatch = row.type.match(/^([A-Za-z]+)\s*\(([^)]+)\)\s*$/);
    if (typeMatch && !row.length) {
      row.type = typeMatch[1];
      row.length = typeMatch[2];
    }
    return row;
  });
}
