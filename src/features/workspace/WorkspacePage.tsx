import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Spinner } from '../../components/feedback/Spinner/Spinner';
import { EmptyState } from '../../components/feedback/EmptyState/EmptyState';
import { ErrorState } from '../../components/feedback/ErrorState/ErrorState';
import { WorkspaceShell } from '../../components/layout/WorkspaceShell/WorkspaceShell';
import type { PersonaOption } from '../../components/persona/PersonaSelector/PersonaSelector';
import { useSession } from '../session/SessionProvider';
import { ALL_PERSONAS, type SessionContext } from '../session/session.types';
import { ProducerConsole } from './components/ProducerConsole';
import { useConsoleData } from './useConsoleData';

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

export function WorkspacePage() {
  const {
    session,
    status: sessionStatus,
    error: sessionError,
    reload: reloadSession,
  } = useSession();
  const [persona, setPersona] = useState('PRODUCER');
  /** Reloads only console data (nav/hero/charts/panels) — independent of session. */
  const [consoleReloadToken, setConsoleReloadToken] = useState(0);

  // Seed the active persona from session's default once it becomes available.
  useEffect(() => {
    if (sessionStatus === 'ready' && session?.defaultPersona) {
      setPersona(session.defaultPersona);
    }
  }, [sessionStatus, session]);

  const data = useConsoleData(persona, sessionStatus === 'ready', consoleReloadToken);

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
          onRetry={reloadSession}
        />
        <p className="workspace-back">
          <Link to="/">Back to landing</Link>
        </p>
      </div>
    );
  }

  const showInitialSpinner = data.heroStatus === 'loading' && !data.hydrated;

  return (
    <WorkspaceShell
      personas={personas}
      activePersonaId={persona}
      onPersonaChange={handlePersonaChange}
      userInitials={session.user.initials}
      userName={session.user.displayName}
      userSubtitle={userSubtitle}
      navGroups={data.navGroups}
      navStatus={data.navStatus}
      navRefreshing={data.navRefreshing}
    >
      {showInitialSpinner && (
        <div
          className="workspace-loading workspace-loading--main"
          role="status"
          aria-label="Loading"
        >
          <Spinner size="lg" label="Loading" />
        </div>
      )}
      {data.heroStatus === 'error' && !data.hero && (
        <div className="workspace-state workspace-state--main">
          <ErrorState
            title="Unable to load console"
            description={data.heroError ?? 'Console hero is unavailable.'}
            onRetry={() => setConsoleReloadToken((n) => n + 1)}
          />
        </div>
      )}
      {data.heroStatus === 'empty' && data.hero && (
        <div className="workspace-state workspace-state--main">
          <EmptyState
            title={data.hero.greeting ?? 'No console data'}
            description={
              data.hero.subtitle ?? 'There is nothing to show for this persona yet.'
            }
          />
        </div>
      )}
      {data.hero && data.heroStatus === 'ready' ? (
        <ProducerConsole
          hero={data.hero}
          charts={data.charts}
          chartTiers={data.chartTiers}
          chartsStatus={data.chartsStatus}
          chartsError={data.chartsError}
          primaryPanel={data.primaryPanel}
          primaryStatus={data.primaryStatus}
          primaryError={data.primaryError}
          primaryEmptyTitle={data.primaryTitle}
          secondaryPanel={data.secondaryPanel}
          secondaryStatus={data.secondaryStatus}
          secondaryError={data.secondaryError}
          secondaryEmptyTitle={data.secondaryTitle}
          bodyStageClass={data.bodyStageClass}
        />
      ) : null}
    </WorkspaceShell>
  );
}
