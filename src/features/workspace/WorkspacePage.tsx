import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Spinner } from '../../components/feedback/Spinner/Spinner';
import { EmptyState } from '../../components/feedback/EmptyState/EmptyState';
import { ErrorState } from '../../components/feedback/ErrorState/ErrorState';
import { WorkspaceShell } from '../../components/layout/WorkspaceShell/WorkspaceShell';
import type { PersonaOption } from '../../components/persona/PersonaSelector/PersonaSelector';
import { fetchSessionContext } from '../session/session.api';
import { ALL_PERSONAS, type SessionContext } from '../session/session.types';
import { ProducerConsole } from './components/ProducerConsole';
import { fetchConsoleSummary } from './workspace.api';
import type { ConsoleSummary } from './workspace.types';

const PERSONA_LABELS: Record<string, string> = {
  ADMIN: 'Admin',
  PRODUCER: 'Producer',
  CONSUMER: 'Consumer',
  GOVERNANCE: 'Governance',
};

/** Always show HTML persona set; enable only those returned by session API. */
function personasFromContext(ctx: SessionContext): PersonaOption[] {
  const available =
    ctx.availablePersonas && ctx.availablePersonas.length > 0
      ? ctx.availablePersonas
      : [...ALL_PERSONAS];
  const enabled = new Set(
    (ctx.enabledPersonas && ctx.enabledPersonas.length > 0
      ? ctx.enabledPersonas
      : ctx.roles
    ).map((p) => p.toUpperCase()),
  );

  return available.map((role) => {
    const id = role.toUpperCase();
    return {
      id,
      label: PERSONA_LABELS[id] ?? role,
      enabled: enabled.has(id),
    };
  });
}

function isConsoleReady(data: ConsoleSummary): boolean {
  return (data.kpis?.length ?? 0) > 0 || (data.panels?.length ?? 0) > 0;
}

export function WorkspacePage() {
  const [session, setSession] = useState<SessionContext | null>(null);
  const [sessionStatus, setSessionStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [persona, setPersona] = useState('PRODUCER');
  const [consoleData, setConsoleData] = useState<ConsoleSummary | null>(null);
  const [consoleStatus, setConsoleStatus] = useState<'loading' | 'ready' | 'empty' | 'error'>('loading');
  const [consoleError, setConsoleError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setSessionStatus('loading');
    void fetchSessionContext().then((res) => {
      if (cancelled) return;
      if (!res.ok) {
        setSessionStatus('error');
        setSessionError(res.error);
        setSession(null);
        return;
      }
      setSession(res.data);
      setPersona(res.data.defaultPersona || 'PRODUCER');
      setSessionStatus('ready');
      setSessionError(null);
    });
    return () => {
      cancelled = true;
    };
  }, [reloadToken]);

  useEffect(() => {
    if (sessionStatus !== 'ready' || !session) return;
    let cancelled = false;
    setConsoleStatus('loading');
    void fetchConsoleSummary(persona).then((res) => {
      if (cancelled) return;
      if (!res.ok) {
        setConsoleStatus('error');
        setConsoleError(res.error);
        setConsoleData(null);
        return;
      }
      const data = res.data;
      if (!data || !isConsoleReady(data)) {
        setConsoleData(data);
        setConsoleStatus('empty');
        return;
      }
      setConsoleData(data);
      setConsoleStatus('ready');
      setConsoleError(null);
    });
    return () => {
      cancelled = true;
    };
  }, [sessionStatus, session, persona, reloadToken]);

  const personas = useMemo(
    () =>
      session
        ? personasFromContext(session)
        : ALL_PERSONAS.map((id) => ({
            id,
            label: PERSONA_LABELS[id],
            enabled: id === 'PRODUCER',
          })),
    [session],
  );

  if (sessionStatus === 'loading') {
    return (
      <div className="workspace-loading" role="status" aria-label="Loading">
        <Spinner size="lg" label="Loading" />
      </div>
    );
  }

  if (sessionStatus === 'error' || !session) {
    return (
      <div className="workspace-state">
        <ErrorState
          title="Unable to load workspace"
          description={sessionError ?? 'Session context is unavailable.'}
          onRetry={() => setReloadToken((n) => n + 1)}
        />
        <p className="workspace-back">
          <Link to="/">Back to landing</Link>
        </p>
      </div>
    );
  }

  return (
    <WorkspaceShell
      personas={personas}
      activePersonaId={persona}
      onPersonaChange={setPersona}
      userInitials={session.user.initials}
      userName={session.user.displayName}
      userSubtitle={session.userSubtitle}
    >
      {consoleStatus === 'loading' && (
        <div className="workspace-loading workspace-loading--main" role="status" aria-label="Loading">
          <Spinner size="lg" label="Loading" />
        </div>
      )}
      {consoleStatus === 'error' && (
        <div className="workspace-state workspace-state--main">
          <ErrorState
            title="Unable to load console"
            description={consoleError ?? 'Console data is unavailable.'}
            onRetry={() => setReloadToken((n) => n + 1)}
          />
        </div>
      )}
      {consoleStatus === 'empty' && (
        <div className="workspace-state workspace-state--main">
          <EmptyState
            title={consoleData?.greeting ?? 'No console data'}
            description={
              consoleData?.subtitle ??
              'There is nothing to show for this persona yet.'
            }
          />
        </div>
      )}
      {consoleStatus === 'ready' && consoleData ? <ProducerConsole data={consoleData} /> : null}
    </WorkspaceShell>
  );
}
