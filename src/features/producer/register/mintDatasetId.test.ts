import { describe, expect, it } from 'vitest';
import { APP_REGISTRY } from './registry';
import { mintDatasetId, resolveMintIds } from './mintDatasetId';

describe('mintDatasetId', () => {
  it('returns a DS-CIB-* id', () => {
    expect(mintDatasetId()).toMatch(/^DS-CIB-\d+$/);
  });

  it('resolves offerId, appId, and dsId for a known app', () => {
    const ids = resolveMintIds('Endur', APP_REGISTRY);
    expect(ids).not.toBeNull();
    expect(ids?.offerId).toBe('PC-ENDUR-01');
    expect(ids?.appId).toBe('APP-ENDUR');
    expect(ids?.dsId).toMatch(/^DS-CIB-/);
  });

  it('returns null for unknown app', () => {
    expect(resolveMintIds('Unknown', APP_REGISTRY)).toBeNull();
  });
});
