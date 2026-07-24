import { describe, expect, it } from 'vitest';
import { adaptLineageDetails, adaptLineageSummaries } from './lineage.adapter';

describe('adaptLineageSummaries', () => {
  it('coerces a well-formed response', () => {
    const result = adaptLineageSummaries({
      entries: [
        {
          key: 'Trade Identifier',
          term: 'Trade Identifier',
          bdeName: 'Trade Identifier',
          bdeId: 'BDE_D001',
          logicalDatasetName: 'Trade Identifiers',
          datasets: [{ datasetName: 'Ds1', sor: 'Endur', columnCount: 3 }],
          columnCount: 3,
        },
      ],
    });
    expect(result.entries).toHaveLength(1);
    expect(result.entries[0].datasets[0].columnCount).toBe(3);
  });

  it('drops malformed entries', () => {
    const result = adaptLineageSummaries({
      entries: [{ term: 'no key' }, null],
    } as never);
    expect(result.entries).toEqual([]);
  });
});

describe('adaptLineageDetails', () => {
  it('coerces a well-formed response including nested columns', () => {
    const result = adaptLineageDetails({
      entries: [
        {
          key: 'Trade Identifier',
          term: 'Trade Identifier',
          bdeId: 'BDE_D001',
          classification: 'Internal',
          status: 'Endorsed',
          datasets: [
            {
              datasetName: 'Ds1',
              sor: 'Endur',
              columns: [{ name: 'tradeid', type: 'DECIMAL', nullable: true }],
            },
          ],
        },
      ],
    } as never);
    expect(result.entries[0].datasets[0].columns[0].name).toBe('tradeid');
    expect(result.entries[0].datasets[0].columns[0].nullable).toBe(true);
  });

  it('defaults invalid classification/status and drops malformed columns', () => {
    const result = adaptLineageDetails({
      entries: [
        {
          key: 'X',
          classification: 'Bogus',
          status: 'Bogus',
          datasets: [{ datasetName: 'Ds1', sor: 'Endur', columns: [{ type: 'x' }, null] }],
        },
      ],
    } as never);
    expect(result.entries[0].classification).toBe('Internal');
    expect(result.entries[0].status).toBe('Proposed');
    expect(result.entries[0].datasets[0].columns).toEqual([]);
  });
});
