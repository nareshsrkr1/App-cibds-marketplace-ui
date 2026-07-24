/** Stable workspace view routes keyed by nav / hero action ids. */
export const WORKSPACE_ROUTES = {
  console: '/workspace',
  register: '/workspace/register-physical-dataset',
  bulkpde: '/workspace/bulk-upload-pdes',
  bind: '/workspace/bind-columns',
  /** Nav "Workflow" and hero "Track workflow" share this route. */
  workflow: '/workspace/workflow',
  phys: '/workspace/physical-datasets',
} as const;

export type WorkspaceNavId = keyof typeof WORKSPACE_ROUTES;

export function pathForNavId(id: string): string | null {
  if (id in WORKSPACE_ROUTES) {
    return WORKSPACE_ROUTES[id as WorkspaceNavId];
  }
  return null;
}

/** Which nav item should show as active for the current pathname. */
export function activeNavIdForPath(pathname: string): string {
  if (pathname.startsWith(WORKSPACE_ROUTES.workflow)) return 'workflow';
  if (pathname.startsWith(WORKSPACE_ROUTES.bind)) return 'bind';
  if (pathname.startsWith(WORKSPACE_ROUTES.bulkpde)) return 'bulkpde';
  if (pathname.startsWith(WORKSPACE_ROUTES.register)) return 'register';
  if (pathname.startsWith(WORKSPACE_ROUTES.phys)) return 'phys';
  return 'console';
}
