import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  PersonaSelector,
  type PersonaOption,
} from '../../persona/PersonaSelector/PersonaSelector';
import { ConsoleSidebar } from './ConsoleSidebar';
import type { NavGroup } from './nav.types';

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
  children,
}: WorkspaceShellProps) {
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
        <PersonaSelector
          personas={personas}
          activePersonaId={activePersonaId}
          onChange={onPersonaChange}
        />
        <ConsoleSidebar
          groups={navGroups}
          status={navStatus}
          refreshing={navRefreshing}
        />
        <div className="sb-foot">
          <div className="sb-user">
            <span className="sb-av">{userInitials}</span>
            <div>
              <div className="sb-un">{userName}</div>
              {userSubtitle ? (
                <div key={userSubtitle} className="sb-ur sb-ur--fade">
                  {userSubtitle}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </aside>
      <div className="sh-main">{children}</div>
    </div>
  );
}
