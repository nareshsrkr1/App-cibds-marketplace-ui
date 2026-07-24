import { describe, expect, it } from 'vitest';
import { adaptGlossaryTerms } from './glossary.adapter';

describe('adaptGlossaryTerms', () => {
  it('coerces a well-formed response', () => {
    const result = adaptGlossaryTerms({
      terms: [
        {
          id: 'BDE_D001',
          name: 'Trade Identifier',
          definition: 'def',
          subjectAreaId: 'trade-lifecycle',
          classification: 'Internal',
          pii: false,
          status: 'Endorsed',
          pdeCount: 11,
          bdeIds: ['BDE_D001'],
        },
      ],
    });
    expect(result.terms).toHaveLength(1);
    expect(result.terms[0].status).toBe('Endorsed');
  });

  it('drops malformed entries and defaults invalid status/classification', () => {
    const result = adaptGlossaryTerms({
      terms: [
        { id: 'a', name: 'A', status: 'Bogus', classification: 'Nope' },
        { name: 'missing id' },
        null,
      ],
    } as never);
    expect(result.terms).toHaveLength(1);
    expect(result.terms[0].status).toBe('Proposed');
    expect(result.terms[0].classification).toBe('Internal');
    expect(result.terms[0].bdeIds).toEqual([]);
  });

  it('handles a missing/malformed top-level response', () => {
    expect(adaptGlossaryTerms(null as never)).toEqual({ terms: [] });
  });
});
