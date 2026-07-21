import { describe, expect, it } from 'vitest';
import { parseBulkPdeCsv, splitCsvLine } from './bulkPde.parseCsv';

describe('splitCsvLine', () => {
  it('splits plain and quoted cells', () => {
    expect(splitCsvLine('a,b,c')).toEqual(['a', 'b', 'c']);
    expect(splitCsvLine('a,"b,c",d')).toEqual(['a', 'b,c', 'd']);
    expect(splitCsvLine('a,"b""c",d')).toEqual(['a', 'b"c', 'd']);
  });
});

describe('parseBulkPdeCsv', () => {
  it('parses template-shaped CSV rows', () => {
    const csv = [
      'dataset,column,type,length,nullable,pii,sourceMapping,validValues,description',
      'Endur FX Forwards,fx_deal_id,VARCHAR,30,No,No,Endur.DEAL.DEAL_ID,,Unique FX deal reference',
      'Endur FX Forwards,,DECIMAL,"18,2",No,No,,,Missing column name',
    ].join('\n');

    const rows = parseBulkPdeCsv(csv);
    expect(rows).toHaveLength(2);
    expect(rows[0].column).toBe('fx_deal_id');
    expect(rows[0].type).toBe('VARCHAR');
    expect(rows[0].length).toBe('30');
    expect(rows[1].column).toBe('');
  });

  it('splits type(length) when length column is empty', () => {
    const csv = [
      'dataset,column,type,length,nullable,pii,sourceMapping,validValues,description',
      'DS1,col1,VARCHAR(30),,No,No,,,desc',
    ].join('\n');
    const rows = parseBulkPdeCsv(csv);
    expect(rows[0].type).toBe('VARCHAR');
    expect(rows[0].length).toBe('30');
  });

  it('rejects CSV without required headers', () => {
    expect(() => parseBulkPdeCsv('a,b\n1,2')).toThrow(/dataset, column, and type/i);
  });
});
