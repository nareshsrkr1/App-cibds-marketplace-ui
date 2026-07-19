import { Navigate, Route, Routes } from 'react-router-dom';
import { LandingPage } from '../features/landing/LandingPage';
import { AppErrorBoundary } from './AppErrorBoundary';
import { ToastProvider } from '../components/feedback/Toast/ToastProvider';
import '../theme/tokens.css';
import '../theme/globals.css';
import '../theme/components.css';

export function App() {
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
