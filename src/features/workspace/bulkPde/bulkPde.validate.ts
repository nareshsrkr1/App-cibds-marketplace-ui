import type { BulkPdeRow } from './bulkPde.types';

const KNOWN_TYPE =
  /^(VARCHAR|CHAR|DECIMAL|NUMERIC|INT|BIGINT|DATE|TIMESTAMP|TEXT|FLOAT|MONEY|BOOLEAN)/i;

/** Client-side validation rules matching the HTML SoT `bpdeValidate`. */
export function validateBulkPdeRow(row: BulkPdeRow): string[] {
  const errs: string[] = [];
  if (!row.column?.trim()) errs.push('Missing column name');
  if (!row.type?.trim()) errs.push('Missing type');
  else if (!KNOWN_TYPE.test(row.type)) errs.push('Unknown type');
  if (!row.dataset?.trim()) errs.push('Missing dataset');
  if (row.pii && !/^(yes|no)$/i.test(row.pii)) errs.push('PII must be Yes/No');
  return errs;
}

export function summarizeBulkPdeRows(rows: BulkPdeRow[]) {
  const validRows = rows.filter((r) => validateBulkPdeRow(r).length === 0);
  return {
    total: rows.length,
    valid: validRows.length,
    invalid: rows.length - validRows.length,
    validRows,
  };
}
