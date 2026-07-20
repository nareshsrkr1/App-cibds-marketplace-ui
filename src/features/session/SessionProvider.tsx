import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { fetchSessionContext } from './session.api';
import type { SessionContext } from './session.types';

export type SessionStatus = 'loading' | 'ready' | 'error';

export type SessionState = {
  session: SessionContext | null;
  status: SessionStatus;
  error: string | null;
  /** Re-fetch session context (e.g. after a "Retry" action). */
  reload: () => void;
};

const SessionCtx = createContext<SessionState | undefined>(undefined);

/**
 * Fetches session context once and shares it across every consumer
 * (Landing, Workspace, …) instead of each page calling
 * `fetchSessionContext` independently on mount.
 */
export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<SessionContext | null>(null);
  const [status, setStatus] = useState<SessionStatus>('loading');
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const ac = new AbortController();
    setStatus('loading');
    setError(null);

    void fetchSessionContext({ signal: ac.signal })
      .then((res) => {
        if (!mountedRef.current) return;
        if (!res.ok) {
          setSession(null);
          setStatus('error');
          setError(res.error);
          return;
        }
        setSession(res.data);
        setStatus('ready');
        setError(null);
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        if (!mountedRef.current) return;
        setSession(null);
        setStatus('error');
        setError(err instanceof Error ? err.message : 'Unable to load session.');
      });

    return () => {
      ac.abort();
    };
  }, [reloadToken]);

  const reload = useCallback(() => setReloadToken((n) => n + 1), []);

  const value = useMemo<SessionState>(
    () => ({ session, status, error, reload }),
    [session, status, error, reload],
  );

  return <SessionCtx.Provider value={value}>{children}</SessionCtx.Provider>;
}

export function useSession(): SessionState {
  const ctx = useContext(SessionCtx);
  if (!ctx) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return ctx;
}
