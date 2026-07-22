import type { AppRegistryEntry } from './registry';

export function mintDatasetId(): string {
  return `DS-CIB-${String(40300 + Math.floor(Math.random() * 699))}`;
}

export function resolveMintIds(
  app: string,
  registry: Record<string, AppRegistryEntry>,
): { offerId: string; appId: string; dsId: string } | null {
  const entry = registry[app];
  if (!entry) return null;
  return {
    offerId: entry.offerId,
    appId: entry.appId,
    dsId: mintDatasetId(),
  };
}
