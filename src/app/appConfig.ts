export type FeatureFlags = {
  notifications: boolean;
  workspace: boolean;
  catalogue: boolean;
};

export const appConfig = {
  appName: 'CIB Data Marketplace',
  version: '0.1.0',
  features: {
    notifications: true,
    workspace: false,
    catalogue: false,
  } satisfies FeatureFlags,
} as const;
