import { useEffect, useMemo, useRef, useState } from 'react';
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
import type { NavGroup } from './nav.types';
import {
  fetchConsoleCharts,
  fetchConsoleConsumers,
  fetchConsoleGovernance,
  fetchConsoleHero,
  fetchConsoleSubscriptionRequests,
  fetchWorkspaceNav,
} from './workspace.api';
import type {
  ConsoleChart,
  ConsoleChartTier,
  ConsoleHero,
  ConsolePanel,
} from './workspace.types';

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
  const labels = ctx.personaLabels ?? {};

  return available.map((role) => {
    const id = role.toUpperCase();
    return {
      id,
      label: labels[id] ?? id.charAt(0) + id.slice(1).toLowerCase(),
      enabled: enabled.has(id),
    };
  });
}

function isHeroReady(data: ConsoleHero): boolean {
  return (data.kpis?.length ?? 0) > 0 || (data.actions?.length ?? 0) > 0;
}

function panelReady(panel: ConsolePanel | null): SectionStatus {
  return (panel?.items?.length ?? 0) > 0 ? 'ready' : 'empty';
}

export function WorkspacePage() {
  const [session, setSession] = useState<SessionContext | null>(null);
  const [sessionStatus, setSessionStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [persona, setPersona] = useState('PRODUCER');
  const [reloadToken, setReloadToken] = useState(0);

  const [navGroups, setNavGroups] = useState<NavGroup[]>([]);
  const [navStatus, setNavStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [navRefreshing, setNavRefreshing] = useState(false);

  const [hero, setHero] = useState<ConsoleHero | null>(null);
  const [heroStatus, setHeroStatus] = useState<SectionStatus>('loading');
  const [heroError, setHeroError] = useState<string | null>(null);

  const [charts, setCharts] = useState<ConsoleChart[]>([]);
  const [chartTiers, setChartTiers] = useState<ConsoleChartTier[]>([]);
  const [chartsStatus, setChartsStatus] = useState<SectionStatus>('loading');
  const [chartsError, setChartsError] = useState<string | null>(null);

  const [primaryPanel, setPrimaryPanel] = useState<ConsolePanel | null>(null);
  const [primaryStatus, setPrimaryStatus] = useState<SectionStatus>('loading');
  const [primaryError, setPrimaryError] = useState<string | null>(null);
  const [primaryTitle, setPrimaryTitle] = useState('Panel');

  const [secondaryPanel, setSecondaryPanel] = useState<ConsolePanel | null>(null);
  const [secondaryStatus, setSecondaryStatus] = useState<SectionStatus>('loading');
  const [secondaryError, setSecondaryError] = useState<string | null>(null);
  const [secondaryTitle, setSecondaryTitle] = useState('Panel');

  const [bodyStageClass, setBodyStageClass] = useState<'is-enter' | ''>('');
  const hydratedRef = useRef(false);

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
    const p = persona.toUpperCase();

    setNavRefreshing(hydratedRef.current);
    if (!hydratedRef.current) {
      setNavStatus('loading');
      setHeroStatus('loading');
    } else {
      // Keep wishes/hero/KPIs/actions on screen; only refresh charts + panels.
      setChartsStatus('loading');
      setPrimaryStatus('loading');
      setSecondaryStatus('loading');
      setCharts([]);
      setChartTiers([]);
      setPrimaryPanel(null);
      setSecondaryPanel(null);
      setBodyStageClass('');
    }

    setHeroError(null);
    setChartsError(null);
    setPrimaryError(null);
    setSecondaryError(null);

    void fetchWorkspaceNav(persona).then((res) => {
      if (cancelled) return;
      if (!res.ok) {
        setNavStatus('error');
        setNavGroups([]);
        setNavRefreshing(false);
        return;
      }
      setNavGroups(res.data.groups ?? []);
      setNavStatus('ready');
      setNavRefreshing(false);
    });

    void fetchConsoleHero(persona).then((res) => {
      if (cancelled) return;
      if (!res.ok) {
        setHeroStatus('error');
        setHeroError(res.error);
        if (!hydratedRef.current) setHero(null);
        return;
      }
      setHero(res.data);
      setHeroStatus(isHeroReady(res.data) ? 'ready' : 'empty');
      hydratedRef.current = true;
    });

    void fetchConsoleCharts(persona).then((res) => {
      if (cancelled) return;
      if (!res.ok) {
        setChartsStatus('error');
        setChartsError(res.error);
        setCharts([]);
        setChartTiers([]);
        if (hydratedRef.current) setBodyStageClass('is-enter');
        return;
      }
      setCharts(res.data.charts ?? []);
      setChartTiers(res.data.tiers ?? []);
      setChartsStatus((res.data.charts?.length ?? 0) > 0 ? 'ready' : 'empty');
      if (hydratedRef.current) setBodyStageClass('is-enter');
    });

    if (p === 'PRODUCER') {
      setPrimaryTitle('My consumers · last delivery & SLA');
      setSecondaryTitle('Subscription requests · awaiting your approval');
      void fetchConsoleConsumers(persona).then((res) => {
        if (cancelled) return;
        if (!res.ok) {
          setPrimaryStatus('error');
          setPrimaryError(res.error);
          return;
        }
        setPrimaryPanel(res.data.panel);
        setPrimaryStatus(panelReady(res.data.panel));
      });
      void fetchConsoleSubscriptionRequests(persona).then((res) => {
        if (cancelled) return;
        if (!res.ok) {
          setSecondaryStatus('error');
          setSecondaryError(res.error);
          return;
        }
        setSecondaryPanel(res.data.panel);
        setSecondaryStatus(panelReady(res.data.panel));
      });
    } else if (p === 'GOVERNANCE') {
      setPrimaryTitle('Endorsement queue');
      setSecondaryStatus('empty');
      setSecondaryPanel(null);
      void fetchConsoleGovernance(persona).then((res) => {
        if (cancelled) return;
        if (!res.ok) {
          setPrimaryStatus('error');
          setPrimaryError(res.error);
          return;
        }
        setPrimaryPanel(res.data.panel);
        setPrimaryStatus(panelReady(res.data.panel));
      });
    } else {
      setPrimaryPanel(null);
      setSecondaryPanel(null);
      setPrimaryStatus('empty');
      setSecondaryStatus('empty');
    }

    return () => {
      cancelled = true;
    };
  }, [sessionStatus, session, persona, reloadToken]);

  const handlePersonaChange = (next: string) => {
    if (next === persona) return;
    setPersona(next);
  };

  const personas = useMemo(
    () =>
      session
        ? personasFromContext(session)
        : ALL_PERSONAS.map((id) => ({
            id,
            label: id.charAt(0) + id.slice(1).toLowerCase(),
            enabled: true,
          })),
    [session],
  );

  const userSubtitle =
    session?.personaProfiles?.[persona.toUpperCase()]?.subtitle ??
    session?.userSubtitle ??
    session?.personaLabels?.[persona.toUpperCase()] ??
    persona;

  if (sessionStatus === 'loading') {
    return null;
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

  const showInitialSpinner = heroStatus === 'loading' && !hydratedRef.current;

  return (
    <WorkspaceShell
      personas={personas}
      activePersonaId={persona}
      onPersonaChange={handlePersonaChange}
      userInitials={session.user.initials}
      userName={session.user.displayName}
      userSubtitle={userSubtitle}
      navGroups={navGroups}
      navStatus={navStatus}
      navRefreshing={navRefreshing}
    >
      {showInitialSpinner && (
        <div className="workspace-loading workspace-loading--main" role="status" aria-label="Loading">
          <Spinner size="lg" label="Loading" />
        </div>
      )}
      {heroStatus === 'error' && !hero && (
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
      {hero && heroStatus === 'ready' ? (
        <ProducerConsole
          hero={hero}
          charts={charts}
          chartTiers={chartTiers}
          chartsStatus={chartsStatus}
          chartsError={chartsError}
          primaryPanel={primaryPanel}
          primaryStatus={primaryStatus}
          primaryError={primaryError}
          primaryEmptyTitle={primaryTitle}
          secondaryPanel={secondaryPanel}
          secondaryStatus={secondaryStatus}
          secondaryError={secondaryError}
          secondaryEmptyTitle={secondaryTitle}
          bodyStageClass={bodyStageClass}
        />
      ) : null}
    </WorkspaceShell>
  );
}
