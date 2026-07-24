import { lazy, Suspense, useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { SessionProvider } from '../features/session/SessionProvider';
import { AppErrorBoundary } from './AppErrorBoundary';
import { Spinner } from '../components/feedback/Spinner/Spinner';
import { ToastProvider } from '../components/feedback/Toast/ToastProvider';
import { logger } from '../services/logger';
import { shouldStartMsw } from './api/apiConfig';
import '../theme/tokens.css';
import '../theme/globals.css';
import '../theme/components.css';

const LandingPage = lazy(() =>
  import('../features/landing/LandingPage').then((m) => ({
    default: m.LandingPage,
  })),
);

const WorkspacePage = lazy(() =>
  import('../features/workspace/WorkspacePage').then((m) => ({
    default: m.WorkspacePage,
  })),
);

const WorkspaceConsolePage = lazy(() =>
  import('../features/workspace/WorkspaceConsolePage').then((m) => ({
    default: m.WorkspaceConsolePage,
  })),
);

const BulkUploadPdesPage = lazy(() =>
  import('../features/workspace/bulkPde/BulkUploadPdesPage').then((m) => ({
    default: m.BulkUploadPdesPage,
  })),
);

const BindColumnsPage = lazy(() =>
  import('../features/workspace/bindColumns/BindColumnsPage').then((m) => ({
    default: m.BindColumnsPage,
  })),
);

const WorkflowPage = lazy(() =>
  import('../features/workspace/workflow/WorkflowPage').then((m) => ({
    default: m.WorkflowPage,
  })),
);

const RegisterPhysicalDatasetPage = lazy(() =>
  import('../features/producer/ProducerPage').then((m) => ({
    default: m.ProducerPage,
  })),
);

const PhysicalDatasetsPage = lazy(() =>
  import('../features/workspace/physicalDatasets/PhysicalDatasetsPage').then((m) => ({
    default: m.PhysicalDatasetsPage,
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
    void import('../api/mock/browser')
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
                <Suspense fallback={<RouteFallback />}>
                  <LandingPage />
                </Suspense>
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
          >
            <Route
              index
              element={
                <Suspense fallback={<RouteFallback />}>
                  <WorkspaceConsolePage />
                </Suspense>
              }
            />
            <Route
              path="bulk-upload-pdes"
              element={
                <Suspense fallback={<RouteFallback />}>
                  <BulkUploadPdesPage />
                </Suspense>
              }
            />
            <Route
              path="bind-columns"
              element={
                <Suspense fallback={<RouteFallback />}>
                  <BindColumnsPage />
                </Suspense>
              }
            />
            <Route
              path="register-physical-dataset"
              element={
                <Suspense fallback={<RouteFallback />}>
                  <RegisterPhysicalDatasetPage />
                </Suspense>
              }
            />
            <Route
              path="workflow"
              element={
                <Suspense fallback={<RouteFallback />}>
                  <WorkflowPage />
                </Suspense>
              }
            />
            <Route
              path="physical-datasets"
              element={
                <Suspense fallback={<RouteFallback />}>
                  <PhysicalDatasetsPage />
                </Suspense>
              }
            />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </SessionProvider>
      <ToastProvider />
    </AppErrorBoundary>
  );
}
