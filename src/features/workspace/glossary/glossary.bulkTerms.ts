import type { CatalogueClassification, SubjectArea } from '../logicalModel/logicalModel.types';
import type { GlossaryTerm } from './glossary.types';

export type GlossaryTermCsvRow = {
  term: string;
  subjectArea: string;
  definition: string;
  classification: string;
  pii: string;
};

export const GLOSSARY_TERM_CSV_COLUMNS: (keyof GlossaryTermCsvRow)[] = [
  'term',
  'subjectArea',
  'definition',
  'classification',
  'pii',
];

const CLASSIFICATIONS: CatalogueClassification[] = ['Internal', 'Confidential', 'Restricted'];

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
  return h.trim().replace(/^﻿/, '').toLowerCase();
}

const EMPTY_ROW: GlossaryTermCsvRow = {
  term: '',
  subjectArea: '',
  definition: '',
  classification: '',
  pii: '',
};

/** Parse a glossary-term template CSV into rows. Header names must match template
 * columns (case-insensitive, "subject area" also accepted for "subjectArea"). */
export function parseGlossaryTermsCsv(text: string): GlossaryTermCsvRow[] {
  const lines = text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n')
    .map((l) => l.trimEnd())
    .filter((l) => l.trim().length > 0);

  if (lines.length < 2) {
    throw new Error('CSV must include a header row and at least one data row.');
  }

  const headerAliases: Record<string, keyof GlossaryTermCsvRow> = {
    term: 'term',
    'glossary term': 'term',
    subjectarea: 'subjectArea',
    'subject area': 'subjectArea',
    definition: 'definition',
    classification: 'classification',
    pii: 'pii',
  };

  const headers = splitCsvLine(lines[0]).map(normalizeHeader);
  const indexByKey = new Map<keyof GlossaryTermCsvRow, number>();
  headers.forEach((h, idx) => {
    const key = headerAliases[h];
    if (key) indexByKey.set(key, idx);
  });

  if (!indexByKey.has('term') || !indexByKey.has('definition')) {
    throw new Error('CSV header must include at least Term and Definition columns.');
  }

  return lines.slice(1).map((line) => {
    const cells = splitCsvLine(line);
    const row: GlossaryTermCsvRow = { ...EMPTY_ROW };
    for (const key of GLOSSARY_TERM_CSV_COLUMNS) {
      const idx = indexByKey.get(key);
      if (idx === undefined) continue;
      row[key] = cells[idx] ?? '';
    }
    return row;
  });
}

/** Client-side validation for one parsed row — mirrors the HTML SoT's term-row rules. */
export function validateGlossaryTermCsvRow(row: GlossaryTermCsvRow, subjectAreas: SubjectArea[]): string[] {
  const errs: string[] = [];
  if (!row.term.trim()) errs.push('Missing term name');
  if (!row.definition.trim()) errs.push('Missing definition');
  if (!row.subjectArea.trim()) {
    errs.push('Missing subject area');
  } else if (!subjectAreas.some((a) => a.label.toLowerCase() === row.subjectArea.trim().toLowerCase())) {
    errs.push('Unknown subject area');
  }
  if (row.classification.trim() && !CLASSIFICATIONS.includes(row.classification.trim() as CatalogueClassification)) {
    errs.push('Invalid classification');
  }
  if (row.pii.trim() && !/^(yes|no)$/i.test(row.pii.trim())) {
    errs.push('PII must be Yes/No');
  }
  return errs;
}

export function summarizeGlossaryTermRows(rows: GlossaryTermCsvRow[], subjectAreas: SubjectArea[]) {
  const validRows = rows.filter((r) => validateGlossaryTermCsvRow(r, subjectAreas).length === 0);
  return {
    total: rows.length,
    valid: validRows.length,
    invalid: rows.length - validRows.length,
    validRows,
  };
}

/** A short, collision-resistant id derived from the term name. */
export function mintTermId(name: string): string {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  const suffix = Math.random().toString(36).slice(2, 6);
  return `term-${slug || 'new'}-${Date.now().toString(36)}${suffix}`;
}

export function csvRowToGlossaryTerm(row: GlossaryTermCsvRow, subjectAreas: SubjectArea[]): GlossaryTerm {
  const subjectArea = subjectAreas.find(
    (a) => a.label.toLowerCase() === row.subjectArea.trim().toLowerCase(),
  );
  return {
    id: mintTermId(row.term),
    name: row.term.trim(),
    definition: row.definition.trim(),
    subjectAreaId: subjectArea?.id ?? '',
    classification: (row.classification.trim() as CatalogueClassification) || 'Internal',
    pii: /^yes$/i.test(row.pii.trim()),
    status: 'Proposed',
    pdeCount: 0,
    bdeIds: [],
  };
}

/**
 * Ships with a deliberate mix of valid and invalid rows — same idea as the HTML SoT's own
 * bulk-upload sample data — so downloading the template and re-uploading it immediately
 * demonstrates the review step's pass/fail diff instead of only ever showing all-valid rows.
 */
export function glossaryTermsCsvTemplate(): string {
  const header = ['Term', 'Subject area', 'Definition', 'Classification', 'PII'];
  const rows = [
    [
      'Gross Exposure',
      'Market Risk Sensitivities',
      'Total exposure to a counterparty across all positions.',
      'Confidential',
      'No',
    ],
    [
      'Dirty Price',
      'Trade Valuation & Economics',
      'Price of a fixed-income security including accrued interest.',
      'Internal',
      'No',
    ],
    ['', 'Trade Lifecycle', 'Missing a term name — rejected on upload.', 'Internal', 'No'],
    [
      'Data Quality Score',
      'Not A Real Subject Area',
      'Unknown subject area — rejected on upload.',
      'Internal',
      'No',
    ],
    ['Client Tier', 'Sales Coverage & Revenue', 'Uses an invalid classification value.', 'Top Secret', 'No'],
    ['Trade Halt Flag', 'Trade Lifecycle', 'Uses an invalid PII value.', 'Internal', 'Maybe'],
  ];
  const toCsvCell = (v: string) => `"${v.replace(/"/g, '""')}"`;
  return [header, ...rows].map((r) => r.map(toCsvCell).join(',')).join('\n') + '\n';
}
