import { describe, expect, it } from 'vitest';
import { inferRepresentation } from './bulkPde.inferRep';

describe('inferRepresentation', () => {
  it('maps technical types to representation classes', () => {
    expect(inferRepresentation('DECIMAL')).toBe('Amount');
    expect(inferRepresentation('DATE')).toBe('Date');
    expect(inferRepresentation('VARCHAR')).toBe('Name');
    expect(inferRepresentation('deal_id')).toBe('Attribute');
    expect(inferRepresentation('VARCHAR')).toBe('Name');
    expect(inferRepresentation('INT')).toBe('Quantity');
  });

  it('treats id-like char types as Identifier', () => {
    expect(inferRepresentation('VARCHAR')).toBe('Name');
    // column-name heuristics are applied to the type string in SoT
    expect(inferRepresentation('char_id')).toBe('Identifier');
  });
});