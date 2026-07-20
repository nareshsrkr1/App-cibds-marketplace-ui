import type { NavGroup } from '../../components/layout/WorkspaceShell/nav.types';

export type { NavGroup, NavItem } from '../../components/layout/WorkspaceShell/nav.types';

export type WorkspaceNavResponse = {
  persona: string;
  groups: NavGroup[];
};
