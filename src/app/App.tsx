import { lazy, Suspense, useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { LandingPage } from '../features/landing/LandingPage';
import { SessionProvider } from '../features/session/SessionProvider';
import { AppErrorBoundary } from './AppErrorBoundary';
import { Spinner } from '../components/feedback/Spinner/Spinner';
import { ToastProvider } from '../components/feedback/Toast/ToastProvider';
import { logger } from '../services/logger';
import { shouldStartMsw } from './api/apiConfig';
import '../theme/tokens.css';
import '../theme/globals.css';
import '../theme/components.css';

// Code-split the heavier workspace console out of the landing bundle.
const WorkspacePage = lazy(() =>
  import('../features/workspace/WorkspacePage').then((m) => ({
    default: m.WorkspacePage,
  })),
);

function RouteFallback() {
  return (
    <div
      className="workspace-loading workspace-loading--main"
      role="status"
      aria-label="Loading"
    >
      <Spinner size="lg" label="Loading" />
    </div>
  );
}

export function App() {
  // Vitest uses the MSW node server from src/test/setup.ts — skip the browser worker there.
  const skipBrowserWorker = import.meta.env.MODE === 'test';
  const [ready, setReady] = useState(() => skipBrowserWorker || !shouldStartMsw());

  useEffect(() => {
    let cancelled = false;
    if (skipBrowserWorker || !shouldStartMsw()) {
      setReady(true);
      return;
    }
    void import('../mocks/landing/browser')
      .then(({ startMockWorker }) => startMockWorker())
      .then(() => {
        if (!cancelled) setReady(true);
      })
      .catch((error: unknown) => {
        logger.error(
          '[MSW] Failed to start mock worker — API calls will not be mocked.',
          error,
        );
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, [skipBrowserWorker]);

  if (!ready) return null;

  return (
    <AppErrorBoundary>
      <SessionProvider>
        <Routes>
          <Route
            path="/"
            element={
              <AppErrorBoundary>
                <LandingPage />
              </AppErrorBoundary>
            }
          />
          <Route
            path="/workspace"
            element={
              <AppErrorBoundary>
                <Suspense fallback={<RouteFallback />}>
                  <WorkspacePage />
                </Suspense>
              </AppErrorBoundary>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </SessionProvider>
      <ToastProvider />
    </AppErrorBoundary>
  );
}
