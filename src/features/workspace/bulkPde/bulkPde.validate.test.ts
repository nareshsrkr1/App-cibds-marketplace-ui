import { describe, expect, it } from 'vitest';
import { summarizeBulkPdeRows, validateBulkPdeRow } from './bulkPde.validate';
import type { BulkPdeRow } from './bulkPde.types';

function row(partial: Partial<BulkPdeRow>): BulkPdeRow {
  return {
    dataset: 'Endur FX Forwards',
    column: 'fx_deal_id',
    type: 'VARCHAR',
    length: '30',
    nullable: 'No',
    pii: 'No',
    sourceMapping: '',
    validValues: '',
    description: '',
    ...partial,
  };
}

describe('validateBulkPdeRow', () => {
  it('accepts a well-formed row', () => {
    expect(validateBulkPdeRow(row({}))).toEqual([]);
  });

  it('requires column, type, and dataset', () => {
    expect(validateBulkPdeRow(row({ column: '' }))).toContain('Missing column name');
    expect(validateBulkPdeRow(row({ type: '' }))).toContain('Missing type');
    expect(validateBulkPdeRow(row({ dataset: '' }))).toContain('Missing dataset');
  });

  it('rejects unknown types', () => {
    expect(validateBulkPdeRow(row({ type: 'BLOB' }))).toContain('Unknown type');
  });

  it('requires PII Yes/No when present', () => {
    expect(validateBulkPdeRow(row({ pii: 'Maybe' }))).toContain('PII must be Yes/No');
  });
});

describe('summarizeBulkPdeRows', () => {
  it('counts valid and invalid rows', () => {
    const summary = summarizeBulkPdeRows([
      row({}),
      row({ column: '' }),
      row({ column: 'ccy_pair', type: 'CHAR' }),
    ]);
    expect(summary.total).toBe(3);
    expect(summary.valid).toBe(2);
    expect(summary.invalid).toBe(1);
    expect(summary.validRows).toHaveLength(2);
  });
});
