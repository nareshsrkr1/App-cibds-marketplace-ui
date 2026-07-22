export type AppRegistryEntry = {
  offerId: string;
  appId: string;
};

/** Mock application registry mirroring HTML REGISTRY for Producer Contract / App ID inherit. */
export const APP_REGISTRY: Record<string, AppRegistryEntry> = {
  Endur: { offerId: 'PC-ENDUR-01', appId: 'APP-ENDUR' },
  Catalyst: { offerId: 'PC-CAT-01', appId: 'APP-CATALYST' },
  'Aladdin Portfolio': { offerId: 'PC-ALD-01', appId: 'APP-ALADDIN' },
  'Trade Surveillance Hub': { offerId: 'PC-TSH-01', appId: 'APP-TSH' },
};

export function listApplications(): string[] {
  return Object.keys(APP_REGISTRY);
}
