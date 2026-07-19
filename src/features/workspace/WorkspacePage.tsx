import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Spinner } from '../../components/feedback/Spinner/Spinner';
import { EmptyState } from '../../components/feedback/EmptyState/EmptyState';
import { ErrorState } from '../../components/feedback/ErrorState/ErrorState';
import { WorkspaceShell } from '../../components/layout/WorkspaceShell/WorkspaceShell';
import type { PersonaOption } from '../../components/persona/PersonaSelector/PersonaSelector';
import { fetchSessionContext } from '../session/session.api';
import { ALL_PERSONAS, type SessionContext } from '../session/session.types';
import {
  ProducerConsole,
  type SectionStatus,
} from './components/ProducerConsole';
import {
  fetchConsoleCharts,
  fetchConsoleGovernance,
  fetchConsoleHero,
  fetchConsoleSubscriptionRequests,
} from './workspace.api';
import type {
  ConsoleChart,
  ConsoleHero,
  ConsolePanel,
} from './workspace.types';

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

function isHeroReady(data: ConsoleHero): boolean {
  return (data.kpis?.length ?? 0) > 0 || (data.actions?.length ?? 0) > 0;
}

export function WorkspacePage() {
  const [session, setSession] = useState<SessionContext | null>(null);
  const [sessionStatus, setSessionStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [persona, setPersona] = useState('PRODUCER');
  const [reloadToken, setReloadToken] = useState(0);

  const [hero, setHero] = useState<ConsoleHero | null>(null);
  const [heroStatus, setHeroStatus] = useState<SectionStatus>('loading');
  const [heroError, setHeroError] = useState<string | null>(null);

  const [charts, setCharts] = useState<ConsoleChart[]>([]);
  const [chartsStatus, setChartsStatus] = useState<SectionStatus>('loading');
  const [chartsError, setChartsError] = useState<string | null>(null);

  const [subscriptionPanel, setSubscriptionPanel] = useState<ConsolePanel | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<SectionStatus>('loading');
  const [subscriptionError, setSubscriptionError] = useState<string | null>(null);

  const [governancePanel, setGovernancePanel] = useState<ConsolePanel | null>(null);
  const [governanceStatus, setGovernanceStatus] = useState<SectionStatus>('loading');
  const [governanceError, setGovernanceError] = useState<string | null>(null);

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

    setHeroStatus('loading');
    setChartsStatus('loading');
    setSubscriptionStatus('loading');
    setGovernanceStatus('loading');
    setHeroError(null);
    setChartsError(null);
    setSubscriptionError(null);
    setGovernanceError(null);

    void fetchConsoleHero(persona).then((res) => {
      if (cancelled) return;
      if (!res.ok) {
        setHeroStatus('error');
        setHeroError(res.error);
        setHero(null);
        return;
      }
      setHero(res.data);
      setHeroStatus(isHeroReady(res.data) ? 'ready' : 'empty');
    });

    void fetchConsoleCharts(persona).then((res) => {
      if (cancelled) return;
      if (!res.ok) {
        setChartsStatus('error');
        setChartsError(res.error);
        setCharts([]);
        return;
      }
      setCharts(res.data.charts ?? []);
      setChartsStatus((res.data.charts?.length ?? 0) > 0 ? 'ready' : 'empty');
    });

    void fetchConsoleSubscriptionRequests(persona).then((res) => {
      if (cancelled) return;
      if (!res.ok) {
        setSubscriptionStatus('error');
        setSubscriptionError(res.error);
        setSubscriptionPanel(null);
        return;
      }
      setSubscriptionPanel(res.data.panel);
      setSubscriptionStatus('ready');
    });

    void fetchConsoleGovernance(persona).then((res) => {
      if (cancelled) return;
      if (!res.ok) {
        setGovernanceStatus('error');
        setGovernanceError(res.error);
        setGovernancePanel(null);
        return;
      }
      setGovernancePanel(res.data.panel);
      setGovernanceStatus('ready');
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
      userSubtitle={
        session.userSubtitle ??
        PERSONA_LABELS[persona] ??
        PERSONA_LABELS[session.defaultPersona] ??
        session.roles[0]
      }
    >
      {heroStatus === 'loading' && (
        <div className="workspace-loading workspace-loading--main" role="status" aria-label="Loading">
          <Spinner size="lg" label="Loading" />
        </div>
      )}
      {heroStatus === 'error' && (
        <div className="workspace-state workspace-state--main">
          <ErrorState
            title="Unable to load console"
            description={heroError ?? 'Console hero is unavailable.'}
            onRetry={() => setReloadToken((n) => n + 1)}
          />
        </div>
      )}
      {heroStatus === 'empty' && hero && (
        <div className="workspace-state workspace-state--main">
          <EmptyState
            title={hero.greeting ?? 'No console data'}
            description={
              hero.subtitle ?? 'There is nothing to show for this persona yet.'
            }
          />
        </div>
      )}
      {heroStatus === 'ready' && hero ? (
        <ProducerConsole
          hero={hero}
          charts={charts}
          chartsStatus={chartsStatus}
          chartsError={chartsError}
          subscriptionPanel={subscriptionPanel}
          subscriptionStatus={subscriptionStatus}
          subscriptionError={subscriptionError}
          governancePanel={governancePanel}
          governanceStatus={governanceStatus}
          governanceError={governanceError}
        />
      ) : null}
    </WorkspaceShell>
  );
}
