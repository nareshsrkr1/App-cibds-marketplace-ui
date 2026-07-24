import { setupServer } from 'msw/node';
import { landingHandlers } from './handlers/landing.handlers';
import { workspaceHandlers } from './handlers/workspace.handlers';

export const server = setupServer(...landingHandlers, ...workspaceHandlers);
