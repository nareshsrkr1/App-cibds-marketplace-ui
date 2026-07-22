import type { BindColumn } from './bindColumns.types';

/** Split a CSV line respecting double-quoted fields. */
function splitCsvLine(line: string): string[] {
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

function indexOf(headers: string[], ...aliases: string[]): number {
  for (const alias of aliases) {
    const i = headers.indexOf(alias.toLowerCase());
    if (i >= 0) return i;
  }
  return -1;
}

/** Header names accepted for a manual bind-columns metadata upload (order-independent). */
export const BIND_HARVEST_CSV_COLUMNS = [
  'column',
  'type',
  'length',
  'nullable',
  'valid values',
  'source mapping',
  'origination',
  'pii',
];

/**
 * Parse a manually-uploaded column metadata CSV for the "Other source" bind flow.
 * Only `column` and `type` are required — everything else defaults sensibly.
 */
export function parseBindColumnsCsv(text: string): BindColumn[] {
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
  const colIdx = indexOf(headers, 'column', 'column name', 'pde');
  const typeIdx = indexOf(headers, 'type', 'data type');
  if (colIdx < 0 || typeIdx < 0) {
    throw new Error('CSV header must include at least column and type columns.');
  }
  const lenIdx = indexOf(headers, 'length');
  const nulIdx = indexOf(headers, 'nullable');
  const valsIdx = indexOf(headers, 'valid values', 'validvalues');
  const srcmapIdx = indexOf(headers, 'source mapping', 'sourcemapping', 'srcmap');
  const origIdx = indexOf(headers, 'origination', 'orig');
  const piiIdx = indexOf(headers, 'pii');

  const get = (cells: string[], idx: number) => (idx >= 0 ? (cells[idx] ?? '').trim() : '');

  const rows: BindColumn[] = lines
    .slice(1)
    .map((line) => {
      const cells = splitCsvLine(line);
      let type = get(cells, typeIdx);
      let len = get(cells, lenIdx);
      // Allow "VARCHAR(30)" in the type cell when a separate length column is empty.
      const typeMatch = type.match(/^([A-Za-z]+)\s*\(([^)]+)\)\s*$/);
      if (typeMatch && !len) {
        type = typeMatch[1];
        len = typeMatch[2];
      }
      return {
        col: get(cells, colIdx),
        type,
        len,
        nul: get(cells, nulIdx) || 'Yes',
        vals: get(cells, valsIdx),
        srcmap: get(cells, srcmapIdx),
        orig: get(cells, origIdx) || 'No Transformation',
        pii: /^y/i.test(get(cells, piiIdx)) ? 'Yes' : 'No',
        suggest: '',
        method: 'n' as const,
        suggestedBde: '',
        xform: 'Straight copy',
      };
    })
    .filter((c) => c.col);

  return rows;
}

function toCsvCell(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/** Builds a downloadable CSV matching the headers `parseBindColumnsCsv` expects. */
export function buildBindColumnsCsv(rows: BindColumn[]): string {
  const lines = [BIND_HARVEST_CSV_COLUMNS.join(',')];
  for (const r of rows) {
    lines.push(
      [r.col, r.type, r.len, r.nul, r.vals, r.srcmap, r.orig, r.pii]
        .map(toCsvCell)
        .join(','),
    );
  }
  return `${lines.join('\n')}\n`;
}
