export type NavItem = {
  id: string;
  label: string;
  icon?: string;
  enabled: boolean;
  active?: boolean;
  badge?: string;
};

export type NavGroup = {
  id: string;
  label: string;
  sub?: boolean;
  items: NavItem[];
};

export type WorkspaceNavResponse = {
  persona: string;
  groups: NavGroup[];
};
