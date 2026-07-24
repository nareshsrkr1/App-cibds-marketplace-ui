import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { isFeatureEnabled } from './config/featureFlags';

export type FeatureRouteProps = {
  flag: string;
  children: ReactNode;
};

/** Redirects to /workspace when the route's feature flag is off, so a
 * disabled feature is blocked by direct URL, not just hidden from the nav. */
export function FeatureRoute({ flag, children }: FeatureRouteProps) {
  if (!isFeatureEnabled(flag)) return <Navigate to="/workspace" replace />;
  return <>{children}</>;
}
