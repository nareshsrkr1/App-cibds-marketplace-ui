import { createContext, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import type { PersonaOption } from '../../persona/PersonaSelector/PersonaSelector';
import { ConsoleSidebar } from './ConsoleSidebar';
import { WorkspaceTopbar } from './WorkspaceTopbar';
import type { NavGroup } from '../../../features/workspace/nav.types';

/**
 * DOM node inside the topbar that a page's ConsoleHeader can portal its
 * eyebrow/subtitle into, so the page title sits inline with the user chip
 * instead of in its own hero block. Null until the topbar has mounted.
 */
export const WorkspaceHeaderSlotContext = createContext<HTMLDivElement | null>(null);

export type WorkspaceShellProps = {
  personas: PersonaOption[];
  activePersonaId: string;
  onPersonaChange?: (personaId: string) => void;
  userInitials: string;
  userName: string;
  userSubtitle?: string;
  navGroups: NavGroup[];
  navStatus?: 'loading' | 'ready' | 'error';
  navRefreshing?: boolean;
  onNavSelect?: (id: string) => void;
  children: ReactNode;
};

export function WorkspaceShell({
  personas,
  activePersonaId,
  onPersonaChange,
  userInitials,
  userName,
  userSubtitle,
  navGroups,
  navStatus = 'ready',
  navRefreshing = false,
  onNavSelect,
  children,
}: WorkspaceShellProps) {
  const [titleSlot, setTitleSlot] = useState<HTMLDivElement | null>(null);
  return (
    <div className="appshell show" data-testid="workspace-shell">
      <aside className="sb" aria-label="Workspace sidebar">
        <Link to="/" className="sb-brand">
          <span className="sb-mk">C</span>
          <div>
            <div className="sb-bn">CIB Data Services</div>
            <div className="sb-bs">Data Marketplace</div>
          </div>
        </Link>
        <ConsoleSidebar
          groups={navGroups}
          status={navStatus}
          refreshing={navRefreshing}
          onSelect={onNavSelect}
        />
      </aside>
      <div className="sh-col">
        <WorkspaceTopbar
          personas={personas}
          activePersonaId={activePersonaId}
          onPersonaChange={onPersonaChange}
          userInitials={userInitials}
          userName={userName}
          userSubtitle={userSubtitle}
          titleSlotRef={setTitleSlot}
        />
        <WorkspaceHeaderSlotContext.Provider value={titleSlot}>
          <div className="sh-main">{children}</div>
        </WorkspaceHeaderSlotContext.Provider>
      </div>
    </div>
  );
}
