import { useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { LandingPage } from '../features/landing/LandingPage';
import { AppErrorBoundary } from './AppErrorBoundary';
import { ToastProvider } from '../components/feedback/Toast/ToastProvider';
import { shouldStartMsw } from './api/apiConfig';
import '../theme/tokens.css';
import '../theme/globals.css';
import '../theme/components.css';

export function App() {
  // Vitest uses the MSW node server from src/test/setup.ts — skip the browser worker there.
  const skipBrowserWorker = import.meta.env.MODE === 'test';
  const [ready, setReady] = useState(
    () => skipBrowserWorker || !shouldStartMsw(),
  );

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
      .catch(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, [skipBrowserWorker]);

  if (!ready) return null;

  return (
    <AppErrorBoundary>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ToastProvider />
    </AppErrorBoundary>
  );
}
