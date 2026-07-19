export type NavItem = {
  id: string;
  label: string;
  icon?: string;
  enabled: boolean;
  active?: boolean;
};

export type NavGroup = {
  id: string;
  label: string;
  sub?: boolean;
  items: NavItem[];
};

/** Producer nav from HTML SoT — only Console enabled for now. */
export const PRODUCER_NAV_GROUPS: NavGroup[] = [
  {
    id: 'workspace',
    label: 'Workspace',
    items: [
      { id: 'console', label: 'Console', icon: '◇', enabled: true, active: true },
      { id: 'bind', label: 'Bind columns', icon: '⇄', enabled: false },
      { id: 'addbde', label: 'Add a BDE', icon: '◆', enabled: false },
      { id: 'workflow', label: 'Workflow', icon: '↻', enabled: false },
    ],
  },
  {
    id: 'mydata',
    label: 'My data',
    sub: true,
    items: [
      { id: 'mydatasets', label: 'My datasets', enabled: false },
      { id: 'mybindings', label: 'My bindings', enabled: false },
      { id: 'proposed', label: 'Proposed elements', enabled: false },
    ],
  },
  {
    id: 'catalogue',
    label: 'Catalogue',
    sub: true,
    items: [
      { id: 'phys', label: 'Physical datasets', enabled: false },
      { id: 'log', label: 'Logical model', enabled: false },
      { id: 'bt', label: 'Business terms', enabled: false },
    ],
  },
  {
    id: 'intelligence',
    label: 'Intelligence',
    items: [
      { id: 'search', label: 'Explore catalog', icon: '⌕', enabled: false },
      { id: 'lineage', label: 'Lineage explorer', icon: '↳', enabled: false },
      { id: 'gaps', label: 'Coverage & gaps', icon: '◐', enabled: false },
    ],
  },
];

/** Admin nav kept for future persona switch. */
export const ADMIN_NAV_GROUPS: NavGroup[] = [
  {
    id: 'workspace',
    label: 'Workspace',
    items: [
      { id: 'console', label: 'Console', icon: '◇', enabled: true, active: true },
      { id: 'register', label: 'Register a dataset', icon: '⊕', enabled: false },
      { id: 'bulkpde', label: 'Bulk upload PDEs', icon: '⇣', enabled: false },
      { id: 'bind', label: 'Bind columns', icon: '⇄', enabled: false },
      { id: 'workflow', label: 'Workflow', icon: '↻', enabled: false },
    ],
  },
  {
    id: 'governance',
    label: 'Governance',
    items: [
      { id: 'govqueue', label: 'Endorsement queue', icon: '✓', enabled: false },
      { id: 'addbde', label: 'Add a BDE', enabled: false },
      { id: 'bulkbde', label: 'Bulk upload BDEs', enabled: false },
      { id: 'addterm', label: 'Add a business term', enabled: false },
      { id: 'bulkterm', label: 'Bulk upload terms', enabled: false },
    ],
  },
  {
    id: 'catalogue',
    label: 'Catalogue',
    sub: true,
    items: [
      { id: 'phys', label: 'Physical datasets', enabled: false },
      { id: 'log', label: 'Logical model', enabled: false },
      { id: 'bt', label: 'Business terms', enabled: false },
    ],
  },
  {
    id: 'intelligence',
    label: 'Intelligence',
    items: [
      { id: 'search', label: 'Explore catalog', icon: '⌕', enabled: false },
      { id: 'lineage', label: 'Lineage explorer', icon: '↳', enabled: false },
      { id: 'gaps', label: 'Coverage & gaps', icon: '◐', enabled: false },
    ],
  },
  {
    id: 'admin',
    label: 'Admin',
    items: [
      { id: 'adminreg', label: 'Registry', icon: '☷', enabled: false },
      { id: 'adminaudit', label: 'Audit log', icon: '≡', enabled: false },
    ],
  },
];

const FUTURE = 'Available in a future release';

export function navGroupsForPersona(persona: string): NavGroup[] {
  return persona.toUpperCase() === 'ADMIN' ? ADMIN_NAV_GROUPS : PRODUCER_NAV_GROUPS;
}

export type ConsoleSidebarProps = {
  persona?: string;
  groups?: NavGroup[];
};

export function ConsoleSidebar({
  persona = 'PRODUCER',
  groups,
}: ConsoleSidebarProps) {
  const resolved = groups ?? navGroupsForPersona(persona);
  return (
    <nav className="sb-nav" aria-label="Workspace">
      {resolved.map((g) => (
        <div key={g.id} className={`sb-group${g.sub ? ' sub' : ''}`}>
          <div className="sb-gl">{g.label}</div>
          {g.items.map((it) => (
            <button
              key={it.id}
              type="button"
              className={`sb-item${it.active ? ' on' : ''}${it.enabled ? '' : ' is-disabled'}`}
              disabled={!it.enabled}
              title={it.enabled ? it.label : FUTURE}
              aria-label={it.label}
              aria-current={it.active ? 'page' : undefined}
            >
              {it.icon ? (
                <span className="sb-ic" aria-hidden="true">
                  {it.icon}
                </span>
              ) : null}
              <span className="sb-it-l">{it.label}</span>
            </button>
          ))}
        </div>
      ))}
    </nav>
  );
}
