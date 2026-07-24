import { describe, expect, it } from 'vitest';
import { adaptBusinessElements, adaptLogicalModel } from './logicalModel.adapter';

describe('adaptLogicalModel', () => {
  it('coerces a well-formed response', () => {
    const result = adaptLogicalModel({
      subjectAreas: [
        {
          id: 'trade-lifecycle',
          label: 'Trade Lifecycle',
          domain: 'CIB',
          subDomain: 'Trading Data',
          logicalDatasetCount: 2,
          bdeCount: 7,
          realisedCount: 31,
          status: 'Endorsed',
        },
      ],
      logicalDatasets: [
        {
          id: 'trade-identifiers',
          name: 'Trade Identifiers',
          subjectAreaId: 'trade-lifecycle',
          bdeNames: ['Trade Identifier'],
          bdeCount: 1,
          pdeCount: 11,
        },
      ],
    });
    expect(result.subjectAreas).toHaveLength(1);
    expect(result.logicalDatasets).toHaveLength(1);
    expect(result.subjectAreas[0].status).toBe('Endorsed');
  });

  it('drops malformed entries and defaults an invalid status to Proposed', () => {
    const result = adaptLogicalModel({
      subjectAreas: [
        { id: 'a', label: 'A', status: 'Bogus' },
        { label: 'missing id' },
        null,
      ] as never,
      logicalDatasets: 'not-an-array' as never,
    });
    expect(result.subjectAreas).toHaveLength(1);
    expect(result.subjectAreas[0].status).toBe('Proposed');
    expect(result.logicalDatasets).toEqual([]);
  });

  it('handles a missing/malformed top-level response', () => {
    expect(adaptLogicalModel(null as never)).toEqual({ subjectAreas: [], logicalDatasets: [] });
  });
});

describe('adaptBusinessElements', () => {
  it('coerces a well-formed BDE record', () => {
    const result = adaptBusinessElements({
      elements: [
        {
          id: 'BDE_D001',
          name: 'Trade Identifier',
          definition: 'def',
          classification: 'Internal',
          pii: false,
          isCde: true,
          status: 'Endorsed',
          realizations: [{ datasetName: 'Ds1', sor: 'Endur', columns: ['col1'] }],
        },
      ],
    } as never);
    expect(result.elements).toHaveLength(1);
    expect(result.elements[0].isCde).toBe(true);
    expect(result.elements[0].realizations[0].columns).toEqual(['col1']);
  });

  it('defaults an invalid classification and drops malformed realizations', () => {
    const result = adaptBusinessElements({
      elements: [
        {
          id: 'BDE_D002',
          name: 'X',
          classification: 'NotReal',
          realizations: [{ sor: 'Endur' }, { datasetName: 'Ds2', sor: 'Endur', columns: ['c'] }],
        },
      ],
    } as never);
    expect(result.elements[0].classification).toBe('Internal');
    expect(result.elements[0].realizations).toHaveLength(1);
  });
});
