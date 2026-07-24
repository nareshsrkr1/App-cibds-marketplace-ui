import { describe, expect, it } from 'vitest';
import { FEATURE_FLAGS, isFeatureEnabled, resolveFeatureEnabled } from './featureFlags';

describe('featureFlags', () => {
  it('isFeatureEnabled reflects the registry for a tracked id', () => {
    expect(isFeatureEnabled('phys')).toBe(true);
    expect(isFeatureEnabled('register')).toBe(false);
  });

  it('isFeatureEnabled defaults to true for an untracked id', () => {
    expect(isFeatureEnabled('some-future-nav-item')).toBe(true);
  });

  it('resolveFeatureEnabled lets the registry win over the raw value when tracked', () => {
    expect(resolveFeatureEnabled('phys', false)).toBe(true);
    expect(resolveFeatureEnabled('register', true)).toBe(false);
  });

  it('resolveFeatureEnabled falls back to the raw value when untracked', () => {
    expect(resolveFeatureEnabled('some-future-nav-item', true)).toBe(true);
    expect(resolveFeatureEnabled('some-future-nav-item', false)).toBe(false);
  });

  it('every routed feature from workspaceRoutes has an entry', () => {
    for (const id of ['register', 'bulkpde', 'bind', 'workflow', 'phys']) {
      expect(Object.prototype.hasOwnProperty.call(FEATURE_FLAGS, id)).toBe(true);
    }
  });
});
