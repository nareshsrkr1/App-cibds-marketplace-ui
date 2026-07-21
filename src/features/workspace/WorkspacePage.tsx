import { useEffect, useMemo, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { ErrorState } from '../../components/feedback/ErrorState/ErrorState';
import { WorkspaceShell } from '../../components/layout/WorkspaceShell/WorkspaceShell';
import type { NavGroup } from '../../components/layout/WorkspaceShell/nav.types';
import type { PersonaOption } from '../../components/persona/PersonaSelector/PersonaSelector';
import { useSession } from '../session/SessionProvider';
import { ALL_PERSONAS, type SessionContext } from '../session/session.types';
import { useConsoleData } from './useConsoleData';
import { activeNavIdForPath, pathForNavId } from './workspaceRoutes';

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

function withRouteActive(groups: NavGroup[], pathname: string): NavGroup[] {
  const activeId = activeNavIdForPath(pathname);
  return groups.map((g) => ({
    ...g,
    items: g.items.map((it) => ({
      ...it,
      active: it.id === activeId,
    })),
  }));
}

export function WorkspacePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    session,
    status: sessionStatus,
    error: sessionError,
    reload: reloadSession,
  } = useSession();
  const [persona, setPersona] = useState('PRODUCER');
  const [consoleReloadToken, setConsoleReloadToken] = useState(0);

  useEffect(() => {
    if (sessionStatus === 'ready' && session?.defaultPersona) {
      setPersona(session.defaultPersona);
    }
  }, [sessionStatus, session]);

  const data = useConsoleData(persona, sessionStatus === 'ready', consoleReloadToken);

  const handlePersonaChange = (next: string) => {
    if (next === persona) return;
    setPersona(next);
    // Persona-specific deep screens start with console until those personas get routes.
    if (location.pathname !== '/workspace') {
      navigate('/workspace');
    }
  };

  const handleNavSelect = (id: string) => {
    const path = pathForNavId(id);
    if (path) navigate(path);
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

  const navGroups = useMemo(
    () => withRouteActive(data.navGroups, location.pathname),
    [data.navGroups, location.pathname],
  );

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

  return (
    <WorkspaceShell
      personas={personas}
      activePersonaId={persona}
      onPersonaChange={handlePersonaChange}
      userInitials={session.user.initials}
      userName={session.user.displayName}
      userSubtitle={userSubtitle}
      navGroups={navGroups}
      navStatus={data.navStatus}
      navRefreshing={data.navRefreshing}
      onNavSelect={handleNavSelect}
    >
      <Outlet
        context={{
          persona,
          data,
          reloadConsole: () => setConsoleReloadToken((n) => n + 1),
          onAction: handleNavSelect,
        }}
      />
    </WorkspaceShell>
  );
}

export type WorkspaceOutletContext = {
  persona: string;
  data: ReturnType<typeof useConsoleData>;
  reloadConsole: () => void;
  onAction: (id: string) => void;
};
